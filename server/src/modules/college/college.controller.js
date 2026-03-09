const CollegeProfile = require('./college.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
exports.getMe = catchAsync(async (req, res, next) => {
  const profile = await CollegeProfile.findOne({ userId: req.user.id });
  if (!profile) {
    return next(new AppError('No profile found. Please create one.', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});
exports.createOrUpdateProfile = catchAsync(async (req, res, next) => {
  const { collegeName, location, courses, studentStrength } = req.body;
  let profile = await CollegeProfile.findOne({ userId: req.user.id });
  if (profile) {
    profile.collegeName = collegeName || profile.collegeName;
    profile.location = location || profile.location;
    profile.courses = courses || profile.courses;
    profile.studentStrength = studentStrength || profile.studentStrength;
    await profile.save();
  } else {
    profile = await CollegeProfile.create({
      userId: req.user.id,
      collegeName,
      location,
      courses,
      studentStrength
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});
