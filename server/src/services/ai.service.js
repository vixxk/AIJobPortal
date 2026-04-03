const axios = require('axios');
const { EdgeTTS } = require('edge-tts-universal');
const staticLessons = require('../data/staticLessons');

// ─── Fireworks AI Configuration ──────────────────────────────────────────────
const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_MODEL = 'accounts/fireworks/models/qwen3-8b';

const callFireworks = async (systemPrompt, userPrompt, maxTokens = 2048) => {
    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) throw new Error('FIREWORKS_API_KEY is not configured');

    const response = await axios.post(
        FIREWORKS_API_URL,
        {
            model: FIREWORKS_MODEL,
            max_tokens: maxTokens,
            temperature: 0.7,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        }
    );

    let content = response.data.choices[0].message.content;
    // Strip <think>...</think> tags from reasoning models
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try { return JSON.parse(jsonMatch[0]); }
        catch (e) { console.error('JSON parse failed on extracted block:', jsonMatch[0].substring(0, 100)); throw e; }
    }
    return JSON.parse(content);
};

// ─── Filler Detection (Port from Python) ─────────────────────────────────────
const FILLERS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of', 'right', 'okay'];

const countFillers = (text) => {
    if (!text) return 0;
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => FILLERS.includes(w.replace(/[.,!?;:]/g, ''))).length;
};

const getFillerDetails = (text) => {
    if (!text) return { total: 0, breakdown: {} };
    const words = text.toLowerCase().split(/\s+/);
    const breakdown = {};
    for (const w of words) {
        const clean = w.replace(/[.,!?;:]/g, '');
        if (FILLERS.includes(clean)) {
            breakdown[clean] = (breakdown[clean] || 0) + 1;
        }
    }
    return { total: Object.values(breakdown).reduce((a, b) => a + b, 0), breakdown };
};

// ─── Audio Metrics from Whisper Segments ─────────────────────────────────────
// Uses real segment timestamps from Whisper verbose_json for accurate metrics
const buildMetricsFromSegments = (transcript, segments = [], duration = 0) => {
    const words = (transcript || '').split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const fillers = countFillers(transcript);
    const fillerDetails = getFillerDetails(transcript);

    // If no segment data, fall back to basic estimation
    if (!segments || segments.length === 0) {
        const estDurationMin = wordCount > 0 ? wordCount / 130 : 0;
        return {
            transcript,
            speech_rate: wordCount > 0 ? 130 : 0,
            filler_count: fillers,
            filler_details: fillerDetails,
            pause_ratio: 0,
            long_pauses: 0,
            energy: 0,
            energy_variance: 0,
            pace_stability: 0,
            voice_breaks: 0,
            confidence: wordCount > 5 ? 75 : wordCount > 0 ? 40 : 0
        };
    }

    // --- Compute from real segment timestamps ---
    const totalDuration = duration || (segments.length > 0 ? segments[segments.length - 1].end : 0);
    const totalDurationMin = totalDuration / 60;

    // Speech rate (words per minute)
    const speechRate = totalDurationMin > 0 ? Math.round(wordCount / totalDurationMin) : 0;

    // Total speaking time vs total time → pause ratio
    let totalSpeechTime = 0;
    for (const seg of segments) {
        totalSpeechTime += (seg.end - seg.start);
    }
    const pauseTime = Math.max(0, totalDuration - totalSpeechTime);
    const pauseRatio = totalDuration > 0 ? pauseTime / totalDuration : 0;

    // Count gaps between segments
    let longPauses = 0;
    let voiceBreaks = 0;
    const gapDurations = [];
    for (let i = 1; i < segments.length; i++) {
        const gap = segments[i].start - segments[i - 1].end;
        if (gap > 0.1) { // any noticeable gap
            voiceBreaks++;
            gapDurations.push(gap);
        }
        if (gap > 2.0) { // long pause > 2 seconds
            longPauses++;
        }
    }

    // Pace stability (coefficient of variation of segment durations) 
    const segDurations = segments.map(s => s.end - s.start).filter(d => d > 0);
    let paceStability = 0;
    if (segDurations.length > 1) {
        const mean = segDurations.reduce((a, b) => a + b, 0) / segDurations.length;
        const variance = segDurations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / segDurations.length;
        paceStability = mean > 0 ? Math.sqrt(variance) / mean : 0; // CV: lower = steadier
    }

    // Energy variance estimate from gap patterns (more gaps = more variance)
    const energyVariance = gapDurations.length > 0
        ? Math.round(
            (gapDurations.reduce((sum, g) => sum + Math.pow(g - (gapDurations.reduce((a, b) => a + b, 0) / gapDurations.length), 2), 0)
            / gapDurations.length) * 10000
          ) / 10000
        : 0;

    // Confidence based on speech-to-silence ratio and word count
    let confidence = 0;
    if (wordCount > 20 && pauseRatio < 0.3) confidence = 85;
    else if (wordCount > 10 && pauseRatio < 0.5) confidence = 70;
    else if (wordCount > 5) confidence = 50;
    else if (wordCount > 0) confidence = 30;

    return {
        transcript,
        speech_rate: speechRate,
        filler_count: fillers,
        filler_details: fillerDetails,
        pause_ratio: Math.round(pauseRatio * 10000) / 10000,
        long_pauses: longPauses,
        energy: totalSpeechTime > 0 ? Math.round((totalSpeechTime / totalDuration) * 1000) / 1000 : 0,
        energy_variance: energyVariance,
        pace_stability: Math.round(paceStability * 10000) / 10000,
        voice_breaks: voiceBreaks,
        confidence
    };
};

