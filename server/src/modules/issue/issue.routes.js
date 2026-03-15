const express = require('express');
const issueController = require('./issue.controller');
const authMiddleware = require('../../middleware/auth');
const roleMiddleware = require('../../middleware/role');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', issueController.createIssue);

router.use(roleMiddleware.restrictTo('SUPER_ADMIN'));

router.get('/', issueController.getAllIssues);
router.patch('/:id', issueController.updateIssueStatus);

module.exports = router;
