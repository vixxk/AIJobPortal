import whisper
import subprocess
import os
import tempfile
import logging

logger = logging.getLogger(__name__)

# Load model lazily
model = None


def _convert_to_wav(input_path: str) -> str:
    """
    Convert any audio format to a 16kHz mono WAV that Whisper handles best.
    Returns the path to the converted file (caller is responsible for cleanup).
    """
    out_fd, out_path = tempfile.mkstemp(suffix=".wav")
    os.close(out_fd)

    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ar", "16000",
        "-ac", "1",
        "-f", "wav",
        out_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        logger.warning(f"ffmpeg conversion failed: {result.stderr}. Using original file.")
        os.unlink(out_path)
        return input_path  # fall back to original

    return out_path


def get_transcription(file_path: str) -> str:
    """
    Transcribe audio file to text using OpenAI Whisper.
    Handles webm/ogg/mp4 etc. by converting to WAV first via ffmpeg.
    """
    global model
    if model is None:
        logger.info("Loading Whisper model (base)...")
        model = whisper.load_model("base")
        logger.info("Whisper model loaded.")

    converted_path = _convert_to_wav(file_path)
    converted = converted_path != file_path  # did we create a new file?

    try:
        # Avoid FP16 warning on CPU
        result = model.transcribe(converted_path, fp16=False)
        text = result.get("text", "").strip()
        segments = result.get("segments", [])
        
        # Calculate clarity/confidence from avg_logprob
        # avg_logprob usually ranges from 0 (perfect) to -3 (poor)
        if segments:
            avg_logprobs = [s.get("avg_logprob", -3.0) for s in segments]
            mean_logprob = sum(avg_logprobs) / len(avg_logprobs)
            # Map -3.0...0.0 to 0...100
            confidence = max(0, min(100, (1 - abs(mean_logprob) / 2.0) * 100))
        else:
            confidence = 0.0
            
        return {
            "text": text,
            "confidence": round(confidence, 2)
        }
    finally:
        if converted and os.path.exists(converted_path):
            os.unlink(converted_path)
