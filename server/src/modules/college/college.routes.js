const express = require('express');
const collegeController = require('./college.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');
const router = express.Router();

router.use(authMiddleware.protect);

// ─── Public (authenticated) routes ──────────────────────────────────────────
// Accessible by RECRUITER, COLLEGE_ADMIN, SUPER_ADMIN
router.get('/', roleMiddleware.restrictTo('RECRUITER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'), collegeController.getAllColleges);
router.get('/drives/all', roleMiddleware.restrictTo('RECRUITER', 'COLLEGE_ADMIN', 'SUPER_ADMIN', 'STUDENT'), collegeController.getAllDrives);

// ─── Recruiter routes ────────────────────────────────────────────────────────
router.post('/invites', roleMiddleware.restrictTo('RECRUITER'), collegeController.sendRecruiterInvite);
router.get('/invites/sent', roleMiddleware.restrictTo('RECRUITER'), collegeController.getRecruiterSentInvites);

// ─── College Admin routes ─────────────────────────────────────────────────────
router.use(roleMiddleware.restrictTo('COLLEGE_ADMIN'));

// Profile
router.get('/me', collegeController.getMe);
router.post('/profile', collegeController.createOrUpdateProfile);
router.patch('/profile', collegeController.createOrUpdateProfile);

// Stats
router.get('/stats', collegeController.getCollegeStats);

// Drives
router.get('/drives', collegeController.getDrives);
router.post('/drives', collegeController.createDrive);
router.patch('/drives/:id', collegeController.updateDrive);
router.delete('/drives/:id', collegeController.deleteDrive);

// Messages / Emails
router.get('/messages', collegeController.getMessages);
router.post('/messages', collegeController.sendMessage);

// Placement Sessions
router.get('/sessions', collegeController.getSessions);
router.post('/sessions', collegeController.createSession);
router.patch('/sessions/:id', collegeController.updateSession);
router.patch('/sessions/:id/candidate', collegeController.updateCandidateStatus);

// Invites received
router.get('/invites', collegeController.getCollegeInvites);
router.patch('/invites/:id', collegeController.respondToInvite);

module.exports = router;
