const User = require('../user/user.model');
const Job = require('../job/job.model');
const Application = require('../application/application.model');
const MockTest = require('../mocktest/mocktest.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');
const sendEmail = require('../../config/mailer');

// ─── Analytics ───────────────────────────────────────────────────────────────
exports.getAnalyticsSummary = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  const totalMockTests = await MockTest.countDocuments();
  const pendingApprovals = await User.countDocuments({ approvalStatus: 'PENDING' });

  res.status(200).json({
    status: 'success',
    data: {
      analytics: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalMockTests,
        pendingApprovals
      }
    }
  });
});

// ─── Get Pending Users ────────────────────────────────────────────────────────
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

// ─── Approve / Reject User ────────────────────────────────────────────────────
exports.updateUserApproval = catchAsync(async (req, res, next) => {
  const { action } = req.body; // 'approve' | 'reject'
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

    // Notify user
    try {
      await Notification.create({
        userId: user._id,
        title: 'Account Approved! 🎉',
        message: `Your ${user.role === 'RECRUITER' ? 'recruiter' : 'college'} account has been approved. You can now access all features.`,
        type: 'ACCOUNT_APPROVAL'
      });
    } catch (e) { /* ignore notification errors */ }

    // Send approval email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your JobPortal Account Has Been Approved!',
        message: `Hi ${user.name}, your account has been approved. You can now log in and start using JobPortal.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #1e293b;">Account Approved! 🎉</h2>
            <p style="color: #475569;">Hi ${user.name},</p>
            <p style="color: #475569;">Your <strong>${user.role === 'RECRUITER' ? 'Recruiter' : 'College'}</strong> account on JobPortal has been approved by our admin team.</p>
            <p style="color: #475569;">You can now log in and access all features available to you.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Login Now</a>
          </div>
        `
      });
    } catch (e) { /* ignore email errors */ }

    res.status(200).json({
      status: 'success',
      message: `User approved successfully`,
      data: { user: { id: user._id, name: user.name, role: user.role, approvalStatus: user.approvalStatus } }
    });
  } else {
    user.approvalStatus = 'REJECTED';
    await user.save({ validateBeforeSave: false });

    // Send rejection email
    try {
      await sendEmail({
        email: user.email,
        subject: 'JobPortal Account Application Update',
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
    } catch (e) { /* ignore email errors */ }

    res.status(200).json({
      status: 'success',
      message: `User rejected`,
      data: { user: { id: user._id, name: user.name, role: user.role, approvalStatus: user.approvalStatus } }
    });
  }
});

// ─── List All Users ───────────────────────────────────────────────────────────
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

// ─── Ban User ────────────────────────────────────────────────────────────────
exports.banUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'User banned successfully'
  });
});

// ─── Delete Job ───────────────────────────────────────────────────────────────
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
