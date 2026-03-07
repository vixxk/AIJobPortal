const axios = require('axios');
const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const callFireworks = async (systemPrompt, userPrompt) => {
    try {
        const response = await axios.post(
            FIREWORKS_API_URL,
            {
                model: 'accounts/fireworks/models/glm-5',
                max_tokens: 2048,
                temperature: 0.7,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error('Fireworks API Error:', error.response?.data || error.message);
        throw new Error('Failed to generate AI response');
    }
};
exports.generateQuestions = async (jobRole, interviewType, resumeText) => {
    const systemPrompt = `You are an expert interviewer.
Generate exactly 5 interview questions.
INPUT:
Job Role: ${jobRole}
Interview Type: ${interviewType}
Resume: ${resumeText || 'None provided'}
RULES:
- Mix easy, medium and hard questions
- If resume is present, tailor questions using the candidate experience
- Questions must be realistic interview questions
Return JSON only in this exact format:
{
  "questions": [
    { "id": 1, "difficulty": "easy", "question": "..." },
    { "id": 2, "difficulty": "medium", "question": "..." },
    { "id": 3, "difficulty": "medium", "question": "..." },
    { "id": 4, "difficulty": "hard", "question": "..." },
    { "id": 5, "difficulty": "hard", "question": "..." }
  ]
}`;
    const data = await callFireworks(systemPrompt, `Generate questions for ${jobRole} (${interviewType})`);
    return data.questions || data;
};
exports.evaluateAnswer = async (question, transcript, metrics, jobRole) => {
    const systemPrompt = `You are an interview evaluator.
Evaluate the candidate's answer for the job role: ${jobRole}.
Question:
${question}
Transcript:
${transcript}
Speech Metrics:
${JSON.stringify(metrics)}
Provide:
1 Answer quality score (0-100)
2 Communication score (0-100)
3 Strengths
4 Weaknesses
5 Suggestions
Return JSON format:
{
"answer_score": number,
"communication_score": number,
"strengths": ["..."],
"weaknesses": ["..."],
"suggestions": ["..."]
}`;
    return await callFireworks(systemPrompt, 'Evaluate this candidate\'s answer.');
};