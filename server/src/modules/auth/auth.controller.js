const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../user/user.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const generateToken = require('../../utils/generateToken');
const sendEmail = require('../../config/mailer');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || null,
  role: user.role,
  approvalStatus: user.approvalStatus,
  profileCompleted: user.profileCompleted || false,
  needsRole: !user.role,
  pendingApproval:
    (user.role === 'RECRUITER' || user.role === 'COLLEGE_ADMIN') &&
    user.approvalStatus === 'PENDING'
});
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const sendOTPEmail = async (email, otp, name) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; padding: 32px 0;">
      <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 800; color: #1e293b;">
            <span style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 6px 10px; border-radius: 8px; font-size: 18px;">JP</span>
            JobPortal
          </div>
        </div>
        <h2 style="color: #1e293b; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Your Login OTP</h2>
        <p style="color: #64748b; font-size: 15px; margin: 0 0 28px;">Hi ${name || 'there'}, use the code below to sign in. It expires in 10 minutes.</p>
        <div style="background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 2px solid #bfdbfe; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 44px; font-weight: 900; letter-spacing: 10px; color: #2563eb; font-family: 'Courier New', monospace;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
  await sendEmail({
    email,
    subject: `${otp} – Your JobPortal Login Code`,
    message: `Your OTP for JobPortal login is: ${otp}. It expires in 10 minutes.`,
    html
  });
};
exports.googleAuth = catchAsync(async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) {
    return next(new AppError('Google ID token is required', 400));
  }
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  } catch (err) {
    return next(new AppError('Invalid Google token', 401));
  }
  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;
  let isNewUser = false;
  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    isNewUser = true;
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture,
      isVerified: true,
      approvalStatus: 'NOT_REQUIRED'
    });
  } else {
    if (!user.googleId) {
      user.googleId = googleId;
    }
    if (picture && !user.avatar) {
      user.avatar = picture;
    }
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
  }
  if (!user.isActive) {
    return next(new AppError('Your account has been suspended. Please contact support.', 403));
  }
  const token = generateToken(user._id, user.role || 'NONE');
  res.status(200).json({
    status: 'success',
    token,
    data: { user: buildUserPayload(user), isNewUser }
  });
});
exports.sendOTP = catchAsync(async (req, res, next) => {
  const { email, name } = req.body;
  if (!email) {
    return next(new AppError('Email is required', 400));
  }
  let isNewUser = false;
  let user = await User.findOne({ email });
  if (!user) {
    isNewUser = true;
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      isVerified: false,
      approvalStatus: 'NOT_REQUIRED'
    });
  }
  if (!user.isActive) {
    return next(new AppError('Your account has been suspended.', 403));
  }
  const otp = generateOTP();
  user.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  try {
    await sendOTPEmail(email, otp, user.name);
    res.status(200).json({
      status: 'success',
      message: `OTP sent to ${email}`,
      data: { isNewUser }
    });
  } catch (err) {
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send OTP email. Please try again.', 500));
  }
});
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new AppError('Email and OTP are required', 400));
  }
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await User.findOne({
    email,
    otpCode: hashedOTP,
    otpExpires: { $gt: Date.now() }
  }).select('+otpCode +otpExpires');
  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }
  user.otpCode = undefined;
  user.otpExpires = undefined;
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });
  if (!user.isActive) {
    return next(new AppError('Your account has been suspended.', 403));
  }
  const token = generateToken(user._id, user.role || 'NONE');
  res.status(200).json({
    status: 'success',
    token,
    data: { user: buildUserPayload(user) }
  });
});
exports.assignRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const userId = req.user._id || req.user.id;
  const allowed = ['STUDENT', 'RECRUITER', 'COLLEGE_ADMIN'];
  if (!allowed.includes(role)) {
    return next(new AppError('Invalid role selection.', 400));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.role && user.role !== 'NONE') {
    return next(new AppError('Role is already assigned.', 400));
  }
  user.role = role;
  user.approvalStatus = (role === 'RECRUITER' || role === 'COLLEGE_ADMIN') ? 'PENDING' : 'NOT_REQUIRED';
  await user.save({ validateBeforeSave: false });
  const token = generateToken(user._id, user.role);
  res.status(200).json({
    status: 'success',
    token,
    data: { user: buildUserPayload(user) }
  });
});
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (role === 'SUPER_ADMIN' || role === 'TEACHER') {
    return next(new AppError('Cannot register with this role publicly.', 400));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isVerified) {
       return next(new AppError('An account with this email already exists', 400));
    }
    existingUser.password = password;
    existingUser.name = name;
    existingUser.role = role;
    existingUser.approvalStatus = role === 'RECRUITER' || role === 'COLLEGE_ADMIN' ? 'PENDING' : 'NOT_REQUIRED';
    const otp = generateOTP();
    existingUser.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
    existingUser.otpExpires = Date.now() + 10 * 60 * 1000;
    await existingUser.save({ validateBeforeSave: false });
    try {
      await sendOTPEmail(email, otp, name);
      return res.status(201).json({
        status: 'success',
        message: 'Account exists but is not verified. A new verification OTP has been sent to your email.'
      });
    } catch (err) {
      existingUser.otpCode = undefined;
      existingUser.otpExpires = undefined;
      await existingUser.save({ validateBeforeSave: false });
      return next(new AppError('Failed to send verification email. Please try again.', 500));
    }
  }
  const approvalStatus =
    role === 'RECRUITER' || role === 'COLLEGE_ADMIN' ? 'PENDING' : 'NOT_REQUIRED';
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    approvalStatus
  });
  const otp = generateOTP();
  newUser.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
  newUser.otpExpires = Date.now() + 10 * 60 * 1000;
  await newUser.save({ validateBeforeSave: false });
  try {
    await sendOTPEmail(email, otp, name);
    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please check your email for a verification OTP.'
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    return next(new AppError('Failed to send verification email. Please try again.', 500));
  }
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
    const adminId = process.env.SUPER_ADMIN_ID || 'super_admin';
    const token = generateToken(adminId, 'SUPER_ADMIN');
    return res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: adminId,
          role: 'SUPER_ADMIN',
          name: 'Super Admin',
          email: process.env.SUPER_ADMIN_EMAIL,
          needsRole: false,
          pendingApproval: false,
          approvalStatus: 'NOT_REQUIRED'
        }
      }
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.password) {
    return next(new AppError('No account found with this email, or you must use Google/OTP login.', 401));
  }
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (!user.isVerified) {
    return next(new AppError('Please verify your email before logging in', 403));
  }
  if (!user.isActive) {
    return next(new AppError('Your account has been suspended.', 403));
  }
  const token = generateToken(user._id, user.role || 'NONE');
  res.status(200).json({
    status: 'success',
    token,
    data: { user: buildUserPayload(user) }
  });
});
exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (
    email === process.env.SUPER_ADMIN_EMAIL &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {
    const token = generateToken(process.env.SUPER_ADMIN_ID || 'super_admin', 'SUPER_ADMIN');
    return res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: process.env.SUPER_ADMIN_ID || 'super_admin',
          role: 'SUPER_ADMIN',
          name: 'Super Admin',
          email: process.env.SUPER_ADMIN_EMAIL,
          needsRole: false,
          pendingApproval: false,
          approvalStatus: 'NOT_REQUIRED'
        }
      }
    });
  }
  return next(new AppError('Invalid admin credentials', 401));
});
exports.getMe = catchAsync(async (req, res, next) => {
  const currentId = req.user._id || req.user.id;
  
  if (currentId === (process.env.SUPER_ADMIN_ID || 'super_admin')) {
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: currentId,
          role: 'SUPER_ADMIN',
          name: 'Super Admin',
          email: process.env.SUPER_ADMIN_EMAIL,
          needsRole: false,
          pendingApproval: false,
          approvalStatus: 'NOT_REQUIRED'
        }
      }
    });
  }

  const user = await User.findById(currentId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { user: buildUserPayload(user) }
  });
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }
  const otp = generateOTP();
  user.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  try {
    await sendOTPEmail(user.email, otp, user.name);
    res.status(200).json({
      status: 'success',
      message: 'Password reset OTP sent to email!'
    });
  } catch (err) {
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});
exports.checkResetOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new AppError('Email and OTP are required', 400));
  }
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await User.findOne({
    email,
    otpCode: hashedOTP,
    otpExpires: { $gt: Date.now() }
  });
  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }
  res.status(200).json({
    status: 'success',
    message: 'OTP is valid'
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return next(new AppError('Email, OTP, and new password are required', 400));
  }
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await User.findOne({
    email,
    otpCode: hashedOTP,
    otpExpires: { $gt: Date.now() }
  }).select('+otpCode +otpExpires');
  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }
  user.password = newPassword;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();
  const token = generateToken(user._id, user.role);
  res.status(200).json({
    status: 'success',
    token,
    data: { user: buildUserPayload(user) }
  });
});
exports.updateProfile = catchAsync(async (req, res, next) => {
  const {
    nickname,
    dateOfBirth,
    phoneNumber,
    gender,
    country,
    expertise
  } = req.body;
  const user = await User.findById(req.user._id || req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (nickname) user.nickname = nickname;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (gender) user.gender = gender;
  if (country) user.country = country;
  if (expertise && Array.isArray(expertise)) user.expertise = expertise;
  user.profileCompleted = true;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'success',
    data: { user: buildUserPayload(user) }
  });
});
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please provide an image file.', 400));
  }
  const user = await User.findById(req.user._id || req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  let avatarUrl;
  const cloudinaryConfigured =
    process.env.CLOUDINARY_IMAGE_CLOUD_NAME &&
    process.env.CLOUDINARY_IMAGE_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_IMAGE_API_KEY &&
    process.env.CLOUDINARY_IMAGE_API_KEY !== 'your_api_key';
  if (cloudinaryConfigured) {
    const { uploadImageToCloudinary } = require('../../config/cloudinary');
    let fileBuffer = req.file.buffer;
    if (!fileBuffer && req.file.path) {
      const fs = require('fs');
      fileBuffer = fs.readFileSync(req.file.path);
      fs.unlink(req.file.path, () => {});
    }
    let result;
    try {
      result = await uploadImageToCloudinary(fileBuffer, 'avatars');
    } catch (err) {
      return next(new AppError('Cloudinary upload failed. Please try again.', 500));
    }
    avatarUrl = result.secure_url;
  } else {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
  }
  user.avatar = avatarUrl;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'success',
    data: { avatarUrl }
  });
});
