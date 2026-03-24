const express = require('express');
const applicationController = require('./application.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');
const router = express.Router();
router.use(authMiddleware.protect);
router.post('/', roleMiddleware.restrictTo('STUDENT', 'RECRUITER'), applicationController.applyToJob);
router.get('/me', roleMiddleware.restrictTo('STUDENT', 'RECRUITER'), applicationController.getMyApplications);
router.get('/student', roleMiddleware.restrictTo('STUDENT', 'RECRUITER'), applicationController.getMyApplications); // Compatibility with current frontend
router.get('/job/:jobId', roleMiddleware.restrictTo('RECRUITER'), applicationController.getJobApplicants);
router.post('/job/:jobId/smart-match', roleMiddleware.restrictTo('RECRUITER'), applicationController.smartMatchApplicants);
router.patch('/:id', roleMiddleware.restrictTo('RECRUITER'), applicationController.updateApplicationStatus);
router.post('/notify', roleMiddleware.restrictTo('RECRUITER'), applicationController.sendNotificationToApplicant);
module.exports = router;
