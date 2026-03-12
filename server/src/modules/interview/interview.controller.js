const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const fireworksService = require('../../services/fireworks.service');
const pythonService = require('../../services/python.service');
const { parse } = require('pdf-parse');
const fs = require('fs');
exports.startInterview = catchAsync(async (req, res, next) => {
    const { job_role, interview_type } = req.body;
    const pythonResponse = await pythonService.startInterview({
        job_role,
        interview_type,
        resumePath: req.file ? req.file.path : null
    });
    res.status(200).json(pythonResponse);
});
exports.processAnswer = catchAsync(async (req, res, next) => {
    const { question, job_role } = req.body;
    if (!req.file) {
        return next(new AppError('Please upload audio file', 400));
    }
    const result = await pythonService.processAnswer({
        question,
        job_role,
        filePath: req.file.path
    });
    res.status(200).json(result);
});
exports.generateReport = catchAsync(async (req, res, next) => {
    const { answers, job_role } = req.body;
    const result = await pythonService.generateReport({
        answers,
        job_role
    });
    res.status(200).json(result);
});
exports.transcribeAudio = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload audio file', 400));
    }
    const result = await pythonService.analyzeAudio(req.file.path);
    res.status(200).json({
        status: 'success',
        data: {
            analysis: result
        }
    });
});
exports.speakText = catchAsync(async (req, res, next) => {
    const { text, voice } = req.body;
    if (!text) {
        return next(new AppError('Please provide text to convert to speech', 400));
    }
    const audioBuffer = await pythonService.speakText({ text, voice });
    res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength
    });
    res.send(Buffer.from(audioBuffer));
});
