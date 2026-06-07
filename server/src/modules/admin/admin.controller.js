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
const { accountApprovedEmail, accountRejectedEmail } = require('../../config/emailTemplates');
const RecruiterProfile = require('../recruiter/recruiter.model');
const { CollegeProfile } = require('../college/college.model');
const Issue = require('../issue/issue.model');
const StudentProfile = require('../student/student.model');
const { uploadFile } = require('../../utils/fileUpload');
const Order = require('../payment/order.model');


exports.getAnalyticsSummary = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  const totalCompetitions = await Competition.countDocuments();
  const totalCourses = await Course.countDocuments();
  const pendingApprovals = await User.countDocuments({ approvalStatus: 'PENDING' });
  const pendingJobs = await Job.countDocuments({ status: 'PENDING' });
  const pendingCompetitions = await Competition.countDocuments({ status: 'PENDING' });
  const pendingIssues = await Issue.countDocuments({ status: 'pending' });
  
  res.status(200).json({
    status: 'success',
    data: {
      analytics: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompetitions,
        totalCourses,
        pendingApprovals,
        pendingJobs,
        pendingCompetitions,
        pendingIssues
      }
    }
  });
});
exports.getPendingUsers = catchAsync(async (req, res, next) => {
  const pendingUsers = await User.find({ approvalStatus: 'PENDING' })
    .select('name email role approvalStatus avatar createdAt phoneNumber')
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

    // Sync approval to profiles
    if (user.role === 'RECRUITER') {
      await RecruiterProfile.findOneAndUpdate({ userId: user._id }, { approved: true });
    } else if (user.role === 'COLLEGE_ADMIN') {
      await CollegeProfile.findOneAndUpdate({ userId: user._id }, { approved: true });
    }

    try {
      await Notification.create({
        userId: user._id,
        title: 'Account Approved! 🎉',
        message: `Your ${user.role === 'RECRUITER' ? 'recruiter' : 'college'} account has been approved. You can now access all features.`,
        type: 'ACCOUNT_APPROVAL'
      });
    } catch (e) {  }
    try {
      const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
      await sendEmail({
        email: user.email,
        subject: 'Your Hyrego Account Has Been Approved!',
        message: `Hi ${user.name}, your account has been approved. You can now log in and start using Hyrego.`,
        html: accountApprovedEmail(user.name, user.role, loginUrl)
      });
    } catch (e) {  }
    res.status(200).json({
      status: 'success',
      message: `User approved successfully`,
      data: { user: { id: user._id, name: user.name, role: user.role, approvalStatus: user.approvalStatus } }
    });
  } else {
    const { rejectionReason } = req.body;
    user.approvalStatus = 'REJECTED';
    await user.save({ validateBeforeSave: false });

    if (user.role === 'RECRUITER') {
      await RecruiterProfile.findOneAndUpdate(
        { userId: user._id },
        { 
          approved: false, 
          verificationSubmitted: false, 
          rejectionReason: rejectionReason || 'Information provided was insufficient or invalid.'
        }
      );
    } else if (user.role === 'COLLEGE_ADMIN') {
      await CollegeProfile.findOneAndUpdate({ userId: user._id }, { approved: false });
    }

    try {
      const reason = rejectionReason || 'Information provided was insufficient or invalid.';
      await sendEmail({
        email: user.email,
        subject: 'Hyrego Account Application Update',
        message: `Hi ${user.name}, unfortunately your account application was not approved at this time. Reason: ${reason}`,
        html: accountRejectedEmail(user.name, user.role, reason)
      });
    } catch (e) {  }
    res.status(200).json({
      status: 'success',
      message: `User rejected`,
      data: { user: { id: user._id, name: user.name, role: user.role, approvalStatus: user.approvalStatus } }
    });
  }
});
exports.getRecruiterProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const profile = await RecruiterProfile.findOne({ userId });
  if (!profile) {
    return next(new AppError('Recruiter profile not found', 404));
  }

  // Sign verification docs so that admin can download them
  const { getSignedUrl } = require('../../config/aws');
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

  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { role, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.approvalStatus = status;
  const users = await User.find(filter)
    .select('name email role approvalStatus isVerified isActive avatar createdAt phoneNumber')
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
  
  // Toggle active status
  user.isActive = !user.isActive;
  
  if (!user.isActive) {
    // If we're banning, mark as REJECTED
    user.approvalStatus = 'REJECTED';
    
    // Sync profile for recruiters/colleges
    if (user.role === 'RECRUITER') {
      await RecruiterProfile.findOneAndUpdate({ userId: user._id }, { approved: false });
    } else if (user.role === 'COLLEGE_ADMIN') {
      await CollegeProfile.findOneAndUpdate({ userId: user._id }, { approved: false });
    }
  } else {
    // If we're unbanning, we should restore approval for those who need it
    if (user.role === 'RECRUITER' || user.role === 'COLLEGE_ADMIN') {
      user.approvalStatus = 'APPROVED';
      
      // Sync profile back to approved
      if (user.role === 'RECRUITER') {
        await RecruiterProfile.findOneAndUpdate({ userId: user._id }, { approved: true });
      } else if (user.role === 'COLLEGE_ADMIN') {
        await CollegeProfile.findOneAndUpdate({ userId: user._id }, { approved: true });
      }
    }
  }

  await user.save({ validateBeforeSave: false });
  
  res.status(200).json({
    status: 'success',
    message: `User ${user.isActive ? 'unbanned and approved' : 'banned'} successfully`
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
    const result = await uploadFile(req.file, 'teachers/avatars', true, 'avatars');
    avatar = result.url;
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
  const jobs = await Job.find({ status: { $ne: 'DRAFT' } })
    .sort('-createdAt')
    .populate('recruiterId', 'name email')
    .populate('courseId', 'title');
    
  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: { jobs }
  });
});

