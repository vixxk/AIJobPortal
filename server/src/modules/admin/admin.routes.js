const express = require('express');
const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('SUPER_ADMIN'));

router.get('/analytics', adminController.getAnalyticsSummary);
router.get('/users/pending', adminController.getPendingUsers);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/approval', adminController.updateUserApproval);
router.patch('/users/:userId/ban', adminController.banUser);
router.delete('/users/:userId', adminController.deleteUser);
router.patch('/users/:userId/role', adminController.updateUserRole);
const upload = require('../../middleware/upload');

router.post('/teachers', upload.uploadImage, adminController.createTeacher);

router.get('/jobs', adminController.getAllJobs);
router.post('/jobs', adminController.createJob);
router.patch('/jobs/:jobId', adminController.updateJob);
router.delete('/jobs/:jobId', adminController.deleteJob);

router.get('/courses', adminController.getAllCourses);
router.patch('/courses/:courseId', adminController.updateCourse);
router.delete('/courses/:courseId', adminController.deleteCourse);

router.get('/applications', adminController.getAllApplications);
router.get('/competitions', adminController.getAllCompetitions);
router.post('/competitions', upload.uploadImage, adminController.createCompetition);
router.delete('/competitions/:id', adminController.deleteCompetition);

router.patch('/approve-recruiter/:userId', (req, res, next) => {
  req.body.action = 'approve';
  adminController.updateUserApproval(req, res, next);
});

router.patch('/approve-college/:userId', (req, res, next) => {
  req.body.action = 'approve';
  adminController.updateUserApproval(req, res, next);
});

module.exports = router;
