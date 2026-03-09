const RecruiterProfile = require('./recruiter.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { uploadImageToCloudinary } = require('../../config/cloudinary');
exports.getMe = catchAsync(async (req, res, next) => {
  const profile = await RecruiterProfile.findOne({ userId: req.user.id });
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
  const result = await uploadImageToCloudinary(req.file.buffer, 'company_logos');
  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: req.user.id },
    { logo: result.secure_url },
    { new: true, upsert: true }
  );
  res.status(200).json({
    status: 'success',
    data: {
      logo: profile.logo
    }
  });
});