// For backward compat (used when no audio, just transcript from browser)
const estimateAudioMetrics = (transcript, durationMs = 0) => {
    return buildMetricsFromSegments(transcript, [], durationMs / 1000);
};

// ─── STT: Transcription via Fireworks Whisper ────────────────────────────────
const transcribeAudio = async (audioBuffer, filename = 'audio.wav') => {
    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) throw new Error('FIREWORKS_API_KEY is not configured');

    if (!audioBuffer || audioBuffer.length < 500) {
        console.warn('Audio buffer very small or empty, skipping STT.');
        return { text: '', segments: [], duration: 0, confidence: 0 };
    }

    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, { filename, contentType: 'audio/webm' });
    form.append('model', 'whisper-v3');
    form.append('response_format', 'verbose_json');

    try {
        const response = await axios.post(
            'https://api.fireworks.ai/inference/v1/audio/transcriptions',
            form,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    ...form.getHeaders()
                },
                timeout: 60000,
                maxContentLength: 50 * 1024 * 1024,
                maxBodyLength: 50 * 1024 * 1024
            }
        );
        const data = response.data;
        return {
            text: data.text || '',
            segments: data.segments || [],
            duration: data.duration || 0,
            confidence: 80
        };
    } catch (err) {
        console.error('Fireworks STT Error:', err.response?.data || err.message);
        return { text: '', segments: [], duration: 0, confidence: 0 };
    }
};

// ─── Full Audio Analysis Pipeline ────────────────────────────────────────────
const analyzeAudio = async (audioBuffer, filename) => {
    const sttResult = await transcribeAudio(audioBuffer, filename);
    const transcript = sttResult.text || '';
    const metrics = buildMetricsFromSegments(transcript, sttResult.segments, sttResult.duration);
    metrics.transcript = transcript;
    metrics.confidence = sttResult.confidence;
    return metrics;
};

// ─── TTS: Text to Speech via edge-tts ────────────────────────────────────────
const _ttsServerCache = new Map();
const TTS_CACHE_MAX = 50;
const TTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const speakText = async (text, voice = 'en-US-AriaNeural') => {
    if (!text || !text.trim()) throw new Error('Text cannot be empty');

    const cacheKey = `${text}|${voice}`;
    const cached = _ttsServerCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TTS_CACHE_TTL) {
        return cached.buf;
    }

    const tts = new EdgeTTS(text, voice, { rate: '+0%', pitch: '+0Hz', volume: '+0%' });
    const result = await tts.synthesize();
    const arrayBuffer = await result.audio.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    // Evict oldest if at capacity
    if (_ttsServerCache.size >= TTS_CACHE_MAX) {
        const oldest = _ttsServerCache.keys().next().value;
        _ttsServerCache.delete(oldest);
    }
    _ttsServerCache.set(cacheKey, { buf, ts: Date.now() });

    return buf;
};

