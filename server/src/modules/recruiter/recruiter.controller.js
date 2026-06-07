const RecruiterProfile = require('./recruiter.model');
const User = require('../user/user.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { uploadFile } = require('../../utils/fileUpload');
const { getSignedUrl } = require('../../config/aws');

const signVerificationDocs = async (profile) => {
  if (!profile) return;
  const docFields = ['gstCertificate', 'panCard', 'companyRegistrationCertificate', 'startupIndiaCertificate'];
  for (const field of docFields) {
    if (profile[field]) {
      if (!profile[field].startsWith('http')) {
        profile[field] = await getSignedUrl(profile[field]);
      } else if (profile[field].includes('s3')) {
        const key = profile[field].split('.amazonaws.com/')[1]?.split('?')[0];
        if (key) profile[field] = await getSignedUrl(key);
      }
    }
  }
};

exports.getMe = catchAsync(async (req, res, next) => {
  const profile = await RecruiterProfile.findOne({ userId: req.user.id });
  if (profile) {
    await signVerificationDocs(profile);
  }
  res.status(200).json({
    status: 'success',
    data: {
      profile: profile || {}
    }
  });
});
exports.createOrUpdateProfile = catchAsync(async (req, res, next) => {
  const { 
    companyName, 
    companyDescription, 
    website, 
    companyBanner, 
    address, 
    phoneNumber,
    city,
    state,
    country,
    companyLinkedinPage,
    companyType,
    gstNumber,
    panNumber,
    authorizedPersonName,
    designation,
    officialEmail,
    contactNumber
  } = req.body;

  let profile = await RecruiterProfile.findOne({ userId: req.user.id });
  if (profile) {
    if (companyName) profile.companyName = companyName;
    if (companyDescription !== undefined) profile.companyDescription = companyDescription;
    if (website !== undefined) profile.website = website;
    if (companyBanner !== undefined) profile.companyBanner = companyBanner;
    if (address !== undefined) profile.address = address;
    if (phoneNumber !== undefined) profile.phoneNumber = phoneNumber;
    if (city !== undefined) profile.city = city;
    if (state !== undefined) profile.state = state;
    if (country !== undefined) profile.country = country;
    if (companyLinkedinPage !== undefined) profile.companyLinkedinPage = companyLinkedinPage;
    if (companyType !== undefined) profile.companyType = companyType;
    if (gstNumber !== undefined) profile.gstNumber = gstNumber;
    if (panNumber !== undefined) profile.panNumber = panNumber;
    if (authorizedPersonName !== undefined) profile.authorizedPersonName = authorizedPersonName;
    if (designation !== undefined) profile.designation = designation;
    if (officialEmail !== undefined) profile.officialEmail = officialEmail;
    if (contactNumber !== undefined) profile.contactNumber = contactNumber;
    
    await profile.save();
  } else {
    profile = await RecruiterProfile.create({
      userId: req.user.id,
      companyName: companyName || 'Organization',
      companyDescription,
      website,
      companyBanner,
      address,
      phoneNumber: phoneNumber || req.user?.phoneNumber,
      city,
      state,
      country,
      companyLinkedinPage,
      companyType,
      gstNumber,
      panNumber,
      authorizedPersonName,
      designation,
      officialEmail,
      contactNumber
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

exports.submitVerification = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  // Find or create profile
  let profile = await RecruiterProfile.findOne({ userId });
  if (!profile) {
    profile = new RecruiterProfile({ userId, companyName: req.body.companyName || 'Organization' });
  }

  // Get body fields
  const {
    companyName,
    companyAddress,
    city,
    state,
    country,
    companyWebsite,
    companyLinkedinPage,
    companyType,
    gstNumber,
    panNumber,
    authorizedPersonName,
    designation,
    officialEmail,
    contactNumber
  } = req.body;

  // Validate required fields
  if (!companyName || !companyAddress || !city || !state || !country || !companyType || !panNumber || !authorizedPersonName || !designation || !officialEmail || !contactNumber) {
    return next(new AppError('Please provide all required fields.', 400));
  }

  // Update profile company details
  profile.companyName = companyName;
  profile.address = companyAddress; // mapping companyAddress to address
  profile.city = city;
  profile.state = state;
  profile.country = country;
  profile.website = companyWebsite;
  profile.companyLinkedinPage = companyLinkedinPage;
  profile.companyType = companyType;
  profile.gstNumber = gstNumber;
  profile.panNumber = panNumber;
  profile.authorizedPersonName = authorizedPersonName;
  profile.designation = designation;
  profile.officialEmail = officialEmail;
  profile.contactNumber = contactNumber;

  // Handle uploaded files
  if (req.files) {
    if (req.files.gstCertificate && req.files.gstCertificate[0]) {
      const result = await uploadFile(req.files.gstCertificate[0], 'recruiter/verifications', false, '', 'cert');
      profile.gstCertificate = result.key || result.url;
    }
    if (req.files.panCard && req.files.panCard[0]) {
      const result = await uploadFile(req.files.panCard[0], 'recruiter/verifications', false, '', 'cert');
      profile.panCard = result.key || result.url;
    }
    if (req.files.companyRegistrationCertificate && req.files.companyRegistrationCertificate[0]) {
      const result = await uploadFile(req.files.companyRegistrationCertificate[0], 'recruiter/verifications', false, '', 'cert');
      profile.companyRegistrationCertificate = result.key || result.url;
    }
    if (req.files.startupIndiaCertificate && req.files.startupIndiaCertificate[0]) {
      const result = await uploadFile(req.files.startupIndiaCertificate[0], 'recruiter/verifications', false, '', 'cert');
      profile.startupIndiaCertificate = result.key || result.url;
    }
  }

  // Validate file uploads: PAN Card and Company Registration are required
  if (!profile.panCard) {
    return next(new AppError('PAN Card document is required.', 400));
  }
  if (!profile.companyRegistrationCertificate) {
    return next(new AppError('Company Registration Certificate is required.', 400));
  }

  profile.verificationSubmitted = true;
  profile.rejectionReason = undefined;
  await profile.save();

  // Update User approvalStatus to PENDING (it is under review now)
  const user = await User.findById(userId);
  if (user) {
    user.approvalStatus = 'PENDING';
    await user.save({ validateBeforeSave: false });
  }

  // Sign verification docs for response
  await signVerificationDocs(profile);

  res.status(200).json({
    status: 'success',
    message: 'Verification details submitted successfully. Under review.',
    data: {
      profile
    }
  });
});
