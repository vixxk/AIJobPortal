const crypto = require('crypto');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const fireworksService = require('../../services/fireworks.service');
const InterviewSession = require('./interviewSession.model');

exports.generateQuestions = catchAsync(async (req, res, next) => {
    const { jobRole, studentProfile, jobDescription } = req.body;
    
    // Create a robust prompt for generating technical and behavioral questions tailored to the user profile 
    const systemPrompt = `You are an expert HR and Technical Recruiter. Based on the following information, generate 5 highly relevant interview questions (2 behavioral, 3 technical). The questions must evaluate key responsibilities from the job description and the candidate's core skills.
    
    Return ONLY a raw JSON format:
    {
        "questions": [
            "question 1",
            "question 2",
            "question 3",
            "question 4",
            "question 5"
        ]
    }`;

    const userPrompt = `Job Role: ${jobRole}
Job Description: ${jobDescription || 'Not specified'}
Candidate Skills: ${studentProfile || 'Not specified'}`;

    try {
        const generatedJSON = await fireworksService.generateCompletion(systemPrompt, userPrompt);
        const structuredQuestions = generatedJSON.questions || [];
        
        res.status(200).json({
            status: 'success',
            data: {
                questions: structuredQuestions
            }
        });
    } catch (err) {
        console.error('Failed to generate questions:', err);
        return next(new AppError('Failed to generate questions using AI service', 500));
    }
});

exports.createSession = catchAsync(async (req, res, next) => {
    const { studentId, jobId, applicationId, questions } = req.body;
    
    if (!questions || questions.length === 0) {
        return next(new AppError('Please provide questions for the interview', 400));
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    const session = await InterviewSession.create({
        recruiterId: req.user.id,
        studentId,
        jobId,
        applicationId,
        questions,
        token,
        status: 'PENDING'
    });

    res.status(201).json({
        status: 'success',
        data: {
            session
        }
    });
});

exports.getSessionByToken = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    
    const session = await InterviewSession.findOne({ token }).populate('jobId', 'title company');
    
    if (!session) {
        return next(new AppError('Invalid or expired interview link', 404));
    }
    
    if (session.status === 'COMPLETED') {
        return next(new AppError('This interview has already been completed', 400));
    }

    res.status(200).json({
        status: 'success',
        data: {
            session: {
                _id: session._id,
                jobTitle: session.jobId?.title || 'Job Interview',
                questions: session.questions,
            }
        }
    });
});

exports.completeSession = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { report } = req.body;
    
    if (!report) {
         return next(new AppError('Please provide the interview report', 400));
    }

    const session = await InterviewSession.findOne({ token });
    if (!session) {
        return next(new AppError('Invalid interview link', 404));
    }
    
    session.status = 'COMPLETED';
    session.report = report;
    await session.save();

    res.status(200).json({
        status: 'success',
        data: {
            session
        }
    });
});

exports.getReport = catchAsync(async (req, res, next) => {
    const { applicationId } = req.params;
    
    const session = await InterviewSession.findOne({ applicationId });
    
    if (!session) {
        return next(new AppError('No interview session found for this application', 404));
    }

    // Role check: Admin, or the Recruiter of this session, or Student
    const isOwner = session.recruiterId.toString() === req.user.id || session.studentId.toString() === req.user.id;
    if (req.user.role !== 'SUPER_ADMIN' && !isOwner) {
         return next(new AppError('You do not have permission to view this report', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            session
        }
    });
});
