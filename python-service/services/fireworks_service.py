"""
Fireworks AI service — Python port of the Node.js fireworks.service.js
All interview AI logic (question generation, answer evaluation, report generation)
is handled here using the Fireworks AI chat completion API.
"""

import os
import json
import random
import logging
import httpx

logger = logging.getLogger(__name__)

FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/chat/completions"
FIREWORKS_MODEL = "accounts/fireworks/models/qwen3-8b"


def _get_api_key() -> str:
    key = os.getenv("FIREWORKS_API_KEY", "")
    if not key:
        logger.error("FIREWORKS_API_KEY not set — AI features are disabled.")
    return key


async def _call_fireworks(system_prompt: str, user_prompt: str) -> dict:
    """
    Make an async call to Fireworks AI chat completion.
    Returns parsed JSON dict from the assistant message.
    Raises on HTTP or JSON parse errors.
    """
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
    
    # 🩹 Robust Extraction: Qwen-3 often includes <think>...</think> or extra text.
    # We strip <think> blocks and then find the first '{' and last '}'
    import re
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


# ────────────────────────────────────────────────────────────────────────────────
# Question Generation
# ────────────────────────────────────────────────────────────────────────────────

async def generate_questions_v2(job_role: str, interview_type: str, resume_text: str = "") -> dict:
    """
    Generate 5 interview questions tailored to the job role and resume.
    ALSO: First checks if the job role is clear/valid.
    """
    logger.info(f"GENERATE_QUESTIONS_V2 called for role: {job_role}")

    # 🧠 Advanced Prompt: BE VERY LENIENT.
    system_prompt = f"""You are a specialized Technical Recruiter and Interviewer.
    
    TASK 1: ROLE VALIDATION
    Evaluate: Is "{job_role}" a recognizable job title or professional role?
    - YES: Software Engineer, MERN Developer, SDET, QA, HR, Manager, SDE-1, Fresher, Intern, etc.
    - YES: Any role that sounds like a professional job.
    - NO: Gibberish ("asdf"), numbers ("123"), single letters, or generic random words ("pizza", "dog").
    
    IMPORTANT: If "{job_role}" is a skill (e.g., "React"), treat it as "React Developer" and set "role_clear" to true.
    
    TASK 2: QUESTION GENERATION (Only if clear)
    - Generate exactly 5 questions (Easy/Medium/Hard).
    - CRITICAL: The first question (id: 1) MUST ALWAYS be exactly: "Please introduce yourself and explain why you are a good fit for the {job_role} role?"
    - For the remaining 4 questions, if a Resume is provided, create a BALANCED MIX:
        - 2 questions: Deep-dive into specific projects, technologies, or accomplishments from the Resume.
        - 2 questions: General industry-standard technical or behavioral questions for a {job_role}.
    - Ensure logical progression from introduction to technical depth.
    
    Role: {job_role}
    Type: {interview_type}
    Resume: {resume_text or 'Not provided'}
    
    Return JSON format. 
    CRITICAL: Do not include any conversational text, thought process, or markdown blocks.
    {{
      "role_clear": true/false,
      "suggestions": ["suggested role 1", "software engineer", ...] (if false),
      "questions": [
        {{"id": 1, "difficulty": "Easy", "question": "..."}},
        ... (5 total)
      ] (if true)
    }}"""

    try:
        data = await _call_fireworks(system_prompt, f"Evaluate role '{job_role}' and generate {interview_type} questions.")
        logger.debug(f"AI RAW RESPONSE: {data}")
    except Exception as e:
        logger.error(f"Fireworks API call failed: {e}")
        raise  # Propagate error so frontend handles it correctly
    
    # 🔍 Robust AI Response check
    role_is_clear = data.get("role_clear")
    if role_is_clear is None: 
        role_is_clear = True if data.get("questions") else False

    # 🚩 Role Not Clear
    if not role_is_clear:
        logger.warning(f"AI marked role as unclear: '{job_role}'")
        return {
            "role_clear": False,
            "suggestions": data.get("suggestions", ["Software Engineer", "Frontend Developer", "Data Analyst", "Product Manager", "HR Generalist"])
        }

    # ✅ Role Is Clear
    questions = data.get("questions", [])
    if not questions:
        logger.error(f"AI Response missing questions for: {job_role}")
        raise ValueError("The AI was unable to generate questions for this role. Please try a different role name.")
    
    # 强制第一个问题为自我介绍 (Ensure 1st question is introduction)
    intro_q = f"Please introduce yourself and explain why you are a good fit for the {job_role} role?"
    if questions:
        questions[0]["question"] = intro_q
    else:
        questions.append({"id": 1, "difficulty": "Easy", "question": intro_q})

    return {
        "role_clear": True,
        "questions": questions[:5] # Keep exactly 5
    }



