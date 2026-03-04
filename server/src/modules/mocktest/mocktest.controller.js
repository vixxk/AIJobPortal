const MockTest = require('./mocktest.model');
const MockTestResult = require('./mocktestResult.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.createMockTest = catchAsync(async (req, res, next) => {
  const newMockTest = await MockTest.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      mockTest: newMockTest
    }
  });
});

exports.getAllMockTests = catchAsync(async (req, res, next) => {
  const mockTests = await MockTest.find().select('-sections.questions.correctAnswer').lean();

  res.status(200).json({
    status: 'success',
    results: mockTests.length,
    data: {
      mockTests
    }
  });
});

exports.getMockTest = catchAsync(async (req, res, next) => {
  const mockTest = await MockTest.findById(req.params.id).select('-sections.questions.correctAnswer').lean();

  if (!mockTest) {
    return next(new AppError('No mock test found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      mockTest
    }
  });
});

exports.submitMockTest = catchAsync(async (req, res, next) => {
  const { mockTestId, answers, startTime } = req.body; // answers: { sectionIndex: { questionIndex: selectedOptionIndex } }
  
  if (!mockTestId || !answers || !startTime) {
      return next(new AppError('Please provide mockTestId, answers, and startTime', 400));
  }

  const mockTest = await MockTest.findById(mockTestId);
  if (!mockTest) {
    return next(new AppError('Mock test not found', 404));
  }

  // Timer logic check on backend
  const durationMs = mockTest.duration * 60 * 1000;
  const timeTakenMs = Date.now() - new Date(startTime).getTime();
  
  // Allowing a 1 minute grace period for network latency
  if (timeTakenMs > durationMs + 60000) {
      return next(new AppError('Time limit exceeded', 400));
  }

  let totalScore = 0;
  const sectionScores = [];

  mockTest.sections.forEach((section, sIndex) => {
    let sectionScore = 0;
    const sectionAnswers = answers[sIndex] || {};

    section.questions.forEach((question, qIndex) => {
      const selectedOption = sectionAnswers[qIndex];

      if (selectedOption !== undefined) {
        if (selectedOption === question.correctAnswer) {
          sectionScore += question.marks;
        } else {
          sectionScore -= section.negativeMarking;
        }
      }
    });

    totalScore += sectionScore;
    sectionScores.push({ sectionName: section.name, score: sectionScore });
  });

  const result = await MockTestResult.create({
    studentId: req.user.id,
    mockTestId,
    totalScore,
    sectionScores
  });

  res.status(201).json({
    status: 'success',
    data: {
      result
    }
  });
});

exports.getLeaderboard = catchAsync(async (req, res, next) => {
  const results = await MockTestResult.find({ mockTestId: req.params.mockTestId })
    .populate('studentId', 'name')
    .sort({ totalScore: -1 })
    .limit(10)
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      leaderboard: results
    }
  });
});
