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
  const { companyName, companyDescription, website, companyBanner, address, phoneNumber } = req.body;
  let profile = await RecruiterProfile.findOne({ userId: req.user.id });
  if (profile) {
    if (companyName) profile.companyName = companyName;
    if (companyDescription !== undefined) profile.companyDescription = companyDescription;
    if (website !== undefined) profile.website = website;
    if (companyBanner !== undefined) profile.companyBanner = companyBanner;
    if (address !== undefined) profile.address = address;
    if (phoneNumber !== undefined) profile.phoneNumber = phoneNumber;
    await profile.save();
  } else {
    profile = await RecruiterProfile.create({
      userId: req.user.id,
      companyName,
      companyDescription,
      website,
      companyBanner,
      address,
      phoneNumber
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

exports.uploadBanner = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file.', 400));
  }
  const result = await uploadFile(req.file, 'recruiter/banners', false, 'avatars', 'image');
  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: req.user.id },
    { companyBanner: result.url },
    { new: true }
  );
  if (!profile) {
    return next(new AppError('Recruiter profile not found. Please create your profile first.', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      companyBanner: profile.companyBanner
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
