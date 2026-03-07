const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../modules/user/user.model');
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  let currentUser;
  if (decoded.role === 'SUPER_ADMIN') {
    if (decoded.id === (process.env.SUPER_ADMIN_ID || 'super_admin')) {
      currentUser = {
        _id: process.env.SUPER_ADMIN_ID || 'super_admin',
        role: 'SUPER_ADMIN',
        name: 'Super Admin',
        isActive: true
      };
    } else {
      return next(new AppError('Invalid Super Admin Token', 401));
    }
  } else {
    currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    if (!currentUser.isActive) {
      return next(new AppError('Your account has been suspended.', 403));
    }
    if (!currentUser.isVerified) {
      return next(new AppError('Please verify your email address to access this route.', 403));
    }
    if (!currentUser.role) {
      return next(new AppError('Please complete your profile setup by selecting a role.', 403));
    }
  }
  req.user = currentUser;
  next();
});
exports.protectAny = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in.', 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role === 'SUPER_ADMIN') {
    req.user = {
      _id: process.env.SUPER_ADMIN_ID || 'super_admin',
      role: 'SUPER_ADMIN',
      name: 'Super Admin'
    };
    return next();
  }
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }
  req.user = currentUser;
  next();
});