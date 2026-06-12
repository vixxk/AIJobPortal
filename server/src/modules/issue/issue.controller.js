const Issue = require('./issue.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendEmail = require('../../config/mailer');

exports.createIssue = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return next(new AppError('Please provide both title and description', 400));
  }

  const issue = await Issue.create({
    userId: req.user.id,
    title,
    description
  });

  // Notify support email
  try {
    await sendEmail({
      email: process.env.SUPPORT_EMAIL || 'Support@hyergo.com',
      subject: `[User Report/Issue] ${title}`,
      message: `A new user report/issue has been submitted.

Reporter Details:
Name: ${req.user.name || 'N/A'}
Email: ${req.user.email || 'N/A'}
Role: ${req.user.role || 'N/A'}
User ID: ${req.user.id}

Issue Details:
Title: ${title}
Description:
${description}

---
Sent automatically by Hyergo Platform.`,
      name: 'Hyergo Support'
    });
  } catch (err) {
    console.error(`Failed to send email to ${process.env.SUPPORT_EMAIL || 'Support@hyergo.com'}:`, err);
  }

  res.status(201).json({
    status: 'success',
    data: {
      issue
    }
  });
});

exports.getAllIssues = catchAsync(async (req, res, next) => {
  const issues = await Issue.find().populate('userId', 'name email role');

  res.status(200).json({
    status: 'success',
    results: issues.length,
    data: {
      issues
    }
  });
});

exports.updateIssueStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  if (!['pending', 'resolved', 'closed'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!issue) {
    return next(new AppError('No issue found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      issue
    }
  });
});
