const express = require('express');
const router = express.Router();
const axios = require('axios');

const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const FIREWORKS_MODEL = 'accounts/fireworks/models/llama-v3p1-70b-instruct';

// Helper to call Fireworks AI
const callFireworks = async (prompt) => {
    if (!FIREWORKS_API_KEY) return null;
    try {
        const response = await axios.post('https://api.fireworks.ai/inference/v1/chat/completions', {
            model: FIREWORKS_MODEL,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            temperature: 0.1,
        }, {
            headers: {
                'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });
        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error('Fireworks API Error:', err.response?.data || err.message);
        return null;
    }
};

// ─── Optimize career summary / objective ───────────────────────────────────
router.post('/optimize-summary', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim().length < 10) return res.status(400).json({ success: false, message: 'Text too short' });
        
        const prompt = `You are an expert ATS resume writer. Rewrite the following career objective into a highly professional, ATS-optimized 1-2 sentence paragraph.

Rules:
1. Keep it extremely concise, confident, and impact-oriented.
2. Target exactly 1-2 powerful sentences (no more).
3. Naturally weave in 3-5 critical technical keywords for ATS parsing.
4. Do NOT use personal pronouns (I, my, me). Use third-person or implied subject.
5. Focus on the value proposition and core competencies early.
6. Output ONLY the raw paragraph text. No quotes, no intro text, no bullet points, no markdown.

Raw Summary:
"${text}"`;

        const optimizedText = await callFireworks(prompt);
        res.json({ success: true, optimizedText: optimizedText || text });
    } catch (error) {
        console.error('Optimize Summary Error:', error);
        res.status(500).json({ success: false, message: 'Server Error optimizing summary' });
    }
});

// ─── Optimize experience / project descriptions ───────────────────────────
router.post('/optimize-experience', async (req, res) => {
    try {
        const { text, type } = req.body;
        if (!text || text.trim().length < 10) return res.status(400).json({ success: false, message: 'Text too short' });

        const isProject = type === 'projects';
        const prompt = `You are an expert ATS resume writer specializing in technical resumes.
Rewrite the following raw ${isProject ? 'project' : 'work experience'} description into highly professional, ATS-optimized bullet points.

Rules:
1. Write 3-4 punchy bullet points (strictly one line each).
2. Start every bullet with a strong, diverse action verb. Never repeat verbs.
3. Prioritize IMPACT and RESULTS: Lead with the achievement or consequence where possible.
4. Follow pattern: Action Verb + Key Result + How it was achieved (stack/method).
5. Add realistic, plausible metrics (e.g., "improving performance by 30%", "scaling to 5K users") to anchor the impact.
6. No personal pronouns.
7. Omit filler words, "responsible for", and passive phrases.
8. Output ONLY the bullet points, each on a new line starting with "•". No extra text.

Raw ${isProject ? 'Project' : 'Experience'} Description:
"${text}"`;

        const optimizedText = await callFireworks(prompt);
        res.json({ success: true, optimizedText: optimizedText || text });
    } catch (error) {
        console.error('Optimize Experience Error:', error);
        res.status(500).json({ success: false, message: 'Server Error optimizing experience' });
    }
});

// ─── Batch optimize (legacy endpoint) ──────────────────────────────────────
router.post('/optimize', async (req, res) => {
  try {
    const { experiences, projects } = req.body;
    if (!experiences && !projects) {
      return res.status(400).json({ success: false, message: 'Experiences or Projects array is required' });
    }

    let optimizedExperiences = null;
    let optimizedProjects = null;

    if (experiences && Array.isArray(experiences)) {
        optimizedExperiences = await Promise.all(experiences.map(async (exp) => {
            if (!exp.description || exp.description.trim().length < 10) return exp;
            const prompt = `You are an expert ATS resume writer.
Rewrite the following raw job experience into 3-5 professional, ATS-optimized bullet points.
Rules:
1. Write 2-4 extremely concise, impact-focused bullet points (strictly one line each).
2. Start with a unique, powerful action verb and lead with a quantifiable result.
3. Use a "Result-first" logic: Action Verb + Achievement + Method/Tech.
4. No personal pronouns. No filler words.
5. Output ONLY bullet points starting with "•", one per line.

Raw Experience:
"${exp.description}"`;
            const optimized = await callFireworks(prompt);
            return { ...exp, description: optimized || exp.description };
        }));
    }

    if (projects && Array.isArray(projects)) {
        optimizedProjects = await Promise.all(projects.map(async (proj) => {
            if (!proj.description || proj.description.trim().length < 10) return proj;
            const prompt = `You are an expert ATS resume writer.
Rewrite the following raw project description into 3-5 professional, ATS-optimized bullet points.
Rules:
1. Write 2-4 extremely concise, impact-focused bullet points (strictly one line each).
2. Emphasize the quantifiable result or the scale of the technical challenge solved.
3. Lead with impact: Action Verb + Result + Tech stack.
4. No personal pronouns.
5. Output ONLY bullet points starting with "•", one per line. No extra text.

Raw Project:
"${proj.description}"`;
            const optimized = await callFireworks(prompt);
            return { ...proj, description: optimized || proj.description };
        }));
    }

    res.json({ success: true, optimizedExperiences, optimizedProjects });
  } catch (error) {
    console.error('Resume Optimization Error:', error);
    res.status(500).json({ success: false, message: 'Server Error optimizing resume' });
  }
});

module.exports = router;
