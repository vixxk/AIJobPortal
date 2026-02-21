const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Check for API key
const apiKey = process.env.AI_API_KEY;
let ai = null;

if (apiKey && apiKey !== 'your_gemini_api_key') {
   ai = new GoogleGenAI({ apiKey: apiKey });
}

// @route   POST /api/resume/optimize
// @desc    Optimizes resume experience bullet points using Gemini AI
router.post('/optimize', async (req, res) => {
  try {
    const { experiences, projects } = req.body;

    if (!experiences && !projects) {
      return res.status(400).json({ success: false, message: 'Experiences or Projects array is required' });
    }

    if (!ai) {
        // Fallback for MVP if no API key is provided
        console.warn('No Gemini API key provided. Returning mapped raw data.');
        return res.json({ 
            success: true, 
            optimizedExperiences: experiences.map(exp => ({
                ...exp,
                description: `• [AI Unavailable] ${exp.description}`
            })) 
        });
    }

    // Process all experiences in a single batch to save API calls
    let optimizedExperiences = null;
    let optimizedProjects = null;

    if (experiences && Array.isArray(experiences)) {
        optimizedExperiences = await Promise.all(experiences.map(async (exp) => {
            // Skip empty or very short descriptions
            if (!exp.description || exp.description.trim().length < 10) return exp;

            const prompt = `
            You are an expert technical recruiter and resume writer. 
            Rewrite the following raw job experience into highly professional, ATS-optimized bullet points.
            Rules:
            1. Start every bullet with a strong action verb (e.g., Developed, Orchestrated, Spearheaded).
            2. Incorporate metrics or results if possible (even if implied).
            3. Do NOT use personal pronouns (I, my, me).
            4. Output ONLY the bullet points, each starting with a bullet character "•", separated by newlines. Do not add conversational text.
            
            Raw Experience:
            "${exp.description}"
            `;

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                return { ...exp, description: response.text.trim() };
            } catch (apiError) {
                console.error("Gemini API Error for exp:", apiError);
                return exp;
            }
        }));
    }

    if (projects && Array.isArray(projects)) {
        optimizedProjects = await Promise.all(projects.map(async (proj) => {
            if (!proj.description || proj.description.trim().length < 10) return proj;

            const prompt = `
            You are an expert technical recruiter. 
            Rewrite the following raw coding project description into highly professional, ATS-optimized bullet points.
            Rules:
            1. Start every bullet with a strong action verb (e.g., Architected, Built, Designed).
            2. Emphasize the technologies used and the technical challenges solved.
            3. Do NOT use personal pronouns (I, my, me).
            4. Output ONLY the bullet points, each starting with a bullet character "•", separated by newlines. Do not add conversational text.
            
            Raw Project Details:
            "${proj.description}"
            `;

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                return { ...proj, description: response.text.trim() };
            } catch (apiError) {
                console.error("Gemini API Error for proj:", apiError);
                return proj;
            }
        }));
    }

    res.json({
        success: true,
        optimizedExperiences,
        optimizedProjects
    });

  } catch (error) {
    console.error('Resume Optimization Error:', error);
    res.status(500).json({ success: false, message: 'Server Error optimizing resume' });
  }
});

// @route   POST /api/resume/optimize-summary
// @desc    Optimizes a single professional summary statement
router.post('/optimize-summary', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim().length < 10) return res.status(400).json({ success: false, message: 'Text too short' });
        
        if (!ai) return res.json({ success: true, optimizedText: text });

        const prompt = `You are an expert technical recruiter and resume writer. 
        Rewrite the following raw professional summary into a highly professional, ATS-optimized 2-3 sentence paragraph.
        Rules:
        1. Keep it concise, punchy, and confident.
        2. Focus on years of experience, key technical skills, and overall domain expertise.
        3. Do NOT use personal pronouns (I, my, me).
        4. Output ONLY the raw paragraph text. No quotes, no intro text, no bullet points.
        
        Raw Summary:
        "${text}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        res.json({ success: true, optimizedText: response.text.trim() });
    } catch (error) {
        console.error('Optimize Summary Error:', error);
        res.status(500).json({ success: false, message: 'Server Error optimizing summary' });
    }
});

// @route   POST /api/resume/optimize-experience
// @desc    Optimizes a single experience or project description
router.post('/optimize-experience', async (req, res) => {
    try {
        const { text, type } = req.body; // type can be 'experience' or 'project'
        if (!text || text.trim().length < 10) return res.status(400).json({ success: false, message: 'Text too short' });
        
        if (!ai) return res.json({ success: true, optimizedText: text });

        const prompt = `You are an expert technical recruiter and resume writer. 
        Rewrite the following raw ${type || 'experience'} into highly professional, ATS-optimized bullet points.
        Rules:
        1. Start every bullet with a strong action verb (e.g., Developed, Orchestrated, Spearheaded).
        2. Incorporate metrics, tech stack, or results if possible.
        3. Do NOT use personal pronouns (I, my, me).
        4. Output ONLY the bullet points, each starting with a bullet character "•", separated by newlines. Do not add conversational text.
        
        Raw Input:
        "${text}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        res.json({ success: true, optimizedText: response.text.trim() });
    } catch (error) {
        console.error('Optimize Experience Error:', error);
        res.status(500).json({ success: false, message: 'Server Error optimizing experience' });
    }
});

module.exports = router;
