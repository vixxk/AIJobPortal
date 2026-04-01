import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
