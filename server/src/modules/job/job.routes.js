const express = require('express');
const jobController = require('./job.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');
const router = express.Router();

router.get('/search', jobController.searchJobs);
router.get('/saved', authMiddleware.protect, jobController.getSavedJobs);
router.post('/save', authMiddleware.protect, jobController.saveJob);
router.delete('/unsave', authMiddleware.protect, jobController.unsaveJob);

router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('RECRUITER'));
router.post('/', jobController.createJob);
router.patch('/:id', jobController.updateJob);
router.patch('/:id/close', jobController.closeJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
