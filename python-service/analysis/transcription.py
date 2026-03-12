from faster_whisper import WhisperModel
import subprocess
import os
import tempfile
import logging

logger = logging.getLogger(__name__)

model = None

def _convert_to_wav(input_path: str) -> str:
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
        return input_path

    return out_path

def get_transcription(file_path: str) -> dict:
    global model
    if model is None:
        logger.info("Loading Faster Whisper model (tiny.en)...")
        # Run on CPU with int8 quantization for minimal RAM usage
        model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
        logger.info("Faster Whisper model loaded.")

    converted_path = _convert_to_wav(file_path)
    converted = converted_path != file_path

    try:
        # transcribe returns (segments, info)
        segments, info = model.transcribe(converted_path, beam_size=5)
        
        full_text = ""
        avg_logprobs = []
        
        for segment in segments:
            full_text += segment.text + " "
            avg_logprobs.append(segment.avg_logprob)

        text = full_text.strip()

        if avg_logprobs:
            mean_logprob = sum(avg_logprobs) / len(avg_logprobs)
            # Rough confidence calculation based on logprob
            confidence = max(0, min(100, (1 - abs(mean_logprob) / 2.0) * 100))
        else:
            confidence = 0.0

        return {
            "text": text,
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return {"text": "", "confidence": 0.0}
    finally:
        if converted and os.path.exists(converted_path):
            os.unlink(converted_path)
