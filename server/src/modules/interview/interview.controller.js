const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const aiService = require('../../services/ai.service');

exports.startInterview = catchAsync(async (req, res, next) => {
    const { job_role, interview_type } = req.body;

    let resumeText = '';
    if (req.file) {
        try {
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(req.file.buffer);
            resumeText = data.text || '';
            console.log(`[Interview] Extracted ${resumeText.length} chars from resume: ${req.file.originalname}`);
        } catch (err) {
            console.error('Resume PDF extraction failed:', err.message);
        }
    }

    const result = await aiService.generateQuestionsV2(
        job_role || 'Software Engineer',
        interview_type || 'behavioral',
        resumeText
    );

    if (!result.role_clear) {
        return res.status(200).json({
            status: 'success',
            data: {
                role_clear: false,
                suggestions: result.suggestions || []
            }
        });
    }

    console.log(`[Interview] Started: role=${job_role}, 5 questions generated`);
    res.status(200).json({
        status: 'success',
        data: {
            role_clear: true,
            questions: result.questions || []
        }
    });
});

exports.processAnswer = catchAsync(async (req, res, next) => {
    const { question, job_role } = req.body;
    if (!req.file) {
        return next(new AppError('Please upload audio file', 400));
    }

    console.log(`[Interview] Evaluating answer for: ${question.substring(0, 60)}...`);

    // Transcribe audio via Fireworks Whisper (returns segments + duration)
    const sttResult = await aiService.transcribeAudio(req.file.buffer, req.file.originalname);
    const transcript = sttResult.text || '';

    // Build audio metrics from real Whisper segment timestamps
    const analysis = aiService.buildMetricsFromSegments(transcript, sttResult.segments, sttResult.duration);
    analysis.transcript = transcript;
    analysis.confidence = sttResult.confidence;

    // AI Evaluation
    const evaluation = await aiService.evaluateAnswer(
        question,
        transcript,
        analysis,
        job_role
    );

    res.status(200).json({
        status: 'success',
        data: {
            analysis,
            evaluation
        }
    });
});

exports.generateReport = catchAsync(async (req, res, next) => {
    const { answers, job_role } = req.body;
    const result = await aiService.generateReport(answers, job_role);

    // Send notification after report generation
    try {
        const Notification = require('../notification/notification.model');
        await Notification.create({
            userId: req.user.id,
            title: 'Interview Report Generated',
            message: `Your AI interview for ${job_role} is complete. Overall Score: ${result.data?.overall_score || 'N/A'}/100.`,
            type: 'INTERVIEW_REPORT',
            link: '/app/interview'
        });
    } catch (err) {
        console.error('Notification Error:', err);
    }

    res.status(200).json(result);
});

exports.transcribeAudio = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload audio file', 400));
    }
    const analysis = await aiService.analyzeAudio(req.file.buffer, req.file.originalname);
    res.status(200).json({
        status: 'success',
        data: {
            analysis
        }
    });
});

exports.speakText = catchAsync(async (req, res, next) => {
    const { text, voice } = req.body;
    if (!text) {
        return next(new AppError('Please provide text to convert to speech', 400));
    }
    const audioBuffer = await aiService.speakText(text, voice);
    res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength
    });
    res.send(Buffer.from(audioBuffer));
});
