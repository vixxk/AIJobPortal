const express = require('express');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const interviewSessionController = require('./interviewSession.controller');

const router = express.Router();

// Candidate endpoints (Public but protected by secret token)
router.get('/token/:token', interviewSessionController.getSessionByToken);
router.post('/token/:token/complete', interviewSessionController.completeSession);

// Protected routes (Requires Auth)
router.use(protect);

// Recruiter/Admin view report
router.get('/application/:applicationId', interviewSessionController.getReport);

// Recruiter endpoints
router.use(restrictTo('RECRUITER', 'SUPER_ADMIN'));
router.post('/generate-questions', interviewSessionController.generateQuestions);
router.post('/create', interviewSessionController.createSession);

module.exports = router;
