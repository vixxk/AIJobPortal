const Job = require('./job.model');
const RecruiterProfile = require('../recruiter/recruiter.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
exports.createJob = catchAsync(async (req, res, next) => {
  const profile = await RecruiterProfile.findOne({ userId: req.user.id });
  if (!profile || !profile.approved) {
    return next(new AppError('Only approved recruiters can post jobs', 403));
  }
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
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiterId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!job) {
    return next(new AppError('No job found with that ID or you do not have permission', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      job
    }
  });
});
exports.closeJob = catchAsync(async (req, res, next) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiterId: req.user.id },
    { status: 'CLOSED' },
    { new: true }
  );
  if (!job) {
    return next(new AppError('No job found with that ID or you do not have permission', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      job
    }
  });
});
exports.deleteJob = catchAsync(async (req, res, next) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, recruiterId: req.user.id });
  if (!job) {
    return next(new AppError('No job found with that ID or you do not have permission', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.getAllJobs = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);
  if (queryObj.skillsRequired) {
    queryObj.skillsRequired = { $in: queryObj.skillsRequired.split(',') };
  }
  if (!queryObj.status) {
      queryObj.status = 'OPEN';
  }
  let query = Job.find(queryObj);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit).lean();
  const jobs = await query;
  const total = await Job.countDocuments(queryObj);
  res.status(200).json({
    status: 'success',
    results: jobs.length,
    pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
    },
    data: {
      jobs
    }
  });
});
exports.getJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate('recruiterId', 'name email').lean();
  if (!job) {
    return next(new AppError('No job found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      job
    }
  });
});