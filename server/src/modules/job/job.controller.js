const Job = require('./job.model');
const SavedJob = require('./savedJob.model');
const RecruiterProfile = require('../recruiter/recruiter.model');
const Application = require('../application/application.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const externalJobService = require('./job.service.external');
const Course = require('../course/course.model');
exports.createJob = catchAsync(async (req, res, next) => {
  const profile = await RecruiterProfile.findOne({ userId: req.user.id });
  
  // Use either the profile boolean or the User's approvalStatus from middleware
  const isApproved = profile?.approved || req.user.approvalStatus === 'APPROVED';
  
  if (!isApproved) {
    return next(new AppError('Only approved recruiters can post jobs', 403));
  }
  const newJob = await Job.create({
    ...req.body,
    companyName: req.body.companyName || profile?.companyName || 'Organization',
    recruiterId: req.user._id || req.user.id,
    status: 'PENDING'
  });
  res.status(201).json({
    status: 'success',
    data: {
      job: newJob
    }
  });
});
exports.updateJob = catchAsync(async (req, res, next) => {
  const updateData = { ...req.body };
  updateData.status = 'PENDING';
  
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiterId: req.user.id },
    updateData,
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

exports.getMyJobs = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const jobs = await Job.find({ recruiterId: userId }).sort('-createdAt').lean();
  
  const jobsWithApplicants = await Promise.all(jobs.map(async (job) => {
      const applicants = await Application.find({ jobId: job._id }).select('_id').lean();
      return { ...job, applicants };
  }));
  
  res.status(200).json({
    status: 'success',
    results: jobsWithApplicants.length,
    data: jobsWithApplicants
  });
});

exports.getRecruiterStats = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  
  // Get counts for active jobs
  const activeJobs = await Job.countDocuments({ recruiterId: userId, status: 'APPROVED' });
  
  // Get all job IDs for this recruiter to count applicants
  const jobIds = await Job.find({ recruiterId: userId }).distinct('_id');
  
  const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });

  res.status(200).json({
    status: 'success',
    data: {
      activeJobs,
      totalApplicants: totalApplicants || 0
    }
  });
});
exports.getAllJobs = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);
  if (queryObj.skillsRequired) {
    queryObj.skillsRequired = { $in: queryObj.skillsRequired.split(',') };
  }
  if (queryObj.isSpecial) {
    queryObj.isSpecial = queryObj.isSpecial === 'true';
  }
  if (!queryObj.status) {
      queryObj.status = 'APPROVED';
  }

  // Filter special jobs for students
  if (req.user && req.user.role === 'STUDENT') {
    const enrolledCourses = await Course.find({ enrolledStudents: req.user._id }).select('_id');
    const enrolledCourseIds = enrolledCourses.map(c => c._id);
    
    queryObj.$or = [
      { isSpecial: { $ne: true } },
      { isSpecial: true, courseId: { $in: enrolledCourseIds } }
    ];
  }

  let query = Job.find(queryObj).populate('recruiterId', 'companyName logo');
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

  // If not approved, only recruiter or admin can see it
  if (job.status !== 'APPROVED') {
      const isRecruiter = req.user && job.recruiterId && req.user.id === job.recruiterId._id.toString();
      const isAdmin = req.user && (req.user.role === 'SUPER_ADMIN');
      
      if (!isRecruiter && !isAdmin) {
          return next(new AppError('This job is pending approval.', 403));
      }
  }

  res.status(200).json({
    status: 'success',
    data: {
      job
    }
  });
});

exports.searchJobs = catchAsync(async (req, res, next) => {
  const { role, location, type, salaryRange, experience } = req.query;
  const jobs = await externalJobService.searchExternalJobs(role, location, type, salaryRange, experience);
  res.status(200).json({
    status: 'success',
    results: jobs.length,
    jobs: jobs
  });
});

exports.getSavedJobs = catchAsync(async (req, res, next) => {
  const currentId = req.user?._id;
  if (!currentId) return next(new AppError('Unauthorized', 401));

  if (currentId.toString() === (process.env.SUPER_ADMIN_ID || 'super_admin_001')) {
    return res.status(200).json({ status: 'success', results: 0, jobs: [] });
  }

  const savedJobs = await SavedJob.find({ userId: currentId }).sort({ createdAt: -1 }).lean();
  
  const validJobs = savedJobs
    .filter(sj => sj && sj.jobData)
    .map(sj => {
        try {
            return {
                ...sj.jobData,
                _id: sj.jobId || (sj.jobData._id ? sj.jobData._id.toString() : sj._id.toString()),
                mappingId: sj._id,
                savedAt: sj.createdAt
            };
        } catch (e) {
            return null;
        }
    })
    .filter(Boolean);
    
  res.status(200).json({
    status: 'success',
    results: validJobs.length,
    jobs: validJobs
  });
});

exports.saveJob = catchAsync(async (req, res, next) => {
  const { job } = req.body;
  console.log('--- SAVE JOB ---');
  console.log('Body:', JSON.stringify(req.body).slice(0, 500));
  if (!job) return next(new AppError('Job data is required', 400));
  
  const title = job.title || 'Untitled Position';
  const company = job.company || job.companyName || job.recruiterId?.companyName || 'Organization';
  const jobId = job._id || job.id || job.link || `${title}-${company}`.replace(/\s+/g, '-').toLowerCase();
  const currentId = req.user?._id || req.user?.id;
  
  console.log('--- SAVE JOB ---');
  console.log('User:', currentId);
  console.log('Calculated JobId:', jobId);

  if (currentId.toString() === (process.env.SUPER_ADMIN_ID || 'super_admin_001')) {
    return next(new AppError('Super Admin cannot save jobs', 400));
  }
  
  try {
    const newSavedJob = await SavedJob.findOneAndUpdate(
      { userId: currentId, jobId },
      { jobData: job },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('SAVE RESULT:', !!newSavedJob);
    if (newSavedJob) console.log('DOC ID:', newSavedJob._id);
    res.status(200).json({
      status: 'success',
      data: {
        savedJob: newSavedJob
      }
    });
  } catch (err) {
    console.error('ERROR SAVING JOB:', err);
    return next(err);
  }
});

exports.unsaveJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.body;
  if (!jobId) return next(new AppError('jobId is required', 400));
  
  const currentId = req.user?._id || req.user?.id;
  if (currentId.toString() === (process.env.SUPER_ADMIN_ID || 'super_admin_001')) {
    return next(new AppError('Super Admin cannot unsave jobs', 400));
  }
  
  await SavedJob.findOneAndDelete({ userId: currentId, jobId });
  
  res.status(200).json({
    status: 'success',
    message: 'Job removed from saved list'
  });
});
