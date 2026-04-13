const express = require('express');
const jobController = require('./job.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');
const router = express.Router();

// Protected recruiter routes (Specific paths first to avoid matching :id)
router.get('/me', authMiddleware.protect, roleMiddleware.restrictTo('RECRUITER'), jobController.getMyJobs);
router.get('/stats', authMiddleware.protect, roleMiddleware.restrictTo('RECRUITER'), jobController.getRecruiterStats);

// Protected student routes
router.get('/saved', authMiddleware.protect, jobController.getSavedJobs);
router.post('/save', authMiddleware.protect, jobController.saveJob);
router.delete('/unsave', authMiddleware.protect, jobController.unsaveJob);

// Shared/Public routes
router.get('/search', jobController.searchJobs);
router.get('/public/:id', authMiddleware.isLoggedIn, jobController.getPublicJob);
router.get('/', jobController.getAllJobs);
router.get('/:id', authMiddleware.isLoggedIn, jobController.getJob);

// Modification routes (Recruiter restricted)
router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('RECRUITER'));

router.post('/', jobController.createJob);
router.patch('/:id', jobController.updateJob);
router.patch('/:id/questions', jobController.updateJobQuestions);
router.patch('/:id/close', jobController.closeJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