// ─── Interview: Generate Questions ───────────────────────────────────────────
const generateQuestionsV2 = async (jobRole, interviewType, resumeText = '') => {
    const systemPrompt = `You are an expert interviewer for a ${jobRole} position.
    Generate 5 high-quality ${interviewType} interview questions.
    ${resumeText ? `Candidate's Resume Context: ${resumeText}` : ''}
    
    Guidelines:
    - Mix difficulty levels (easy, medium, hard).
    - If a resume is provided, personalize at least 2 questions to their experience.
    - Return ONLY a JSON object with:
    {
      "role_clear": true,
      "questions": [
        { "id": 1, "question": "...", "difficulty": "...", "topic": "...", "ideal_answer": "a high-quality, comprehensive sample answer that would score 100% for this role" }
      ]
    }
    If the job role is nonsense, return "role_clear": false and suggestions for valid roles.`;
    return await callFireworks(systemPrompt, `Generate ${interviewType} questions for ${jobRole}`);
};

// ─── Interview: Evaluate Single Answer ───────────────────────────────────────
const evaluateAnswer = async (question, transcript, metrics, jobRole) => {
    const systemPrompt = `You are to act as a brutally precise and highly strict technical interviewer evaluating a candidate for a ${jobRole} role.
    You must evaluate the candidate's answer based on exact technical precision, completeness, and communication quality.
    
    Audio Metrics provided: ${JSON.stringify(metrics)}
    
    ### CRITICAL GRADING RULES ###
    1. ZERO TOLERANCE FOR NON-ANSWERS: If the candidate's transcript merely repeats the question, is incomplete, contains irrelevant junk, or entirely misses the core concept, you MUST award an "answer_score" of 0. Do not give "effort" or "pity" points.
    2. EXACT TECHNICAL PRECISION: To score above 50, the candidate must actively answer the question with correct domain knowledge. To score above 80, the candidate must cite specific examples, architectures, or frameworks correctly.
    3. DELIVERY SCORE: If the answer_score is 0, the communication_score must also be harshly penalized (under 20) because reciting a question back is not effective communication.
    
    ### OUTPUT FORMAT ###
    For the "technical_pointers" field, provide 2-4 short, highly specific bullet points brutally auditing the technical accuracy of their answer.
    Example: "Failed to mention actual alignment strategies", "Correctly identified O(n log n) complexity", "Answer was completely irrelevant", etc.
    
    Return ONLY a JSON object with strictly this schema:
    {
      "answer_score": 0-100,
      "communication_score": 0-100,
      "technical_pointers": ["specific critique 1", "specific critique 2"],
      "model_answer": "a concise, high-quality sample answer that would score 100% for this specific role and question",
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "suggestions": ["..."]
    }`;
    return await callFireworks(systemPrompt, `Question: ${question}\nCandidate's Answer Transcript: ${transcript}`);
};

