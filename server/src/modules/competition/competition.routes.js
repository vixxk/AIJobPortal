const express = require('express');
const competitionController = require('./competition.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');
const router = express.Router();
router.get('/', competitionController.getAllCompetitions);
router.use(authMiddleware.protect);
router.post('/', roleMiddleware.restrictTo('SUPER_ADMIN'), competitionController.createCompetition);
module.exports = router;
