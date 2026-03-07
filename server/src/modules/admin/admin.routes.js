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
router.delete('/jobs/:jobId', adminController.deleteJob);
router.patch('/approve-recruiter/:userId', (req, res, next) => {
  req.body.action = 'approve';
  adminController.updateUserApproval(req, res, next);
});
router.patch('/approve-college/:userId', (req, res, next) => {
  req.body.action = 'approve';
  adminController.updateUserApproval(req, res, next);
});
module.exports = router;