// ─── Interview: Generate Final Report ────────────────────────────────────────
const generateReport = async (answers, jobRole) => {
    const hasContent = answers.some(a =>
        (a.transcript || '').trim() || (a.answer || '').trim()
    );

    if (!hasContent) {
        return {
            status: 'success',
            data: {
                overall_score: 0,
                confidence_score: 0,
                fluency_score: 0,
                technical_accuracy: 0,
                spoken_english: {
                    score: 0,
                    feedback: 'No verbal answers were provided to evaluate communication.',
                    strengths: [],
                    weaknesses: ['No spoken responses.']
                },
                answer_evaluation: {
                    score: 0,
                    feedback: 'No content was provided to evaluate technical accuracy.',
                    strengths: [],
                    weaknesses: ['Questions were skipped or left unanswered.']
                },
                suggestions: ['To receive a performance evaluation, please ensure you answer the questions during the session.']
            }
        };
    }

    const systemPrompt = `Generate a comprehensive performance scorecard for a ${jobRole || 'General'} interview.
    Synthesize the candidate's performance across all questions: ${JSON.stringify(answers)}
    
    The scorecard MUST be divided into two main sections:
    1. Spoken English Evaluation (focusing on communication, fluency, and confidence)
    2. Answer Content Evaluation (focusing on technical accuracy, relevance, and depth of answers)

    STRICT GUIDELINES & ZERO-TOLERANCE SCORING:
    1. ZERO POINTS FOR NON-ANSWERS: Any question with "skipped": true, an empty transcript, or a transcript that just repeats the question MUST mathematically pull the "technical_accuracy" and "overall_score" down heavily. Do NOT artificially inflate scores.
    2. TECHNICAL VALIDATION: Only award above 50% for technical_accuracy if the candidate actively demonstrated precise domain knowledge, frameworks, or correct terminology. 
    3. PENALIZE BABBLING: If a candidate talks a lot but provides no substantive technical value, crash their answer_evaluation score.
    4. DETAILED BREAKDOWN: Strengths and weaknesses must be ruthlessly precise. Never output generic advice like "work on technical skills." Tell them exactly which concept they failed.
    5. CRITICAL CAP: If more than 50% of questions are skipped or scored effectively 0, the maximum possible overall_score is 30.
    
    Return ONLY a JSON object with:
    {
      "overall_score": 0-100,
      "confidence_score": 0-100,
      "fluency_score": 0-100,
      "technical_accuracy": 0-100,
      "spoken_english": {
        "score": 0-100,
        "feedback": "...",
        "strengths": [],
        "weaknesses": []
      },
      "answer_evaluation": {
        "score": 0-100,
        "feedback": "...",
        "strengths": [],
        "weaknesses": []
      },
      "suggestions": []
    }`;

    const reportData = await callFireworks(systemPrompt, 'Process interview results strictly.');

    // Compute audio metrics from answers
    const speechRates = [], fillerCounts = [], pauseRatios = [], 
          clarityScores = [], energyVariances = [], longPauseCounts = [];

    for (const ans of answers) {
        const an = ans.analysis || {};
        if (an.speech_rate) speechRates.push(an.speech_rate);
        if (an.filler_count !== undefined) fillerCounts.push(an.filler_count);
        if (an.pause_ratio) pauseRatios.push(an.pause_ratio);
        if (an.confidence) clarityScores.push(an.confidence);
        if (an.energy_variance) energyVariances.push(an.energy_variance);
        if (an.long_pauses !== undefined) longPauseCounts.push(an.long_pauses);
    }

    reportData.audio_metrics = {
        avg_speech_rate: speechRates.length ? Math.round(speechRates.reduce((a, b) => a + b) / speechRates.length * 10) / 10 : 0,
        total_filler_words: fillerCounts.reduce((a, b) => a + b, 0),
        avg_pause_ratio: pauseRatios.length ? Math.round(pauseRatios.reduce((a, b) => a + b) / pauseRatios.length * 100) / 100 : 0,
        avg_clarity: clarityScores.length ? Math.round(clarityScores.reduce((a, b) => a + b) / clarityScores.length * 10) / 10 : 0,
        avg_modulation: energyVariances.length ? Math.round(energyVariances.reduce((a, b) => a + b) / energyVariances.length * 10000) / 10000 : 0,
        total_long_pauses: longPauseCounts.reduce((a, b) => a + b, 0),
    };

    return { status: 'success', data: reportData };
};

// ─── English Tutor: Evaluate Speaking Test ───────────────────────────────────
const evaluateSpeakingTest = async (responses) => {
    const tasksText = JSON.stringify(responses, null, 2);
    const systemPrompt = `You are a professional CEFR English examiner. Analyze several spoken responses.
    
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
        { "task_name": "...", "feedback": "...", "missing_words": [] }
      ]
    }`;
    const result = await callFireworks(systemPrompt, `Evaluate proficiency test: ${tasksText}`);
    return { status: 'success', data: result };
};

