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
    system_prompt = f
    return await _call_fireworks(system_prompt, f"Generate {interview_type} questions for {job_role}")

async def evaluate_answer(question: str, transcript: str, metrics: dict, job_role: str) -> dict:
    system_prompt = f"Evaluate technical accuracy and communication for {job_role}. Return JSON."
    return await _call_fireworks(system_prompt, f"Question: {question}, Answer: {transcript}")

async def generate_report(answers: list, job_role: str) -> dict:
    system_prompt = f"Generate final performance scorecard for {job_role}. Return JSON."
    return await _call_fireworks(system_prompt, "Synthesize results")

async def evaluate_speaking_test(responses: list) -> dict:

    tasks_text = json.dumps(responses, indent=2)

    system_prompt =
    return await _call_fireworks(system_prompt, f"Evaluate this proficiency test. provide deep linguistic analysis: {tasks_text}")

async def generate_lesson_content(level: int, lesson_index: int) -> dict:

    system_prompt = f
    return await _call_fireworks(system_prompt, f"Create a Level {level} English Lesson (Index {lesson_index})")

async def evaluate_lesson_task(task_type: str, transcript: str, metrics: dict, context: dict) -> dict:

    system_prompt = f
    return await _call_fireworks(system_prompt, f"User response: {transcript}")
