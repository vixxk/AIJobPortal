const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
exports.analyzeAudio = async (filePath) => {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        const response = await axios.post(`${PYTHON_API_URL}/analyze-audio`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        return response.data;
    } catch (error) {
        console.error('Python Service Error:', error.message);
        throw new Error('Failed to analyze audio with python service');
    }
};
exports.startInterview = async ({ job_role, interview_type, resumePath }) => {
    try {
        const form = new FormData();
        form.append('job_role', job_role || '');
        form.append('interview_type', interview_type || 'behavioral');
        if (resumePath) {
            form.append('resume', fs.createReadStream(resumePath));
        }
        const response = await axios.post(`${PYTHON_API_URL}/api/interview/start`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        return response.data;
    } catch (error) {
        console.error('Python Service (Start) Error:', error.message);
        throw new Error('Failed to start interview with python service');
    }
};
exports.processAnswer = async ({ question, job_role, filePath }) => {
    try {
        const form = new FormData();
        form.append('question', question);
        form.append('job_role', job_role || '');
        form.append('audio', fs.createReadStream(filePath));
        const response = await axios.post(`${PYTHON_API_URL}/api/interview/process-audio`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        return response.data;
    } catch (error) {
        console.error('Python Service (Process Answer) Error:', error.message);
        throw new Error('Failed to process answer with python service');
    }
};
exports.evaluateAnswer = async ({ question, job_role, filePath }) => {
    try {
        const form = new FormData();
        form.append('question', question);
        form.append('job_role', job_role || '');
        form.append('audio', fs.createReadStream(filePath));
        const response = await axios.post(`${PYTHON_API_URL}/api/interview/evaluate`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        return response.data;
    } catch (error) {
        console.error('Python Service (Evaluate) Error:', error.message);
        throw new Error('Failed to evaluate answer with python service');
    }
};
exports.generateReport = async ({ answers, job_role }) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/api/interview/report`, {
            answers,
            job_role
        });
        return response.data;
    } catch (error) {
        console.error('Python Service (Report) Error:', error.message);
        throw new Error('Failed to generate report with python service');
    }
};
exports.speakText = async ({ text, voice }) => {
    try {
        const form = new FormData();
        form.append('text', text);
        form.append('voice', voice || 'en-US-AriaNeural');
        const response = await axios.post(`${PYTHON_API_URL}/api/tts`, form, {
            headers: {
                ...form.getHeaders()
            },
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.error('Python Service (TTS) Error:', error.message);
        throw new Error('Failed to generate TTS with python service');
    }
};