exports.createJob = catchAsync(async (req, res, next) => {
  const jobData = {
    ...req.body,
    status: 'APPROVED',
    isSpecial: true,
  };

  // Handle file uploads for company logo and banner
  if (req.files) {
    if (req.files.companyLogo && req.files.companyLogo[0]) {
      const logoResult = await uploadFile(req.files.companyLogo[0], 'jobs/logos', true, 'avatars');
      jobData.companyLogo = logoResult.url;
    }
    if (req.files.companyBanner && req.files.companyBanner[0]) {
      const bannerResult = await uploadFile(req.files.companyBanner[0], 'jobs/banners', false, 'avatars');
      jobData.companyBanner = bannerResult.url;
    }
  }

  // Parse array fields if sent as strings
  if (typeof jobData.skillsRequired === 'string') {
    jobData.skillsRequired = jobData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (typeof jobData.responsibilities === 'string') {
    jobData.responsibilities = jobData.responsibilities.split('\n').map(s => s.trim()).filter(Boolean);
  }
  if (typeof jobData.eligibilityCriteria === 'string') {
    jobData.eligibilityCriteria = jobData.eligibilityCriteria.split('\n').map(s => s.trim()).filter(Boolean);
  }

  if (req.body.recruiterId) {
    jobData.recruiterId = req.body.recruiterId;
  } else if (req.user && req.user.role !== 'SUPER_ADMIN') {
    jobData.recruiterId = req.user._id;
  }

  const newJob = await Job.create(jobData);

  // Trigger notifications
  await notifyStudentsOfJob(newJob, true);

  res.status(201).json({
    status: 'success',
    data: {
      job: newJob
    }
  });
});

const notifyStudentsOfJob = async (job, isNewlyApproved) => {
  if (!job || job.status !== 'APPROVED') return;

  // Resolve company name properly
  let company = job.companyName;
  if (!company || company === 'Organization') {
    if (job.recruiterId) {
      const recProfile = await RecruiterProfile.findOne({ userId: job.recruiterId });
      if (recProfile && recProfile.companyName && recProfile.companyName !== 'Organization') {
        company = recProfile.companyName;
      } else {
        const recUser = await User.findById(job.recruiterId);
        if (recUser && recUser.name) {
          company = recUser.name;
        }
      }
    }
  }
  if (!company || company === 'Organization') {
    company = 'Hyrego Partner';
  }

  // 1. Handle Special Jobs
  if (job.isSpecial) {
    if (job.courseId) {
      // Course-specific special job: notify enrolled students
      const course = await Course.findById(job.courseId);
      if (course && course.enrolledStudents.length > 0) {
        const notifications = course.enrolledStudents.map(studentId => ({
          userId: studentId,
          title: 'Course Exclusive Job! 🚀',
          message: `New job "${job.title}" posted for ${course.title} students.`,
          type: 'JOB_POSTING',
          metadata: { jobId: job._id }
        }));
        await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
      }
    } else {
      // Global special job: notify ALL students (hyrego official)
      const allStudents = await User.find({ role: 'STUDENT', isActive: true }).select('_id');
      if (allStudents.length > 0) {
        const notifications = allStudents.map(student => ({
          userId: student._id,
          title: 'Hyrego Exclusive Job! ✨',
          message: `A new verified job "${job.title}" at ${company} is now live. Apply now!`,
          type: 'JOB_POSTING',
          metadata: { jobId: job._id }
        }));
        await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
      }
    }
  } else {
    // 2. Regular Jobs: Notify recruiter + Match skills for students
    if (isNewlyApproved && job.recruiterId) {
        await Notification.create({
          userId: job.recruiterId,
          title: 'Job Approved ✅',
          message: `Your job posting "${job.title}" has been approved and is now visible to students.`,
          type: 'JOB_POSTING',
          metadata: { jobId: job._id }
        }).catch(() => {});
    }


    // Notify students with matching skills
    const matchingProfiles = await StudentProfile.find({
      skills: { $in: job.skillsRequired }
    }).limit(50).select('userId');

    const studentUserIds = matchingProfiles.map(p => p.userId);

    if (studentUserIds.length > 0) {
      const notifications = studentUserIds.map(studentId => ({
        userId: studentId,
        title: 'New Job Match! 🎯',
        message: `A new job "${job.title}" at ${company} matches your skills. Check it out!`,
        type: 'JOB_MATCH',
        metadata: { jobId: job._id }
      }));
      await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
    }
  }
};

exports.updateJob = catchAsync(async (req, res, next) => {
  const oldJob = await Job.findById(req.params.jobId);
  if (!oldJob) return next(new AppError('Job not found', 404));

  const updateData = { ...req.body };

  // Handle file uploads for company logo and banner on update
  if (req.files) {
    if (req.files.companyLogo && req.files.companyLogo[0]) {
      const logoResult = await uploadFile(req.files.companyLogo[0], 'jobs/logos', true, 'avatars');
      updateData.companyLogo = logoResult.url;
    }
    if (req.files.companyBanner && req.files.companyBanner[0]) {
      const bannerResult = await uploadFile(req.files.companyBanner[0], 'jobs/banners', false, 'avatars');
      updateData.companyBanner = bannerResult.url;
    }
  }

  const job = await Job.findByIdAndUpdate(req.params.jobId, updateData, { new: true });
  
  // If status is updated to APPROVED, or a job becomes Special
  if (req.body.status === 'APPROVED' && oldJob.status !== 'APPROVED') {
    // Automatically mark as Hyrego/Special job when approved by admin
    job.isSpecial = true;
    await job.save();
    
    await notifyStudentsOfJob(job, true);
  } else if (job.status === 'APPROVED' && req.body.isSpecial === true && !oldJob.isSpecial) {

      await notifyStudentsOfJob(job, false);
  }

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
  const oldCourse = await Course.findById(req.params.courseId);
  if (!oldCourse) return next(new AppError('Course not found', 404));

  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });

  if (req.body.approvalStatus === 'APPROVED' && oldCourse.approvalStatus !== 'APPROVED') {
    try {
      await Notification.create({
        userId: course.teacher,
        title: 'Course Approved ✅',
        message: `Your course "${course.title}" has been approved.`,
        type: 'COURSE_UPDATE'
      });
    } catch (e) {}
  } else if (req.body.approvalStatus === 'REJECTED' && oldCourse.approvalStatus !== 'REJECTED') {
    try {
      await Notification.create({
        userId: course.teacher,
        title: 'Course Rejected ❌',
        message: `Your course creation request for "${course.title}" has been rejected.`,
        type: 'COURSE_UPDATE'
      });
    } catch (e) {}
  }

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
    .populate('jobId', 'title description location salaryRange responsibilities skillsRequired experienceRange status createdAt')
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

exports.getCompetitionDetails = catchAsync(async (req, res, next) => {
  const competition = await Competition.findById(req.params.id)
    .populate({
        path: 'participants',
        select: 'name email avatar studentProfile',
        populate: {
            path: 'studentProfile'
        }
    })
    .lean({ virtuals: true });

  if (!competition) return next(new AppError('Competition not found', 404));

  res.status(200).json({
    status: 'success',
    data: { competition }
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
    const result = await uploadFile(req.file, 'competitions/banners', false, 'avatars');
    data.bannerImage = result.url;
  }

  
  if (data.rounds) {
    if (typeof data.rounds === 'string') {
      try {
        data.rounds = JSON.parse(data.rounds);
      } catch (e) {
        data.rounds = [];
      }
    }
    if (Array.isArray(data.rounds)) {
      data.rounds = data.rounds.map(r => ({
        ...r,
        date: r.date === "" ? null : r.date
      }));
    }
  }

  data.createdBy = req.user._id;
  data.status = 'APPROVED';

  const competition = await Competition.create(data);

  res.status(201).json({
    status: 'success',
    data: { competition }
  });
});

exports.updateCompetition = catchAsync(async (req, res, next) => {
  const data = { ...req.body };
  
  if (req.file) {
    const result = await uploadFile(req.file, 'competitions/banners', false, 'avatars');
    data.bannerImage = result.url;
  }

  
  if (data.rounds) {
    if (typeof data.rounds === 'string') {
      try {
        data.rounds = JSON.parse(data.rounds);
      } catch (e) {
        data.rounds = [];
      }
    }
    if (Array.isArray(data.rounds)) {
      data.rounds = data.rounds.map(r => ({
        ...r,
        date: r.date === "" ? null : r.date
      }));
    }
  }

  const competition = await Competition.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true
  });

  if (!competition) return next(new AppError('Competition not found', 404));

  res.status(200).json({
    status: 'success',
    data: { competition }
  });
});

