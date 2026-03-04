const StudentProfile = require('./student.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { uploadImageToCloudinary, uploadResumeToCloudinary } = require('../../config/cloudinary');

exports.getMe = catchAsync(async (req, res, next) => {
  const profile = await StudentProfile.findOne({ userId: req.user.id });

  res.status(200).json({
    status: 'success',
    data: {
      profile: profile || {}
    }
  });
});

exports.createOrUpdateProfile = catchAsync(async (req, res, next) => {
  const updates = { ...req.body };
  delete updates.userId; delete updates._id; delete updates.__v; delete updates.createdAt; delete updates.updatedAt; // Security: prevent overriding user ID

  let profile = await StudentProfile.findOne({ userId: req.user.id });

  if (profile) {
    // Update
    Object.assign(profile, updates);
    await profile.save();
  } else {
    // Create
    profile = await StudentProfile.create({
      userId: req.user.id,
      ...updates
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});

exports.uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file.', 400));
  }

  const result = await uploadImageToCloudinary(req.file.buffer, 'student_profiles');
  
  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.user.id },
    { profileImage: result.secure_url },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      profileImage: profile.profileImage
    }
  });
});

exports.uploadResume = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a resume file (PDF).', 400));
  }

  const result = await uploadResumeToCloudinary(req.file.buffer);

  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.user.id },
    { resumeUrl: result.secure_url },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      resumeUrl: profile.resumeUrl
    }
  });
});

exports.getStudentProfile = catchAsync(async (req, res, next) => {
  const profile = await StudentProfile.findById(req.params.id).populate('userId', 'name email');

  if (!profile) {
    return next(new AppError('Student profile not found', 404));
  }

  // Restrict sensitive fields if needed (e.g., if viewed by a different user/role)
  // Currently sharing base info
  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});
