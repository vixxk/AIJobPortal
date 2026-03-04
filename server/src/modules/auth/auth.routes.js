const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');
const { loginLimiter } = require('../../middleware/rateLimiter');
const { uploadImage } = require('../../middleware/upload');

const router = express.Router();

// ── Public routes ──────────────────────────────────────────────────
// Traditional email/password
router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);

// Google OAuth
router.post('/google', authController.googleAuth);

// Email OTP flow
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Admin login (hardcoded super admin)
router.post('/admin/login', loginLimiter, authController.adminLogin);

// Password reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/check-reset-otp', authController.checkResetOTP);
router.post('/reset-password', authController.resetPassword);

// ── Protected routes (need a valid token, even if no role yet) ─────
router.use(authMiddleware.protectAny); // allows any token (even role=NONE)

// Role assignment - happens right after first login
router.post('/assign-role', authController.assignRole);

// Upload avatar
router.post('/upload-avatar', uploadImage, authController.uploadAvatar);

// Get current user info
router.get('/me', authController.getMe);

// Update Profile flow
router.post('/update-profile', authController.updateProfile);

module.exports = router;
