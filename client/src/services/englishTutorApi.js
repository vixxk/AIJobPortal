import api from '../utils/axios';

// Enable credentials for requests (for sessions/cookies if applicable)
api.defaults.withCredentials = true;


export const getTutorDashboard = () => api.get('/english-tutor/dashboard');
export const submitSpeakingTest = (responses) => api.post('/english-tutor/test/submit', { responses });
export const getLesson = (level) => api.get('/english-tutor/lesson', { params: { level } });
export const submitLessonTask = (formData) => api.post('/english-tutor/lesson/submit-task', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const completeLesson = (lessonData) => api.post('/english-tutor/lesson/complete', lessonData);

export const skipAssessment = () => api.post('/english-tutor/test/skip');
export const resetProgression = () => api.post('/english-tutor/test/reset');

export const speakText = (text, voice) => api.post('/interview/speak', { text, voice }, { responseType: 'blob' });
