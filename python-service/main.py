"""
Python FastAPI service — AI Interview Backend (v2)
==================================================
All interview logic is self-contained here in Python.
All interview logic uses Fireworks AI for real-time question generation,
answer evaluation, and overall performance reporting.

Endpoints:
  POST /api/tts                  → Text-to-Speech (edge-tts)
  GET  /api/tts/voices           → List TTS voices
  POST /api/interview/start      → Generate interview questions
  POST /api/interview/evaluate   → STT + audio analysis + per-answer feedback
  POST /api/interview/transcribe → STT only (for AudioTest page)
  POST /api/interview/report     → Final performance report
  POST /analyze-audio            → Raw analysis (backwards compat)
  GET  /health                   → Health check
"""

import os
import shutil
import tempfile
import random
import logging
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import edge_tts
import pypdf
from dotenv import load_dotenv

from analysis.transcription import get_transcription
from analysis.filler_detection import count_fillers, get_filler_details
from analysis.audio_metrics import calculate_metrics

from services.fireworks_service import (
    generate_questions_v2,
    evaluate_answer as ai_evaluate_answer,
    generate_report as ai_generate_report,
)


# ── Bootstrap ────────────────────────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Interview Python Service",
    description="Speech analysis, TTS, STT, and mock interview logic.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ──────────────────────────────────────────────────────────────────

def _save_upload(upload_file: UploadFile) -> str:
    """Save an UploadFile to a temporary local file."""
    fd, path = tempfile.mkstemp(suffix=os.path.splitext(upload_file.filename)[1])
    with os.fdopen(fd, "wb") as tmp:
        shutil.copyfileobj(upload_file.file, tmp)
    return path


def _safe_remove(path: str):
    """Safely delete a file."""
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.error(f"Error removing temp file {path}: {e}")


def _run_audio_analysis(file_path: str) -> dict:
    """
    Run the full analysis pipeline:
    1. transcription (Whisper)
    2. filler detection
    3. audio metrics (librosa)
    """
    # 1. Get Transcript
    transcript_res = get_transcription(file_path)
    transcript = transcript_res.get("text", "")

    # 2. Filler word analysis
    fillers = count_fillers(transcript)
    filler_details = get_filler_details(transcript)

    # 3. Audio & technical metrics
    metrics = calculate_metrics(file_path)

    # Combined result
    result = {
        "transcript": transcript,
        "filler_count": fillers,
        "filler_details": filler_details,
        **metrics
    }
    return result


