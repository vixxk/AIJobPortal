const RecruiterProfile = require('./recruiter.model');
const User = require('../user/user.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { uploadFile } = require('../../utils/fileUpload');
exports.getMe = catchAsync(async (req, res, next) => {
  const profile = await RecruiterProfile.findOne({ userId: req.user.id });
  res.status(200).json({
    status: 'success',
    data: {
      profile: profile || {}
    }
  });
});
exports.createOrUpdateProfile = catchAsync(async (req, res, next) => {
  const { companyName, companyDescription, website } = req.body;
  let profile = await RecruiterProfile.findOne({ userId: req.user.id });
  if (profile) {
    profile.companyName = companyName || profile.companyName;
    profile.companyDescription = companyDescription || profile.companyDescription;
    profile.website = website || profile.website;
    await profile.save();
  } else {
    profile = await RecruiterProfile.create({
      userId: req.user.id,
      companyName,
      companyDescription,
      website
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});
exports.uploadLogo = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file.', 400));
  }
  const result = await uploadFile(req.file, 'recruiter/logos', true, 'avatars', 'image');
  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: req.user.id },
    { logo: result.url },
    { new: true, upsert: true }
  );
  res.status(200).json({
    status: 'success',
    data: {
      logo: profile.logo
    }
  });
});

exports.getAllRecruiters = catchAsync(async (req, res, next) => {
  const recruiters = await RecruiterProfile.find().populate('userId', 'email name');
  res.status(200).json({
    status: 'success',
    results: recruiters.length,
    data: recruiters
  });
});
