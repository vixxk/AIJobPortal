import api from '../utils/axios';
export const startInterview = async (formData) => {
    const response = await api.post('/interview/start', formData);
    return response.data;
};
export const evaluateAnswer = async (formData) => {
    const response = await api.post('/interview/evaluate', formData, {
        timeout: 60000,
    });
    return response.data;
};
export const generateReport = async (answers, job_role) => {
    const response = await api.post('/interview/report', { answers, job_role });
    return response.data;
};
export const transcribeAudio = async (formData) => {
    const response = await api.post('/interview/transcribe', formData, {
        timeout: 60000,
    });
    return response.data;
};
export const speakText = async (text, voice = 'en-US-AriaNeural') => {
    const response = await api.post('/interview/speak', { text, voice }, {
        responseType: 'blob',
        timeout: 30000,
    });
    return URL.createObjectURL(response.data);
};
