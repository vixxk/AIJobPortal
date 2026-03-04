const express = require('express');
const studentController = require('./student.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');
const { uploadImage, uploadResume } = require('../../middleware/upload');

const router = express.Router();

// All routes here require authentication
router.use(authMiddleware.protect);

// Routes specific to the logged-in student
router.get('/me', roleMiddleware.restrictTo('STUDENT'), studentController.getMe);
router.post('/profile', roleMiddleware.restrictTo('STUDENT'), studentController.createOrUpdateProfile);
router.patch('/profile/image', roleMiddleware.restrictTo('STUDENT'), uploadImage, studentController.uploadImage);
router.patch('/profile/resume', roleMiddleware.restrictTo('STUDENT'), uploadResume, studentController.uploadResume);

// Publicly viewable student profiles (perhaps by recruiters/colleges)
router.get('/:id', studentController.getStudentProfile);

module.exports = router;