def _extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file using pypdf."""
    text = ""
    try:
        with open(pdf_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
    return text.strip()


# (Removed internal mock logic - now handled by services.fireworks_service)



# ── TTS Endpoints ────────────────────────────────────────────────────────────

@app.post("/api/tts")
async def text_to_speech(
    text: str = Form(...),
    voice: str = Form("en-US-AriaNeural"),
):
    """Convert text to speech using Microsoft Azure Neural voices via edge-tts."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        communicate = edge_tts.Communicate(text, voice)
        fd, tmp_path = tempfile.mkstemp(suffix=".mp3")
        os.close(fd)
        await communicate.save(tmp_path)

        def iterfile():
            with open(tmp_path, "rb") as f:
                yield from f
            _safe_remove(tmp_path)

        return StreamingResponse(iterfile(), media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@app.get("/api/tts/voices")
async def list_voices():
    try:
        voices = await edge_tts.list_voices()
        return {"status": "success", "data": {"voices": voices}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── STT Endpoint ─────────────────────────────────────────────────────────────

@app.post("/api/interview/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    STT only — transcribe audio with Whisper.
    Used by the AudioTest diagnostics page.
    """
    temp_file = _save_upload(audio)
    try:
        stt_result = get_transcription(temp_file)
        transcript = stt_result.get("text", "")
        filler_info = get_filler_details(transcript)
        return {
            "status": "success",
            "data": {
                "analysis": {
                    "transcript": transcript,
                    "confidence": stt_result.get("confidence", 0),
                    "filler_count": filler_info["total"],
                    "filler_breakdown": filler_info["breakdown"],
                }
            },
        }
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        _safe_remove(temp_file)


# ── Interview Flow Endpoints ──────────────────────────────────────────────────

@app.post("/api/interview/start")
async def start_interview(
    job_role: str = Form(None),
    interview_type: str = Form("behavioral"),
    resume: UploadFile = File(None),
):
    """
    Check if role is clear. If yes, return 5 questions.
    If yes and resume provided, questions will be tailored to resume.
    """
    resume_text = ""
    temp_resume = None
    if resume and resume.filename:
        temp_resume = _save_upload(resume)
        try:
            resume_text = _extract_text_from_pdf(temp_resume)
            logger.info(f"Extracted {len(resume_text)} chars from resume: {resume.filename}")
        except Exception as e:
            logger.error(f"Resume extraction failed: {e}")
        finally:
            _safe_remove(temp_resume)

    try:
        # Generate real AI questions and check role clarity
        result = await generate_questions_v2(
            job_role=job_role or "Software Engineer",
            interview_type=interview_type or "behavioral",
            resume_text=resume_text
        )

        if not result.get("role_clear", True):
            logger.info(f"Interview start failed: unclear role '{job_role}'")
            return {
                "status": "success",
                "data": {
                    "role_clear": False,
                    "suggestions": result.get("suggestions", [])
                }
            }

        logger.info(f"Interview started: role={job_role}, 5 questions generated")
        return {
            "status": "success",
            "data": {
                "role_clear": True,
                "questions": result.get("questions", [])
            }
        }
    except Exception as e:
        import traceback
        logger.error(f"FATAL ERROR in start_interview: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Interview initiation failed: {str(e)}"
        )



@app.post("/api/interview/process-audio")
async def process_audio(
    question: str = Form(...),
    job_role: str = Form(None),
    audio: UploadFile = File(...),
):
    """
    Lightweight audio processing:
      1. Whisper STT → transcript
      2. librosa → audio quality metrics
    DOES NOT call Fireworks AI (latency optimization).
    """
    temp_file = _save_upload(audio)
    try:
        logger.info(f"Processing audio for: {question[:60]}...")
        analysis = _run_audio_analysis(temp_file)
        
        return {
            "status": "success",
            "data": {
                "analysis": analysis,
                "evaluation": None, # Defer evaluation to report phase
            },
        }
    except Exception as e:
        logger.error(f"Process audio error: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    finally:
        _safe_remove(temp_file)


@app.post("/api/interview/evaluate")
async def evaluate_answer(
    question: str = Form(...),
    job_role: str = Form(None),
    audio: UploadFile = File(...),
):
    """
    Full answer evaluation:
      1. Whisper STT → transcript
      2. librosa → audio quality metrics
      3. AI evaluation
    """
    temp_file = _save_upload(audio)
    try:
        logger.info(f"Evaluating answer for: {question[:60]}...")
        analysis = _run_audio_analysis(temp_file)
        
        evaluation = await ai_evaluate_answer(
            question=question,
            transcript=analysis.get("transcript", ""),
            metrics=analysis,
            job_role=job_role
        )

        return {
            "status": "success",
            "data": {
                "analysis": analysis,
                "evaluation": evaluation,
            },
        }

    except Exception as e:
        logger.error(f"Evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
    finally:
        _safe_remove(temp_file)


# ── Report ────────────────────────────────────────────────────────────────────

class AnswerItem(BaseModel):
    question: str
    answer: Optional[str] = ""
    transcript: Optional[str] = ""
    evaluation: Optional[dict] = None
    analysis: Optional[dict] = None


class ReportRequest(BaseModel):
    answers: List[AnswerItem]
    job_role: Optional[str] = None


@app.post("/api/interview/report")
async def generate_report(req: ReportRequest):
    """
    Generate a final performance report from all answers.
    Aggregates per-answer scores into an overall scorecard.
    """
    try:
        answers_dicts = [a.model_dump() for a in req.answers]
        
        # Check if there is any actual content in the answers
        has_content = any(
            (a.get("transcript") or "").strip() or (a.get("answer") or "").strip() 
            for a in answers_dicts
        )

        if not has_content:
            report_data = {
                "overall_score": 0,
                "confidence_score": 0,
                "fluency_score": 0,
                "technical_accuracy": 0,
                "strengths": [],
                "weaknesses": ["No verbal or written answers were provided for the generated questions."],
                "suggestions": ["To receive a performance evaluation, please ensure you answer the questions during the session."]
            }
        else:
            # Real AI report analysis
            report_data = await ai_generate_report(answers=answers_dicts, job_role=req.job_role or "")
        
        # Process and aggregate audio metrics for UI display
        speech_rates = []
        filler_counts = []
        pause_ratios = []
        clarity_scores = []
        energy_variances = []
        long_pause_counts = []

        for ans in answers_dicts:
            an = ans.get("analysis") or {}
            if "speech_rate" in an: speech_rates.append(an["speech_rate"])
            if "filler_count" in an: filler_counts.append(an["filler_count"])
            if "pause_ratio" in an: pause_ratios.append(an["pause_ratio"])
            if "confidence" in an: clarity_scores.append(an["confidence"])
            if "energy_variance" in an: energy_variances.append(an["energy_variance"])
            if "long_pauses" in an: long_pause_counts.append(an["long_pauses"])

        report_data["audio_metrics"] = {
            "avg_speech_rate": round(sum(speech_rates)/len(speech_rates), 1) if speech_rates else 0,
            "total_filler_words": sum(filler_counts) if filler_counts else 0,
            "avg_pause_ratio": round(sum(pause_ratios)/len(pause_ratios), 2) if pause_ratios else 0,
            "avg_clarity": round(sum(clarity_scores)/len(clarity_scores), 1) if clarity_scores else 0,
            "avg_modulation": round(sum(energy_variances)/len(energy_variances), 4) if energy_variances else 0,
            "total_long_pauses": sum(long_pause_counts) if long_pause_counts else 0,
        }

        logger.info(f"AI Report generated: overall={report_data.get('overall_score')}")
        return {"status": "success", "data": report_data}

    except Exception as e:
        logger.error(f"Report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Backwards Compatibility ───────────────────────────────────────────────────

@app.post("/analyze-audio")
async def analyze_audio_compat(file: UploadFile = File(...)):
    """Raw audio analysis — kept for compatibility with Node.js python.service.js."""
    temp_file = _save_upload(file)
    try:
        return _run_audio_analysis(temp_file)
    except Exception as e:
        logger.error(f"Audio analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        _safe_remove(temp_file)


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "AI Interview Python Service",
        "version": "2.1.0",
        "mode": "production (Fireworks AI enabled)",
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
