const express = require('express');
const jobController = require('./job.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

const router = express.Router();

// Publicly viewable routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('RECRUITER'));

router.post('/', jobController.createJob);
router.patch('/:id', jobController.updateJob);
router.patch('/:id/close', jobController.closeJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
