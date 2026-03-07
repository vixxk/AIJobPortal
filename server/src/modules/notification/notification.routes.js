const express = require('express');
const notificationController = require('./notification.controller');
const authMiddleware = require('../../middleware/auth');
const router = express.Router();
router.use(authMiddleware.protect);
router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
module.exports = router;