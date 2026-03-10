import os
import json
import random
import logging
import httpx
import re

logger = logging.getLogger(__name__)

FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/chat/completions"
FIREWORKS_MODEL = "accounts/fireworks/models/qwen3-8b"

def _get_api_key() -> str:
    key = os.getenv("FIREWORKS_API_KEY", "")
    if not key:
        logger.error("FIREWORKS_API_KEY not set — AI features are disabled.")
    return key

async def _call_fireworks(system_prompt: str, user_prompt: str) -> dict:
    api_key = _get_api_key()
    if not api_key:
        raise ValueError("FIREWORKS_API_KEY not configured")

    payload = {
        "model": FIREWORKS_MODEL,
        "max_tokens": 2048,
        "temperature": 0.7,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(FIREWORKS_API_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    raw_content = data["choices"][0]["message"]["content"]

    cleaned = re.sub(r'<think>.*?</think>', '', raw_content, flags=re.DOTALL).strip()
    match = re.search(r'(\{.*\})', cleaned, re.DOTALL)
    if match:
        json_str = match.group(1)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Soft JSON parse failed on: {json_str[:100]}...")
            raise e

    return json.loads(cleaned)

async def generate_questions_v2(job_role: str, interview_type: str, resume_text: str = "") -> dict:
    system_prompt = f"""You are an expert interviewer for a {job_role} position.
    Generate 5 high-quality {interview_type} interview questions.
    {f"Candidate's Resume Context: {resume_text}" if resume_text else ""}
    
    Guidelines:
    - Mix difficulty levels (easy, medium, hard).
    - If a resume is provided, personalize at least 2 questions to their experience.
    - Return ONLY a JSON object with:
    {{
      "role_clear": true,
      "questions": [
        {{ "id": 1, "question": "...", "difficulty": "...", "topic": "..." }}
      ]
    }}
    If the job role is nonsense, return "role_clear": false and suggestions for valid roles."""
    return await _call_fireworks(system_prompt, f"Generate {interview_type} questions for {job_role}")

async def evaluate_answer(question: str, transcript: str, metrics: dict, job_role: str) -> dict:
    system_prompt = f"""You are an expert evaluator for {job_role} interviews.
    Evaluate the candidate's answer for technical accuracy, communication skill, and relevance.
    Audio Metrics provided: {json.dumps(metrics)}
    
    Return ONLY a JSON object with:
    {{
      "answer_score": 0-100,
      "communication_score": 0-100,
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "suggestions": ["..."]
    }}"""
    return await _call_fireworks(system_prompt, f"Question: {question}, Answer: {transcript}")

async def generate_report(answers: list, job_role: str) -> dict:
    system_prompt = f"""Generate a final performance scorecard for a {job_role} interview.
    Synthesize the candidate's performance across all questions: {json.dumps(answers)}
    
    Calculate overall scores and provide strategic advice.
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
    return await _call_fireworks(system_prompt, "Synthesize results and generate final evaluation.")

async def evaluate_speaking_test(responses: list) -> dict:
    tasks_text = json.dumps(responses, indent=2)
    system_prompt = """You are a professional CEFR English examiner. Analyze several spoken responses.
    
    Evaluation Rubric:
    1. Overall CEFR Level (A1-C2).
    2. Detailed feedback per task.
    3. Identify "missing words" (words from the prompt that were NOT in the transcript).
    4. Provide pronunciation and grammar scores (0-10).
    
    Return ONLY a JSON object:
    {
      "overall_cefr": "...",
      "scores": { "fluency": 0, "vocabulary": 0, "grammar": 0, "pronunciation": 0 },
      "analysis": "...",
      "detailed_breakdown": [
        { "task_name": "...", "feedback": "...", "missing_words": [...] }
      ]
    }"""
    return await _call_fireworks(system_prompt, f"Evaluate proficiency test: {tasks_text}")

async def generate_lesson_content(level: int, lesson_index: int) -> dict:
    system_prompt = f"""Create a targeted Level {level} English lesson.
    Include a short story/dialogue and 3 interactive tasks (Repeating, Question, or Vocabulary).
    Return ONLY a JSON object with 'title', 'content', and 'tasks' (list)."""
    return await _call_fireworks(system_prompt, f"Create Level {level} Lesson (Index {lesson_index})")

async def evaluate_lesson_task(task_type: str, transcript: str, metrics: dict, context: dict) -> dict:
    system_prompt = f"""Evaluate student response for task type: {task_type}.
    Context: {json.dumps(context)}
    Identify errors and provide a 'score', 'feedback', and 'missing_words'.
    Return ONLY a JSON object."""
    return await _call_fireworks(system_prompt, f"User response: {transcript}")
