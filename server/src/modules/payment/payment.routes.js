const express = require('express');
const paymentController = require('./payment.controller');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');

const router = express.Router();

// Public webhook & plans routes
router.post('/webhook', paymentController.handleWebhook);
router.get('/plans', paymentController.getPlans);

// Protected routes
router.use(protect);

router.post('/create-order', paymentController.createOrder);
router.get('/verify-payment/:orderId', paymentController.verifyPayment);

router.get('/subscription-status', paymentController.getSubscriptionStatus);
router.post('/create-pay-per-use', paymentController.createPayPerUseOrder);
router.post('/subscribe', paymentController.createSubscriptionOrder);

// Admin routes
router.patch('/plans', restrictTo('SUPER_ADMIN'), paymentController.updatePlan);
router.get('/orders', restrictTo('SUPER_ADMIN'), paymentController.getAllOrders);
router.get('/pay-per-use-config', restrictTo('SUPER_ADMIN'), paymentController.getPayPerUseConfigs);
router.patch('/pay-per-use-config', restrictTo('SUPER_ADMIN'), paymentController.updatePayPerUseConfig);

module.exports = router;
