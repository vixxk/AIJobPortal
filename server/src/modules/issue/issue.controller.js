const Issue = require('./issue.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

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