exports.downloadCompetitionParticipants = catchAsync(async (req, res, next) => {
    const competition = await Competition.findById(req.params.id)
        .populate({
            path: 'participants',
            select: 'name email studentProfile',
            populate: {
                path: 'studentProfile'
            }
        })
        .lean();

    if (!competition) return next(new AppError('No competition found with that ID', 404));

    if (!competition.participants || competition.participants.length === 0) {
        return next(new AppError('No participants to download.', 400));
    }

    const header = ['Name', 'Email', 'Phone', 'Skills', 'University', 'Degree', 'Current Position'];
    const rows = competition.participants.map(user => {
        const profile = user.studentProfile || {};
        return [
            user.name || '',
            user.email || '',
            profile.phoneNumber || '',
            (profile.skills || []).join('; '),
            (profile.education && profile.education[0]?.institution) || '',
            (profile.education && profile.education[0]?.degree) || '',
            profile.currentPosition || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [header.join(','), ...rows].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment(`${competition.title.replace(/\s+/g, '_')}_Participants.csv`);
    res.status(200).send(csvContent);
});

exports.getPendingCounts = catchAsync(async (req, res, next) => {
  const recruiters = await User.countDocuments({ role: 'RECRUITER', approvalStatus: 'PENDING' });
  const colleges = await User.countDocuments({ role: 'COLLEGE_ADMIN', approvalStatus: 'PENDING' });
  const students = await User.countDocuments({ role: 'STUDENT', approvalStatus: 'PENDING' });
  const teachers = await User.countDocuments({ role: 'TEACHER', approvalStatus: 'PENDING' });
  const jobs = await Job.countDocuments({ status: 'PENDING' });
  const courses = await Course.countDocuments({ approvalStatus: 'PENDING' });
  const competitions = await Competition.countDocuments({ status: 'PENDING' });
  const issues = await Issue.countDocuments({ status: 'pending' });
  const payments = await Order.countDocuments({ status: 'PENDING' });

  res.status(200).json({
    status: 'success',
    data: {
      recruiters,
      colleges,
      students,
      teachers,
      jobs,
      courses,
      competitions,
      issues,
      payments
    }
  });
});
