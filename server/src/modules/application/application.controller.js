const Application = require('./application.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');
const Job = require('../job/job.model');
exports.applyToJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.body.jobId);
  if (!job || job.status === 'CLOSED') {
      return next(new AppError('Job not found or is closed to applications', 404));
  }
  const existingApp = await Application.findOne({ studentId: req.user.id, jobId: req.body.jobId });
  if (existingApp) {
    return next(new AppError('You have already applied to this job', 400));
  }
  const newApp = await Application.create({
    studentId: req.user.id,
    jobId: req.body.jobId
  });
  await Notification.create({
      userId: job.recruiterId,
      title: 'New Application',
      message: `A new student applied for the job: ${job.title}`,
      type: 'APPLICATION_UPDATE'
  });
  res.status(201).json({
    status: 'success',
    data: {
      application: newApp
    }
  });
});
exports.getJobApplicants = catchAsync(async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.jobId, recruiterId: req.user.id });
  if (!job) {
      return next(new AppError('Job not found or permission denied', 404));
  }
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  const applications = await Application.find({ jobId: req.params.jobId })
    .populate('studentId', 'name email')
    .skip(skip)
    .limit(limit)
    .lean();
  const total = await Application.countDocuments({ jobId: req.params.jobId });
  res.status(200).json({
    status: 'success',
    results: applications.length,
    pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
    },
    data: {
      applications
    }
  });
});
exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { status, feedback } = req.body;
  if (!status) {
      return next(new AppError('Please provide a new status', 400));
  }
  const application = await Application.findById(req.params.id);
  if (!application) {
    return next(new AppError('Application not found', 404));
  }
  const job = await Job.findOne({ _id: application.jobId, recruiterId: req.user.id });
  if (!job) {
       return next(new AppError('Permission denied', 403));
  }
  application.status = status;
  if (feedback) application.feedback = feedback;
  application.timeline.push({ status, date: Date.now() });
  await application.save();
  await Notification.create({
      userId: application.studentId,
      title: 'Application Status Updated',
      message: `Your application for ${job.title} is now: ${status}`,
      type: 'APPLICATION_UPDATE'
  });
  res.status(200).json({
    status: 'success',
    data: {
      application
    }
  });
});
exports.getMyApplications = catchAsync(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId', 'title company location status')
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Application.countDocuments({ studentId: req.user.id });
    res.status(200).json({
      status: 'success',
      results: applications.length,
      pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
      },
      data: {
        applications
      }
    });
});