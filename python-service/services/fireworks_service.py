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
    2. Suggested Start Level (1-5) based on proficiency:
       - Level 1: A1 (Beginner)
       - Level 2: A2 (Elementary)
       - Level 3: B1 (Intermediate)
       - Level 4: B2 (Upper-Intermediate)
       - Level 5: C1+ (Advanced)
    3. Detailed feedback per task.
    4. Identify "missing words" (words from the prompt that were NOT in the transcript).
    5. Provide scores (0-10) for: Fluency, Vocabulary, Grammar, Pronunciation.
    
    Return ONLY a JSON object:
    {
      "overall_cefr": "...",
      "suggested_level": 1-5,
      "scores": { "fluency": 0, "vocabulary": 0, "grammar": 0, "pronunciation": 0 },
      "analysis": "...",
      "detailed_breakdown": [
        { "task_name": "...", "feedback": "...", "missing_words": [...] }
      ]
    }"""
    return await _call_fireworks(system_prompt, f"Evaluate proficiency test: {tasks_text}")

DIFFICULTY_LEVELS = {
    1: "Absolute Beginner (A1) - Simple greetings, personal info, numbers, basic colors.",
    2: "Beginner (A1) - Daily routines, family, shopping, basic food.",
    3: "Elementary (A2) - Travel, hobbies, simple past events, describing people.",
    4: "Pre-Intermediate (A2+) - Work, health, future plans, basic comparisons.",
    5: "Intermediate (B1) - Opinions, life experiences, environmental issues, news.",
    6: "Upper-Intermediate (B1+) - Cultural differences, technology, complex social issues.",
    7: "Advanced (B2) - Professional debates, abstract concepts, storytelling with nuances.",
    8: "Upper-Advanced (B2+) - Idiomatic expressions, sarcasm, formal presentation skills.",
    9: "Expert (C1) - Academic lectures, complex literature analysis, legal/professional English.",
    10: "Master (C2) - Near-native fluency, specialized philosophy, high-level scientific discourse."
}

async def generate_lesson_content(level: int, lesson_index: int) -> dict:
    difficulty = DIFFICULTY_LEVELS.get(level, DIFFICULTY_LEVELS[1])
    system_prompt = f"""You are an educational content creator for an AI English Tutor.
    Create a targeted Lesson for Level {level} (Index {lesson_index}).
    Difficulty Target: {difficulty}
    
    Format:
    1. Title: Engaging lesson title.
    2. Story/Dialogue: A short text (50-100 words) for reading/listening.
    3. Words to Learn: 3-5 vocabulary words relevant to the level.
    4. Tasks: 3 interactive tasks:
       - Task 1: "repeat" - Pronunciation practice (Sentences from the story).
       - Task 2: "question" - Comprehension or situational question.
       - Task 3: "free_speech" - Open-ended discussion or roleplay prompt.
       
    CRITICAL QUALITY GUIDELINES:
    - ALL sentences, stories, dialogues, and dialogue lines MUST sound expressive, fluid, and extremely natural when spoken aloud by a Text-to-Speech engine.
    - NEVER use robotic, stilted, or unnaturally disjointed framing (e.g., instead of "Tom is red. Emma is blue. Tom is 5.", use realistic conversational connectivity: "Hi there! I'm Tom and this is my little sister Emma. I'm wearing my favorite red jacket today!").
    - Write content that feels like a real human speaking in a casual or contextual environment, with natural conversational flow, connectors, and expressive tone.
    
    Return ONLY a JSON object with:
    {{
      "title": "...",
      "content": "...",
      "vocabulary": [{{"word": "...", "definition": "..."}}],
      "tasks": [
        {{ "id": 1, "type": "repeat", "prompt": "...", "text_to_repeat": "..." }},
        {{ "id": 2, "type": "question", "prompt": "...", "correct_answer_hint": "..." }},
        {{ "id": 3, "type": "free_speech", "prompt": "..." }}
      ]
    }}"""
    return await _call_fireworks(system_prompt, f"Create Level {level} Lesson Content")

async def evaluate_lesson_task(task_type: str, transcript: str, metrics: dict, context: dict) -> dict:
    system_prompt = f"""Evaluate a student's spoken English response for a '{task_type}' task.
    Context (Original Prompt/Text): {json.dumps(context)}
    Audio Metrics: {json.dumps(metrics)}
    
    Goals:
    - If task is 'repeat', check accuracy against 'text_to_repeat'.
    - If task is 'question', check relevance and grammar.
    - If task is 'free_speech', check fluency and vocabulary usage.
    
    Return ONLY a JSON object:
    {{
      "scores": {{
        "overall": 0,
        "fluency": 0,
        "grammar": 0,
        "vocabulary": 0,
        "pronunciation": 0
      }},
      "feedback": "Encouraging and constructive feedback",
      "corrections": "Specific grammar or pronunciation corrections",
      "error_tags": ["grammar", "pronunciation", "vocabulary", "fluency"],
      "missing_words": ["Words from prompt that were skipped"],
      "pronunciation_tip": "One specific tip for improvement"
    }}"""
    return await _call_fireworks(system_prompt, f"User transcript: {transcript}")
