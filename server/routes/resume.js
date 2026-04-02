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
        
        const prompt = `You are an expert ATS resume writer. Rewrite the following career objective into a highly professional, ATS-optimized 2-3 sentence paragraph.

Rules:
1. Keep it concise, confident, and results-oriented.
2. Naturally weave in relevant technical keywords and domain expertise for ATS parsing.
3. Do NOT use personal pronouns (I, my, me). Use third-person or implied subject.
4. Focus on years of experience, core competencies, and value proposition.
5. Output ONLY the raw paragraph text. No quotes, no intro text, no bullet points, no markdown.

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
1. Write exactly 3-5 bullet points (no more, no less).
2. Start every bullet with a strong, unique action verb (e.g., Architected, Spearheaded, Optimized, Implemented, Engineered). Never repeat the same verb.
3. Each bullet MUST follow the pattern: Action Verb + What you did + Technology/Method used + Quantifiable result or impact.
4. Include specific technologies, frameworks, and tools mentioned in the raw text.
5. Add realistic, plausible metrics where possible (e.g., "reducing load time by 40%", "serving 10K+ daily users", "processing 1M+ records").
6. Do NOT use personal pronouns (I, my, me, we, our).
7. Keep each bullet to 1-2 lines maximum.
8. Output ONLY the bullet points, each on a new line starting with "•". No extra text, no numbering, no markdown formatting.

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
1. Start every bullet with a unique, strong action verb.
2. Follow pattern: Action Verb + Task + Technology + Quantifiable Impact.
3. No personal pronouns.
4. Output ONLY bullet points starting with "•", one per line. No extra text.

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
1. Start every bullet with a unique, strong action verb.
2. Emphasize technologies used and technical challenges solved.
3. Add quantifiable metrics where plausible.
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