# ────────────────────────────────────────────────────────────────────────────────
# Answer Evaluation
# ────────────────────────────────────────────────────────────────────────────────



async def evaluate_answer(question: str, transcript: str, metrics: dict, job_role: str) -> dict:
    """
    Evaluate a candidate's answer using Fireworks AI.
    """
    system_prompt = f"""You are an elite Lead Engineer and Hiring Manager.
    
    Job Role: {job_role or 'General'}
    
    The following response was transcribed via Speech-to-Text (STT).
    - IMPORTANT: IGNORE all spelling, punctuation, and slight transcription glitches.
    - AI TASK: Analyze the technical correctness, depth of explanation, and problem-solving logic.
    - CRITICAL: If the transcript is empty, silent, or says "(No response provided)", score it EXACTLY 0.
    - If the user says "I don't know" or gives a very short/vague answer, score it VERY low (1-10).
    - If the user provides a detailed, technically sound answer, score it HIGH (80-100).
    
    Question: {question}
    Transcript: "{transcript or '(No response provided)'}"
    
    Audio Metrics (Speech flow):
    {json.dumps(metrics, indent=2)}
    
    Provide a CRITICAL evaluation. Points for: Technical accuracy, Structured thinking, Examples.
    Return ONLY valid JSON. Stay strictly in JSON format.
    {{
      "answer_score": <int 0-100>,
      "communication_score": <int 0-100>,
      "strengths": ["specific strong technical points"],
      "weaknesses": ["specific technical gaps or incorrect statements"],
      "suggestions": ["how to specifically answer this question better"]
    }}"""

    return await _call_fireworks(system_prompt, "Deep technical analysis of the candidate's answer.")


# ────────────────────────────────────────────────────────────────────────────────
# Final Report Generation
# ────────────────────────────────────────────────────────────────────────────────

async def generate_report(answers: list, job_role: str) -> dict:
    """
    Generate a comprehensive final interview performance report.
    """
    answers_text = "\n\n".join(
        f"Q{i+1}: {a.get('question', 'N/A')}\n"
        f"Answer: {a.get('transcript', '') or a.get('answer', '')}\n"
        f"Technical Eval: {json.dumps(a.get('evaluation', {}))}"
        for i, a in enumerate(answers)
    )

    system_prompt = f"""You are a Senior Technical Career Coach and Hiring Manager.
    
    Target Role: {job_role or 'General Candidate'}
    Interview Session Data:
    {answers_text}
    
    TASK: Generate a data-driven, comprehensive performance report.
    
    BATCH EVALUATION LOGIC:
    1. For each question and answer provided, evaluate technical accuracy and communication quality.
    2. Synthesize an overall assessment of the candidate's proficiency for a {job_role}.
    3. Identify critical technical gaps and strong points.
    
    SCORING LOGIC:
    - overall_score: Weighted average of the technical depth shown across all answers.
    - CRITICAL: If ALL answers are empty or skipped (score 0), the overall_score MUST be 0.
    - If multiple answers were technically incorrect or very surface-level, the score MUST reflect that (low).
    
    REPORT SECTIONS:
    - technical_accuracy: Be strict. If they got technical facts wrong, deduct heavily.
    - strengths: Specific technologies or concepts they explained well.
    - suggestions: Must be actionable technical tips (e.g. "Study the Event Loop", "Learn Redux middleware").
    
    Return ONLY valid JSON:
    {{
      "overall_score": <weighted average 0-100>,
      "confidence_score": <0-100>,
      "fluency_score": <0-100>,
      "technical_accuracy": <0-100>,
      "strengths": ["specific strong technical points"],
      "weaknesses": ["specific technical gaps or incorrect statements"],
      "suggestions": ["Actionable technical improvement 1", "Detailed communication tip", "Strategic career advice"]
    }}"""

    return await _call_fireworks(system_prompt, "Generate the final technical performance scorecard.")