// ─── English Tutor: Generate Lesson Content ──────────────────────────────────
const DIFFICULTY_LEVELS = {
    1: 'Absolute Beginner (A1) - Simple greetings, personal info, numbers, basic colors.',
    2: 'Beginner (A1) - Daily routines, family, shopping, basic food.',
    3: 'Elementary (A2) - Travel, hobbies, simple past events, describing people.',
    4: 'Pre-Intermediate (A2+) - Work, health, future plans, basic comparisons.',
    5: 'Intermediate (B1) - Opinions, life experiences, environmental issues, news.',
    6: 'Upper-Intermediate (B1+) - Cultural differences, technology, complex social issues.',
    7: 'Advanced (B2) - Professional debates, abstract concepts, storytelling with nuances.',
    8: 'Upper-Advanced (B2+) - Idiomatic expressions, sarcasm, formal presentation skills.',
    9: 'Expert (C1) - Academic lectures, complex literature analysis, legal/professional English.',
    10: 'Master (C2) - Near-native fluency, specialized philosophy, high-level scientific discourse.'
};

const generateLessonContent = async (level, lessonIndex) => {
    // Ensure level is between 1 and 10
    const safeLevel = Math.max(1, Math.min(10, level || 1));
    
    // Fetch the array of lessons for this level
    const levelLessons = staticLessons[safeLevel];
    
    // Use modulo so we don't crash if lessonIndex exceeds available static lessons
    const selectedLesson = levelLessons[lessonIndex % levelLessons.length];

    // Return it in the same payload shape the frontend/controller expects
    return { status: 'success', data: selectedLesson };
};

// ─── English Tutor: Evaluate Lesson Task ─────────────────────────────────────
const evaluateLessonTask = async (taskType, transcript, metrics, context) => {
    const systemPrompt = `Evaluate a student's spoken English response for a '${taskType}' task.
    Context (Original Prompt/Text): ${JSON.stringify(context)}
    Audio Metrics: ${JSON.stringify(metrics)}
    
    Goals:
    - If task is 'repeat', check accuracy against 'text_to_repeat'.
    - If task is 'question', check relevance and grammar.
    - If task is 'free_speech', check fluency and vocabulary usage.
    - If task is 'describe_image', check descriptive language and relevance to the visual keywords.
    - If task is 'roleplay', check contextual appropriateness and conversational flow.
    - If task is 'idiom_usage', check if the idiom was used correctly and naturally.
    - If task is 'debate', check argument logic, persuasive vocabulary, and counter-points.
    
    Return ONLY a JSON object:
    {
      "scores": {
        "overall": 0,
        "fluency": 0,
        "grammar": 0,
        "vocabulary": 0,
        "pronunciation": 0
      },
      "feedback": "Encouraging and constructive feedback",
      "corrections": "Specific grammar or pronunciation corrections",
      "error_tags": ["grammar", "pronunciation", "vocabulary", "fluency"],
      "missing_words": ["Words from prompt that were skipped"],
      "pronunciation_tip": "One specific tip for improvement"
    }`;
    const result = await callFireworks(systemPrompt, `User transcript: ${transcript}`);
    return {
        status: 'success',
        data: {
            evaluation: result,
            transcript,
            metrics
        }
    };
};

// ─── Exports ─────────────────────────────────────────────────────────────────
module.exports = {
    callFireworks,
    // Audio
    transcribeAudio,
    analyzeAudio,
    speakText,
    buildMetricsFromSegments,
    // Filler detection
    countFillers,
    getFillerDetails,
    estimateAudioMetrics,
    // Interview
    generateQuestionsV2,
    evaluateAnswer,
    generateReport,
    // English Tutor
    evaluateSpeakingTest,
    generateLessonContent,
    evaluateLessonTask,
};
