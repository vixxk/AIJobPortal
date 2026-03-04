const express = require('express');
const mockTestController = require('./mocktest.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

const router = express.Router();

router.get('/', mockTestController.getAllMockTests);
router.get('/:id', mockTestController.getMockTest);
router.get('/:mockTestId/leaderboard', mockTestController.getLeaderboard);

router.use(authMiddleware.protect);

// Admin only
router.post('/', roleMiddleware.restrictTo('SUPER_ADMIN'), mockTestController.createMockTest);

// Student only
router.post('/submit', roleMiddleware.restrictTo('STUDENT'), mockTestController.submitMockTest);

module.exports = router;
