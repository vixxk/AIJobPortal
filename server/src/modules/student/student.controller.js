const StudentProfile = require('./student.model');
const User = require('../user/user.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { uploadFile } = require('../../utils/fileUpload');
const { getSignedUrl } = require('../../config/aws');

exports.getMe = catchAsync(async (req, res, next) => {
  const currentId = req.user._id || req.user.id;
  if (currentId === (process.env.SUPER_ADMIN_ID || 'super_admin')) {
    return res.status(200).json({ status: 'success', data: { profile: {} } });
  }
  const profile = await StudentProfile.findOne({ userId: currentId });
  if (profile && profile.resumeUrl && !profile.resumeUrl.startsWith('http')) {
    // If it's a key and not a full URL (legacy might have full URLs)
    profile.resumeUrl = await getSignedUrl(profile.resumeUrl);
  } else if (profile && profile.resumeUrl && profile.resumeUrl.includes('s3')) {
    // Refresh signature even if it looks like a URL but is from S3
    const key = profile.resumeUrl.split('.amazonaws.com/')[1]?.split('?')[0];
    if (key) profile.resumeUrl = await getSignedUrl(key);
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile: profile || {}
    }
  });
});
exports.createOrUpdateProfile = catchAsync(async (req, res, next) => {
  const updates = { ...req.body };
  delete updates.userId; delete updates._id; delete updates.__v; delete updates.createdAt; delete updates.updatedAt;
  let profile = await StudentProfile.findOne({ userId: req.user.id });
  if (profile) {
    Object.assign(profile, updates);
    await profile.save();
  } else {
    profile = await StudentProfile.create({
      userId: req.user.id,
      ...updates
    });
  }

  // Sync phone number to User model if present
  if (updates.phoneNumber) {
    await User.findByIdAndUpdate(req.user.id, { phoneNumber: updates.phoneNumber });
  }
  
  // Sync name to User model if present
  if (updates.firstName || updates.lastName) {
    const user = await User.findById(req.user.id);
    const newName = `${updates.firstName || profile.firstName || ''} ${updates.lastName || profile.lastName || ''}`.trim();
    if (newName && newName !== user.name) {
      user.name = newName;
      await user.save({ validateBeforeSave: false });
    }
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
  const result = await uploadFile(req.file, 'students/avatars', true, 'avatars', 'image');
  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.user.id },
    { profileImage: result.url },
    { new: true, upsert: true }
  );
  await User.findByIdAndUpdate(req.user.id, { avatar: result.url });
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
  const result = await uploadFile(req.file, 'students/resumes', false, 'resumes', 'resume');
  
  // We save the KEY in the database for private assets so we can re-sign it on retrieval
  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.user.id },
    { resumeUrl: result.key || result.url },
    { new: true, upsert: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      resumeUrl: result.url // Still send the signed URL for instant frontend preview
    }
  });

});
exports.getStudentProfile = catchAsync(async (req, res, next) => {
  const profile = await StudentProfile.findById(req.params.id).populate('userId', 'name email');
  if (!profile) {
    return next(new AppError('Student profile not found', 404));
  }
  
  if (profile.resumeUrl && profile.resumeUrl.includes('s3')) {
    const key = profile.resumeUrl.split('.amazonaws.com/')[1]?.split('?')[0];
    if (key) profile.resumeUrl = await getSignedUrl(key);
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});
