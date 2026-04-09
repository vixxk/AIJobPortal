const Application = require('./application.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');
const Job = require('../job/job.model');
const sendEmail = require('../../config/mailer');
const User = require('../user/user.model');
const { getSignedUrl } = require('../../config/aws');

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

  if (!req.body.resume) {
    return next(new AppError('Please provide a resume for your application.', 400));
  }

  // 4. Calculate AI Matching Score
  let matchingScore = 45; // Enhanced base score
  try {
      const StudentProfile = require('../student/student.model');
      const profile = await StudentProfile.findOne({ userId });
      if (profile) {
          const jobText = (job.title + ' ' + (job.description || '') + ' ' + (job.skillsRequired || []).join(' ')).toLowerCase();
          const studentSkills = [...(profile.skills || []), ...(req.user.expertise || [])].map(s => s.toLowerCase());
          
          let matches = 0;
          studentSkills.forEach(skill => {
              if (jobText.includes(skill)) matches++;
          });
          
          if (studentSkills.length > 0) {
              const matchRatio = matches / Math.sqrt(studentSkills.length + 1);
              matchingScore = Math.min(98, 45 + Math.round(matchRatio * 35));
          }
      }
  } catch (err) {
      console.error("AI Match Calculation Error:", err);
  }

  let resumeToSave = req.body.resume;
  if (resumeToSave && resumeToSave.includes('.amazonaws.com/')) {
      // Extract the key and remove any query parameters (like presigned URL signatures)
      resumeToSave = resumeToSave.split('.amazonaws.com/')[1].split('?')[0];
  }

  const newApp = await Application.create({
    studentId: userId,
    jobId: req.body.jobId,
    resume: resumeToSave,
    matchingScore,
    aiSummary: matchingScore > 85 
        ? "Highly recommended candidate with an exceptional alignment of skills and potential. Profile shows high relevance to the job requirements." 
        : matchingScore > 65
            ? "Strong match with several core competencies identified. Demonstrates relevant technical knowledge for the role."
            : "Candidate shows baseline qualifications for the role. Recommended for initial screening to assess specific niche skills."
  });

  await Notification.create({
      userId: job.recruiterId,
      title: 'New Application',
      message: `A new student applied for the job: ${job.title} (Match Score: ${matchingScore}%)`,
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
    const profile = await StudentProfile.findOne({ userId: app.studentId._id }).lean();
    if (profile && profile.resumeUrl && profile.resumeUrl.includes('s3')) {
      const key = profile.resumeUrl.split('.amazonaws.com/')[1]?.split('?')[0];
      if (key) profile.resumeUrl = await getSignedUrl(key);
    }
    
    // Also sign the application's resume field
    if (app.resume && !app.resume.startsWith('http')) {
        app.resume = await getSignedUrl(app.resume);
    } else if (app.resume && app.resume.includes('s3')) {
        const key = app.resume.split('.amazonaws.com/')[1]?.split('?')[0];
        if (key) app.resume = await getSignedUrl(key);
    }

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
      userId: application.studentId._id || application.studentId,
      title: 'Application Status Update',
      message: `Your application for ${job.title} is now: ${status}`,
      type: 'APPLICATION_UPDATE',
      link: '/app/applications'
  });

  // Email Notification
  try {
      const sendEmail = require('../../config/mailer');
      const studentUser = await User.findById(application.studentId._id || application.studentId);
      if (studentUser && studentUser.email) {
          let subject = `Application Update: ${job.title}`;
          let bannerColor = '#4f46e5';
          let customMessage = `Your application for '${job.title}' has been moved to: ${status}.`;

          if (status === 'HIRED') {
              subject = `Congratulations! You are Hired for ${job.title}`;
              bannerColor = '#10b981';
              customMessage = `We are thrilled to inform you that you have been <b>Hired</b> for the <b>${job.title}</b> position! Our team was highly impressed with your profile.`;
          } else if (status === 'REJECTED') {
              subject = `Update regarding your application for ${job.title}`;
              bannerColor = '#ef4444';
              customMessage = `Thank you for your interest in the ${job.title} position. After careful review, we have decided to move forward with other candidates at this time.`;
          } else if (status === 'SHORTLISTED') {
              bannerColor = '#f59e0b';
              customMessage = `Great news! You have been <b>Shortlisted</b> for the <b>${job.title}</b> role. We will reach out soon for next steps.`;
          }

          await sendEmail({
              email: studentUser.email,
              subject: subject,
              message: customMessage.replace(/<[^>]*>/g, ''),
              html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-top: 5px solid ${bannerColor}; padding: 20px;">
                  <h2 style="color: ${bannerColor};">Application Status Update</h2>
                  <p>Hi <b>${studentUser.name}</b>,</p>
                  <p>${customMessage}</p>
                  <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase;">Current Status</p>
                    <p style="margin: 5px 0 0; font-size: 18px; font-weight: 800; color: ${bannerColor};">${status}</p>
                  </div>
                  ${feedback ? `<p><b>Message from Recruiter:</b><br/>${feedback}</p>` : ''}
                  <p>Please log in to your dashboard to view full details and any action items.</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0 20px;"/>
                  <p style="font-size: 13px; color: #9ca3af;">Sent by ${job.companyName || 'Recruitment Team'} via Hyrego AI</p>
                </div>
              `
          });
      }
  } catch (err) {
      console.error("Email notification failed", err);
  }
  res.status(200).json({
    status: 'success',
    data: {
      application
    }
  });
});
exports.smartMatchApplicants = catchAsync(async (req, res, next) => {
    const { keywords } = req.body;
    const { jobId } = req.params;

    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) return next(new AppError('Job not found or access denied', 404));

    const applications = await Application.find({ jobId })
        .populate('studentId', 'name email expertise avatar phoneNumber gender country dateOfBirth nickname')
        .lean();

    const StudentProfile = require('../student/student.model');
    const keywordList = keywords ? keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k) : [];

    const scoredApplications = await Promise.all(applications.map(async (app) => {
        const profile = await StudentProfile.findOne({ userId: app.studentId?._id }).lean();
        if (profile && profile.resumeUrl && profile.resumeUrl.includes('s3')) {
            const key = profile.resumeUrl.split('.amazonaws.com/')[1]?.split('?')[0];
            if (key) profile.resumeUrl = await getSignedUrl(key);
        }

        // Also sign the application's resume field
        let applicationResume = app.resume;
        if (applicationResume && !applicationResume.startsWith('http')) {
            applicationResume = await getSignedUrl(applicationResume);
        } else if (applicationResume && applicationResume.includes('s3')) {
            const key = applicationResume.split('.amazonaws.com/')[1]?.split('?')[0];
            if (key) applicationResume = await getSignedUrl(key);
        }
        
        let bonus = 0;
        
        const jobTitleWords = job.title.toLowerCase().split(' ').filter(w => w.length > 2);
        const studentText = `
            ${app.studentId?.name || ''} 
            ${(app.studentId?.expertise || []).join(' ')} 
            ${(profile?.skills || []).join(' ')} 
            ${profile?.summary || ''} 
            ${profile?.currentPosition || ''}
        `.toLowerCase();

        let titleMatches = 0;
        jobTitleWords.forEach(word => {
            if (studentText.includes(word.toLowerCase())) titleMatches++;
        });
        
        // Base Title Score (up to 40 points)
        const titleScore = jobTitleWords.length > 0 
            ? Math.min(40, (titleMatches / jobTitleWords.length) * 40) 
            : 20;

        let keywordScore = 0;
        if (keywordList.length > 0) {
            let matchedCount = 0;
            keywordList.forEach(k => {
                // Escape special characters for regex (like Node.js, C#, C++)
                const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // Use a modern boundary check that supports tech suffix (.js, #)
                // We'll check for word boundary OR end of string/space
                const regex = new RegExp(`(^|\\s|\\W)${escapedK}(\\s|\\W|$)`, 'i');
                
                if (regex.test(studentText)) {
                    matchedCount += 1;
                } else if (studentText.includes(k.toLowerCase())) {
                    matchedCount += 0.4; // Partial match (substring)
                }
            });
            
            // Keyword Score (up to 60 points)
            keywordScore = (matchedCount / keywordList.length) * 60;
        } else {
            // Default baseline if no keywords are provided
            keywordScore = 30; 
        }
        
        // Final Score calculation
        let finalWeightedScore = Math.round(titleScore + keywordScore);
        
        // STRICT CAPPING: If keywords were provided but ZERO matched, cap the score at 40%
        if (keywordList.length > 0 && keywordScore === 0) {
            finalWeightedScore = Math.min(40, finalWeightedScore);
        }

        // Final Clamp
        finalWeightedScore = Math.min(100, Math.max(10, finalWeightedScore));

        return {
            ...app,
            resume: applicationResume,
            studentProfile: profile,
            matchingScore: finalWeightedScore,
            weightedScore: finalWeightedScore
        };

    }));

    scoredApplications.sort((a, b) => b.weightedScore - a.weightedScore);

    res.status(200).json({
        status: 'success',
        data: {
            applications: scoredApplications
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

    const applicationsWithSignedUrls = await Promise.all(applications.map(async (app) => {
        if (app.resume && !app.resume.startsWith('http')) {
            app.resume = await getSignedUrl(app.resume);
        } else if (app.resume && app.resume.includes('s3')) {
            const key = app.resume.split('.amazonaws.com/')[1]?.split('?')[0];
            if (key) app.resume = await getSignedUrl(key);
        }
        return app;
    }));

    const total = await Application.countDocuments({ studentId: userId });
    res.status(200).json({
      status: 'success',
      results: applicationsWithSignedUrls.length,
      pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
      },
      data: {
        applications: applicationsWithSignedUrls
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
