import os
import shutil
import tempfile
import random
import logging
import json
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
    evaluate_speaking_test as ai_evaluate_speaking_test,
    generate_lesson_content as ai_generate_lesson_content,
    evaluate_lesson_task as ai_evaluate_lesson_task,
)

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

def _save_upload(upload_file: UploadFile) -> str:

    fd, path = tempfile.mkstemp(suffix=os.path.splitext(upload_file.filename)[1])
    with os.fdopen(fd, "wb") as tmp:
        shutil.copyfileobj(upload_file.file, tmp)
    return path

def _safe_remove(path: str):

    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.error(f"Error removing temp file {path}: {e}")

def _run_audio_analysis(file_path: str) -> dict:

    transcript_res = get_transcription(file_path)
    transcript = transcript_res.get("text", "")

    fillers = count_fillers(transcript)
    filler_details = get_filler_details(transcript)

    metrics = calculate_metrics(file_path)

    result = {
        "transcript": transcript,
        "filler_count": fillers,
        "filler_details": filler_details,
        **metrics
    }
    return result

def _extract_text_from_pdf(pdf_path: str) -> str:

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

@app.post("/api/tts")
async def text_to_speech(
    text: str = Form(...),
    voice: str = Form("en-US-AriaNeural"),
):

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

@app.post("/api/interview/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):

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

@app.post("/api/interview/start")
async def start_interview(
    job_role: str = Form(None),
    interview_type: str = Form("behavioral"),
    resume: UploadFile = File(None),
):

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

    temp_file = _save_upload(audio)
    try:
        logger.info(f"Processing audio for: {question[:60]}...")
        analysis = _run_audio_analysis(temp_file)

        return {
            "status": "success",
            "data": {
                "analysis": analysis,
                "evaluation": None,
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

    try:
        answers_dicts = [a.model_dump() for a in req.answers]

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
            # Update the prompt to be more strict about unanswered or skipped questions
            strict_system_prompt = f"""Generate a high-stakes performance scorecard for a {req.job_role or 'General'} interview.
            Synthesize the candidate's performance across all questions: {json.dumps(answers_dicts)}
            
            STRICT GUIDELINES:
            1. If a question has "skipped": true or an empty transcript/answer, the candidate MUST be heavily penalized for that specific question in the overall scoring.
            2. High weights on technical accuracy and communication.
            3. Detailed breakdown of strengths and weaknesses.
            4. If more than 50% of questions are skipped, the overall score should not exceed 40.
            
            Return ONLY a JSON object with:
            {{
              "overall_score": 0-100,
              "confidence_score": 0-100,
              "fluency_score": 0-100,
              "technical_accuracy": 0-100,
              "strengths": [...],
              "weaknesses": [...],
              "suggestions": [...]
            }}"""
            
            # Using the customized strict prompt instead of the generic one in fireworks_service
            from services.fireworks_service import _call_fireworks
            report_data = await _call_fireworks(strict_system_prompt, "Process interview results strictly.")

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

class SpeakingTestTask(BaseModel):
    task_name: str
    prompt: str
    transcript: str
    metrics: Optional[dict] = {}

class SpeakingTestRequest(BaseModel):
    responses: List[SpeakingTestTask]

@app.post("/api/tutor/evaluate-test")
async def evaluate_test(req: SpeakingTestRequest):
    try:
        logger.info(f"Evaluating speaking test with {len(req.responses)} responses")
        for i, resp in enumerate(req.responses):
            logger.info(f"Task {i+1} ({resp.task_name}) Transcript: '{resp.transcript}'")

        result = await ai_evaluate_speaking_test(responses=[r.model_dump() for r in req.responses])
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Speaking test evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tutor/generate-lesson")
async def get_lesson(level: int, lesson_index: int = 1):
    try:
        result = await ai_generate_lesson_content(level=level, lesson_index=lesson_index)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Lesson generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tutor/evaluate-task")
async def evaluate_task(
    task_type: str = Form(...),
    transcript: str = Form(""),
    context_json: str = Form("{}"),
    audio: UploadFile = File(None)
):
    temp_file = None
    try:
        metrics = {}
        final_transcript = transcript

        if audio:
            temp_file = _save_upload(audio)
            analysis = _run_audio_analysis(temp_file)
            final_transcript = analysis.get("transcript", "")
            metrics = analysis

        context = json.loads(context_json)

        result = await ai_evaluate_lesson_task(
            task_type=task_type,
            transcript=final_transcript,
            metrics=metrics,
            context=context
        )

        return {
            "status": "success",
            "data": {
                "evaluation": result,
                "transcript": final_transcript,
                "metrics": metrics
            }
        }
    except Exception as e:
        logger.error(f"Task evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file:
            _safe_remove(temp_file)

@app.post("/analyze-audio")
async def analyze_audio_compat(file: UploadFile = File(...)):

    temp_file = _save_upload(file)
    try:
        return _run_audio_analysis(temp_file)
    except Exception as e:
        logger.error(f"Audio analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        _safe_remove(temp_file)

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
