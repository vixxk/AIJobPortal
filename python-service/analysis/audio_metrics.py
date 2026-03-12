import librosa
import numpy as np
import logging
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module="librosa")
warnings.filterwarnings("ignore", category=FutureWarning, module="librosa")

logger = logging.getLogger(__name__)

def calculate_metrics(file_path: str) -> dict:

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        try:
            # Load with fixed sample rate to save memory and ensure consistency
            y, sr = librosa.load(file_path, sr=16000, mono=True)
        except Exception as e:
            logger.error(f"librosa load failed: {e}")
            return _fallback_metrics()

    if len(y) < 100:
        return _fallback_metrics()

    try:
        # yin is much faster than pyin for basic pitch metrics
        f0 = librosa.yin(
            y,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
            sr=sr
        )
        voiced_f0 = f0[f0 > 0]
        pitch_stability = float(np.std(voiced_f0)) if len(voiced_f0) > 0 else 0.0
        pitch_range = float(np.ptp(voiced_f0)) if len(voiced_f0) > 1 else 0.0
    except Exception as e:
        logger.warning(f"Pitch analysis failed: {e}")
        pitch_stability = 0.0
        pitch_range = 0.0

    rms = librosa.feature.rms(y=y)[0]
    energy = float(np.mean(rms))
    energy_variance = float(np.std(rms))

    intervals = librosa.effects.split(y, top_db=30)
    total_speech_samples = sum(end - start for start, end in intervals)
    total_samples = len(y)
    pause_samples = total_samples - total_speech_samples
    pause_ratio = float(pause_samples) / total_samples if total_samples > 0 else 0.0
    voice_breaks = max(0, len(intervals) - 1)

    long_pauses = 0
    if len(intervals) > 1:
        for i in range(len(intervals) - 1):
            pause_dur = (intervals[i+1][0] - intervals[i][1]) / sr
            if pause_dur > 2.0:
                long_pauses += 1

    try:
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        peaks = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, backtrack=False)
        duration_minutes = librosa.get_duration(y=y, sr=sr) / 60.0
        speech_rate = float(len(peaks)) / duration_minutes if duration_minutes > 0 else 0.0

        if len(peaks) > 2:
            onset_times = librosa.frames_to_time(peaks, sr=sr)
            intervals_onset = np.diff(onset_times)
            pace_stability = float(np.std(intervals_onset) / np.mean(intervals_onset))
        else:
            pace_stability = 0.0
    except Exception as e:
        logger.warning(f"Speech rate analysis failed: {e}")
        speech_rate = 0.0
        pace_stability = 0.0

    return {
        "pitch_stability": round(pitch_stability, 4),
        "pitch_range": round(pitch_range, 2),
        "speech_rate": round(speech_rate, 2),
        "pace_stability": round(pace_stability, 4),
        "pause_ratio": round(pause_ratio, 4),
        "long_pauses": long_pauses,
        "energy": round(energy, 6),
        "energy_variance": round(energy_variance, 6),
        "voice_breaks": int(voice_breaks),
    }

def _fallback_metrics() -> dict:

    return {
        "pitch_stability": 0.0,
        "pitch_range": 0.0,
        "speech_rate": 0.0,
        "pace_stability": 0.0,
        "pause_ratio": 0.0,
        "long_pauses": 0,
        "energy": 0.0,
        "energy_variance": 0.0,
        "voice_breaks": 0,
    }
