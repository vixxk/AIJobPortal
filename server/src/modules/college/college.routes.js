const express = require('express');
const collegeController = require('./college.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('COLLEGE_ADMIN'));

router.get('/me', collegeController.getMe);
router.post('/profile', collegeController.createOrUpdateProfile);

module.exports = router;
