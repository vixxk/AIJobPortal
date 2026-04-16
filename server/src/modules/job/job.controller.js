const Job = require('./job.model');
const SavedJob = require('./savedJob.model');
const RecruiterProfile = require('../recruiter/recruiter.model');
const Application = require('../application/application.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const externalJobService = require('./job.service.external');
const Course = require('../course/course.model');
exports.createJob = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const profile = await RecruiterProfile.findOne({ userId });
  
  // Use either the profile boolean or the User's approvalStatus from middleware
  // Also allow SUPER_ADMIN to bypass this check
  const isApproved = 
    req.user.role === 'SUPER_ADMIN' || 
    profile?.approved === true || 
    req.user.approvalStatus === 'APPROVED';
  
  if (!isApproved) {
    return next(new AppError('Only approved recruiters can post jobs. Your account may be pending approval.', 403));
  }

  const newJob = await Job.create({
    ...req.body,
    companyName: req.body.companyName || profile?.companyName || 'Organization',
    recruiterId: userId,
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
  const userId = req.user._id || req.user.id;
  
  // Check if recruiter is still approved
  const profile = await RecruiterProfile.findOne({ userId });
  const isApproved = req.user.role === 'SUPER_ADMIN' || profile?.approved === true || req.user.approvalStatus === 'APPROVED';
  
  if (!isApproved) {
    return next(new AppError('Your account approval is required to update jobs.', 403));
  }

  const updateData = { ...req.body };
  updateData.status = 'PENDING';
  
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiterId: userId },
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

exports.updateJobQuestions = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiterId: userId },
    { aiInterviewQuestions: req.body.aiInterviewQuestions },
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
  
  // Get counts for active jobs (Approved and live)
  const activeJobs = await Job.countDocuments({ recruiterId: userId, status: { $in: ['APPROVED', 'OPEN'] } });
  
  // Get all jobs regardless of status
  const totalJobs = await Job.countDocuments({ recruiterId: userId });

  // Get all job IDs for this recruiter to count applicants
  const jobIds = await Job.find({ recruiterId: userId }).distinct('_id');
  
  const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });

  res.status(200).json({
    status: 'success',
    data: {
      activeJobs,
      totalJobs,
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
    
    // Original queryObj might already have isSpecial: true from req.query
    // We want to ensure that if they are a student:
    // 1. They see non-special jobs
    // 2. They see special jobs IF (no courseId OR courseId is in their enrolled list)
    
    const studentFilter = {
      $and: [
          { status: 'APPROVED' },
          {
            $or: [
              { isSpecial: true },
              { courseId: { $ne: null } }
            ]
          },
          {
              $or: [
                  { courseId: { $exists: false } },
                  { courseId: null },
                  { courseId: { $in: enrolledCourseIds } }
              ]
          }
      ]
    };

    // Merge with existing queryObj
    if (queryObj.isSpecial === true) {
        // If they specifically asked for special jobs, only show those they have access to
        queryObj.courseId = { $in: [null, undefined, ...enrolledCourseIds] };
    } else {
        // Otherwise use the general student filter
        Object.assign(queryObj, studentFilter);
    }
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

// Public endpoint - no auth required, but conditionally hides apply link
exports.getPublicJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate('recruiterId', 'name email companyName logo').lean();
  if (!job) {
    return next(new AppError('No job found with that ID', 404));
  }

  // Only approved jobs are publicly visible
  if (job.status !== 'APPROVED') {
    return next(new AppError('This job is not available.', 404));
  }

  // If applyLinkVisibility is 'internal', hide the apply link unless user is logged in
  const isLoggedIn = !!req.user;
  const jobData = { ...job };
  
  if (job.applyLinkVisibility === 'internal' && !isLoggedIn) {
    jobData.applyLink = null;
    jobData.applyHidden = true;
  } else {
    jobData.applyHidden = false;
  }

  res.status(200).json({
    status: 'success',
    data: {
      job: jobData
    }
  });
});

exports.searchJobs = catchAsync(async (req, res, next) => {
  const { role, location, type, salaryRange, experience } = req.query;

  const internalJobsRaw = await Job.find({ status: 'APPROVED', isSpecial: { $ne: true } }).populate('recruiterId', 'companyName logo').lean();
  
  // Apply filtering in JavaScript for better flexibility (similar to externalJobService)
  let filteredInternal = internalJobsRaw.filter(job => {
    // Role/Search match
    if (role) {
       const roleLower = role.toLowerCase();
       const matchesRole = 
          job.title?.toLowerCase().includes(roleLower) || 
          job.companyName?.toLowerCase().includes(roleLower) ||
          job.recruiterId?.companyName?.toLowerCase().includes(roleLower) ||
          job.skillsRequired?.some(s => s.toLowerCase().includes(roleLower));
       if (!matchesRole) return false;
    }

    // Location match
    if (location && location !== 'any') {
      const locLower = location.toLowerCase();
      if (!job.location?.toLowerCase().includes(locLower)) return false;
    }

    // Type match
    if (type && type !== 'any') {
      const typeLower = type.toLowerCase().replace(/[\s-]/g, '');
      const jobTypeLower = (job.jobType || '').toLowerCase().replace(/[\s-]/g, '');
      if (!jobTypeLower.includes(typeLower)) return false;
    }

    // Experience match
    if (experience && experience !== 'any') {
      const expLower = experience.toLowerCase().replace(/[\s-]/g, '').replace('level', '');
      const jobExpLower = (job.experienceRange || '').toLowerCase().replace(/[\s-]/g, '').replace('level', '');
      if (jobExpLower === '' || expLower === '' || (!jobExpLower.includes(expLower) && !expLower.includes(jobExpLower))) return false;
    }

    // Salary match
    if (salaryRange && salaryRange !== 'any') {
        const jobSalary = (job.salaryRange || '').toLowerCase();
        const selectedRange = salaryRange.toLowerCase();
        
        let salaryMatch = jobSalary.includes(selectedRange.replace('₹', '').trim().replace(/\s/g, ''));
        if (!salaryMatch) {
            const jobNumsOrig = jobSalary.match(/\d+(\.\d+)?/g)?.map(Number) || [];
            const rangeNums = selectedRange.match(/\d+(\.\d+)?/g)?.map(Number) || [];
            
            const jobNums = jobNumsOrig.map(n => n > 1000 ? n / 100000 : n);
            
            if (rangeNums.length > 0 && jobNums.length > 0) {
                const maxJob = Math.max(...jobNums);
                const minJob = Math.min(...jobNums);
                
                if (selectedRange.includes('<')) {
                    salaryMatch = minJob < rangeNums[0];
                } else if (selectedRange.includes('>')) {
                    salaryMatch = maxJob > rangeNums[0];
                } else if (rangeNums.length >= 2) {
                    const [minR, maxR] = rangeNums;
                    salaryMatch = jobNums.some(n => n >= minR && n <= maxR) || 
                                 (minJob >= minR && minJob <= maxR) ||
                                 (maxJob >= minR && maxJob <= maxR);
                }
            }
        }
        if (!salaryMatch) return false;
    }

    return true;
  });

  const internalJobs = filteredInternal.map(job => ({
    _id: job._id,
    title: job.title,
    company: job.companyName || job.recruiterId?.companyName || 'Organization',
    location: job.location,
    type: job.jobType,
    salary: job.salaryRange || 'Not specified',
    link: `/hyrego/${job._id}`,
    snippet: job.description?.slice(0, 200) + '...',
    source: 'Hyrego',
    logo: job.companyLogo || job.recruiterId?.logo,
    isInternal: true
  }));

  // 2. Fetch External Jobs
  const externalJobs = await externalJobService.searchExternalJobs(role, location, type, salaryRange, experience);

  // Combine and prioritize internal jobs
  const combinedJobs = [...internalJobs, ...externalJobs];

  res.status(200).json({
    status: 'success',
    results: combinedJobs.length,
    jobs: combinedJobs
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
