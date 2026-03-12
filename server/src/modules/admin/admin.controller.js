const User = require('../user/user.model');
const Job = require('../job/job.model');
const Application = require('../application/application.model');
const Course = require('../course/course.model');
const Lecture = require('../course/lecture.model');
const Competition = require('../competition/competition.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');
const sendEmail = require('../../config/mailer');
exports.getAnalyticsSummary = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  const totalCompetitions = await Competition.countDocuments();
  const totalCourses = await Course.countDocuments();
  const pendingApprovals = await User.countDocuments({ approvalStatus: 'PENDING' });
  res.status(200).json({
    status: 'success',
    data: {
      analytics: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompetitions,
        totalCourses,
        pendingApprovals
      }
    }
  });
});
exports.getPendingUsers = catchAsync(async (req, res, next) => {
  const pendingUsers = await User.find({ approvalStatus: 'PENDING' })
    .select('name email role approvalStatus avatar createdAt')
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: 'success',
    results: pendingUsers.length,
    data: { users: pendingUsers }
  });
});
exports.updateUserApproval = catchAsync(async (req, res, next) => {
  const { action } = req.body;
  const { userId } = req.params;
  if (!['approve', 'reject'].includes(action)) {
    return next(new AppError('Action must be "approve" or "reject"', 400));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.approvalStatus !== 'PENDING') {
    return next(new AppError('User is not in pending state', 400));
  }
  if (action === 'approve') {
    user.approvalStatus = 'APPROVED';
    await user.save({ validateBeforeSave: false });
    try {
      await Notification.create({
        userId: user._id,
        title: 'Account Approved! 🎉',
        message: `Your ${user.role === 'RECRUITER' ? 'recruiter' : 'college'} account has been approved. You can now access all features.`,
        type: 'ACCOUNT_APPROVAL'
      });
    } catch (e) {  }
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Gradnex Account Has Been Approved!',
        message: `Hi ${user.name}, your account has been approved. You can now log in and start using Gradnex.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #1e293b;">Account Approved! 🎉</h2>
            <p style="color: #475569;">Hi ${user.name},</p>
            <p style="color: #475569;">Your <strong>${user.role === 'RECRUITER' ? 'Recruiter' : 'College'}</strong> account on Gradnex has been approved by our admin team.</p>
            <p style="color: #475569;">You can now log in and access all features available to you.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Login Now</a>
          </div>
        `
      });
    } catch (e) {  }
    res.status(200).json({
      status: 'success',
      message: `User approved successfully`,
      data: { user: { id: user._id, name: user.name, role: user.role, approvalStatus: user.approvalStatus } }
    });
  } else {
    user.approvalStatus = 'REJECTED';
    await user.save({ validateBeforeSave: false });
    try {
      await sendEmail({
        email: user.email,
        subject: 'Gradnex Account Application Update',
        message: `Hi ${user.name}, unfortunately your account application was not approved at this time. Please contact support for more information.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #1e293b;">Account Application Update</h2>
            <p style="color: #475569;">Hi ${user.name},</p>
            <p style="color: #475569;">Unfortunately, your <strong>${user.role === 'RECRUITER' ? 'Recruiter' : 'College'}</strong> account application was not approved at this time.</p>
            <p style="color: #475569;">Please contact our support team for more information.</p>
          </div>
        `
      });
    } catch (e) {  }
    res.status(200).json({
      status: 'success',
      message: `User rejected`,
      data: { user: { id: user._id, name: user.name, role: user.role, approvalStatus: user.approvalStatus } }
    });
  }
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { role, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.approvalStatus = status;
  const users = await User.find(filter)
    .select('name email role approvalStatus isVerified isActive avatar createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await User.countDocuments(filter);
  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    data: { users }
  });
});
exports.banUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'success',
    message: `User ${user.isActive ? 'unbanned' : 'banned'} successfully`
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  await Job.deleteMany({ postedBy: req.params.userId });
  await Application.deleteMany({ studentId: req.params.userId });
  await Course.deleteMany({ teacher: req.params.userId });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true, runValidators: true });
  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.createTeacher = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  let avatar = req.body.avatar;
  if (req.file) {
    avatar = `/uploads/avatars/${req.file.filename}`;
  }

  const existing = await User.findOne({ email });
  if (existing) return next(new AppError('User with this email already exists', 400));
  const teacher = await User.create({
    name,
    email,
    password,
    avatar,
    role: 'TEACHER',
    isVerified: true,
    approvalStatus: 'NOT_REQUIRED'
  });
  res.status(201).json({
    status: 'success',
    data: { teacher }
  });
});

exports.getAllJobs = catchAsync(async (req, res, next) => {
  const jobs = await Job.find().sort('-createdAt').populate('postedBy', 'name email');
  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: { jobs }
  });
});

exports.createJob = catchAsync(async (req, res, next) => {
  const newJob = await Job.create({
    ...req.body,
    recruiterId: req.user.id
  });
  res.status(201).json({
    status: 'success',
    data: {
      job: newJob
    }
  });
});

exports.updateJob = catchAsync(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(req.params.jobId, req.body, { new: true });
  if (!job) return next(new AppError('Job not found', 404));
  res.status(200).json({
    status: 'success',
    data: { job }
  });
});

exports.deleteJob = catchAsync(async (req, res, next) => {
  const job = await Job.findByIdAndDelete(req.params.jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find().populate('teacher', 'name email');
  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: { courses }
  });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
  if (!course) return next(new AppError('Course not found', 404));
  res.status(200).json({
    status: 'success',
    data: { course }
  });
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
  await Course.findByIdAndDelete(req.params.courseId);
  await Lecture.deleteMany({ course: req.params.courseId });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllApplications = catchAsync(async (req, res, next) => {
  const applications = await Application.find()
    .populate('jobId', 'title')
    .populate('studentId', 'name email');
  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: { applications }
  });
});

// Mock tests removed

exports.getAllCompetitions = catchAsync(async (req, res, next) => {
  const competitions = await Competition.find().sort('-startDate');
  res.status(200).json({
    status: 'success',
    results: competitions.length,
    data: { competitions }
  });
});

exports.deleteCompetition = catchAsync(async (req, res, next) => {
  await Competition.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createCompetition = catchAsync(async (req, res, next) => {
  const data = { ...req.body };
  
  if (req.file) {
    data.bannerImage = `/uploads/avatars/${req.file.filename}`;
  }
  
  if (typeof data.rounds === 'string') {
    try {
      data.rounds = JSON.parse(data.rounds);
    } catch (e) {
      data.rounds = [];
    }
  }

  data.createdBy = req.user._id;

  const competition = await Competition.create(data);

  res.status(201).json({
    status: 'success',
    data: { competition }
  });
});
