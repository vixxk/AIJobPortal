const express = require('express');
const paymentController = require('./payment.controller');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');

const router = express.Router();

// Public webhook route (should ideally verify signature from Cashfree)
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-order', paymentController.createOrder);
router.get('/verify-payment/:orderId', paymentController.verifyPayment);

// Admin routes
router.get('/orders', restrictTo('SUPER_ADMIN'), paymentController.getAllOrders);

module.exports = router;
