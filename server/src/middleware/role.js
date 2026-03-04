const AppError = require('../utils/appError');

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // super admins generally have access to admin routes, but if we specify roles exactly, we enforce it.
    // typically super admin bypasses, let's include super admin directly if roles includes it.
    if (!roles.includes(req.user.role)) {
      // allow SUPER_ADMIN to bypass if desired, here we strictly enforce unless added to roles array
      if (req.user.role !== 'SUPER_ADMIN') {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
    }
    next();
  };
};
