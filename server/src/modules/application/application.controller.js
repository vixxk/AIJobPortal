const Application = require('./application.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');
const Job = require('../job/job.model');
const sendEmail = require('../../config/mailer');
const User = require('../user/user.model');
exports.applyToJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.body.jobId);
  if (!job || job.status === 'CLOSED') {
      return next(new AppError('Job not found or is closed to applications', 404));
  }

  // Check enrollment for special jobs
  if (job.isSpecial && job.courseId) {
    const Course = require('../course/course.model');
    const course = await Course.findById(job.courseId);
    if (!course || !course.enrolledStudents.includes(req.user.id)) {
      return next(new AppError('You must be enrolled in the related course to apply for this job.', 403));
    }
  }

  const userId = req.user._id;
  const existingApp = await Application.findOne({ studentId: userId, jobId: req.body.jobId });
  if (existingApp) {
    return next(new AppError('You have already applied to this job', 400));
  }
  const newApp = await Application.create({
    studentId: userId,
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
  const job = await Job.findOne({ _id: req.params.jobId, recruiterId: req.user._id });
  if (!job) {
    return next(new AppError('Job not found or permission denied', 404));
  }
  
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  // Manual populate for now or using aggregation for better performance.
  // 1. Get Applications
  const applications = await Application.find({ jobId: req.params.jobId })
    .populate('studentId', 'name email avatar phoneNumber gender country dateOfBirth nickname expertise')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

  // 2. Attach StudentProfile for each application
  const StudentProfile = require('../student/student.model');
  const applicationsWithProfile = await Promise.all(applications.map(async (app) => {
    const profile = await StudentProfile.findOne({ userId: app.studentId._id });
    return { ...app, studentProfile: profile };
  }));

  const total = await Application.countDocuments({ jobId: req.params.jobId });

  res.status(200).json({
    status: 'success',
    results: applicationsWithProfile.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: {
      applications: applicationsWithProfile
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
  const job = await Job.findOne({ _id: application.jobId, recruiterId: req.user._id });
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
    const userId = req.user._id;
    const applications = await Application.find({ studentId: userId })
      .populate('jobId', 'title company location status')
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Application.countDocuments({ studentId: userId });
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

exports.sendNotificationToApplicant = catchAsync(async (req, res, next) => {
    const { applicationId, message, type, meetingLink, scheduledDate, scheduledTime } = req.body;
    
    const application = await Application.findById(applicationId)
        .populate('studentId', 'name email')
        .populate('jobId', 'title');
        
    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    const job = await Job.findOne({ _id: application.jobId, recruiterId: req.user._id });
    if (!job) {
        return next(new AppError('You do not have permission to send notifications for this job', 403));
    }

    let notificationMessage = message;
    let emailSubject = `Update regarding your application for ${job.title}`;
    let emailHtml = '';

    if (type === 'MEETING') {
        const meetingInfo = `Meeting scheduled for ${scheduledDate} at ${scheduledTime}. Link: ${meetingLink}`;
        notificationMessage = message || `A meeting has been scheduled for your application. ${meetingInfo}`;
        emailSubject = `Interview Scheduled: ${job.title}`;
        emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e293b;">Interview Scheduled</h2>
                <p>Hi ${application.studentId.name},</p>
                <p>Great news! An interview has been scheduled for the <strong>${job.title}</strong> position.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p><strong>Date:</strong> ${scheduledDate}</p>
                    <p><strong>Time:</strong> ${scheduledTime}</p>
                    <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
                </div>
                ${message ? `<p><strong>Recruiter's Message:</strong><br>${message}</p>` : ''}
                <p>Good luck!</p>
            </div>
        `;
    } else {
        emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e293b;">Message from ${job.companyName || 'Recruiter'}</h2>
                <p>Hi ${application.studentId.name},</p>
                <p>You have received a new message regarding your application for <strong>${job.title}</strong>:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p>${message}</p>
                </div>
                <p>Please check the candidate portal for more details.</p>
            </div>
        `;
    }

    // 1. Create Platform Notification
    await Notification.create({
        userId: application.studentId._id,
        title: type === 'MEETING' ? 'Interview Scheduled' : 'New Message from Recruiter',
        message: notificationMessage,
        type: type === 'MEETING' ? 'INTERVIEW_SCHEDULE' : 'APPLICATION_UPDATE'
    });

    // 2. Send Email
    try {
        await sendEmail({
            email: application.studentId.email,
            subject: emailSubject,
            message: notificationMessage,
            html: emailHtml
        });
    } catch (err) {
        console.error('Failed to send email:', err);
        // We don't necessarily want to fail the whole request if email fails, 
        // as the platform notification was created.
    }

    res.status(200).json({
        status: 'success',
        message: 'Notification sent successfully'
    });
});
