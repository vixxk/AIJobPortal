const rateLimit = require('express-rate-limit');
exports.apiLimiter = rateLimit({
  max: process.env.NODE_ENV === 'development' ? 5000 : 1000, 
  windowMs: 15 * 60 * 1000, 
  message: 'Too many requests from this IP, please try again in an hour!'
});
exports.loginLimiter = rateLimit({
  max: 20, 
  windowMs: 15 * 60 * 1000, 
  message: 'Too many login attempts from this IP, please try again after 15 minutes!'
});