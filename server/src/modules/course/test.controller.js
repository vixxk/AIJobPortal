const Test = require('./test.model');
const TestResult = require('./testResult.model');
const Course = require('./course.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.createTest = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Only the teacher or admin can add tests', 403));
  }

  const test = await Test.create({ ...req.body, course: courseId });

  res.status(201).json({ status: 'success', data: { test } });
});

exports.getCourseTests = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = (course.teacher?._id || course.teacher)?.toString() === (req.user._id || req.user.id)?.toString();
  const isEnrolled = course.enrolledStudents?.some(s => (s?._id || s)?.toString() === (req.user._id || req.user.id)?.toString());

  if (!isEnrolled && !isTeacher && !isAdmin) {
    return next(new AppError('You must be enrolled in this course to view the tests', 403));
  }

  const tests = await Test.find({ course: courseId }).sort({ createdAt: 1 });

  // Add submission info for students
  let testResults = [];
  if (req.user.role === 'STUDENT' || isEnrolled) {
      testResults = await TestResult.find({ user: req.user.id, course: courseId });
  }

  res.status(200).json({ 
      status: 'success', 
      data: { 
          tests,
          testResults
      } 
  });
});

exports.updateTest = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.params.id).populate('course');
  if (!test) return next(new AppError('Test not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = test.course?.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Not authorized', 403));
  }

  const updatedTest = await Test.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ status: 'success', data: { test: updatedTest } });
});

exports.deleteTest = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.params.id).populate('course');
  if (!test) return next(new AppError('Test not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = test.course?.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Not authorized', 403));
  }

  await Test.findByIdAndDelete(req.params.id);
  await TestResult.deleteMany({ test: req.params.id });

  res.status(204).json({ status: 'success', data: null });
});

exports.submitTest = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.params.id);
  if (!test) return next(new AppError('Test not found', 404));

  const course = await Course.findById(test.course);
  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = (course?.teacher?._id || course?.teacher)?.toString() === (req.user._id || req.user.id)?.toString();
  const isEnrolled = course?.enrolledStudents?.some(s => (s?._id || s)?.toString() === (req.user._id || req.user.id)?.toString());

  if (!isEnrolled && !isTeacher && !isAdmin) {
    return next(new AppError('You must be enrolled in this course to submit tests', 403));
  }

  const existingResult = await TestResult.findOne({ user: req.user.id, test: test._id });
  if (existingResult) {
      return next(new AppError('You have already submitted this test', 400));
  }

  const { answers } = req.body; // Array of { questionId, selectedOptionIndex }
  let score = 0;
  const processedAnswers = [];

  for (const tq of test.questions) {
      const submittedAnswer = answers.find(a => a.questionId.toString() === tq._id.toString());
      if (submittedAnswer && submittedAnswer.selectedOptionIndex === tq.correctOptionIndex) {
          score++;
          processedAnswers.push({ ...submittedAnswer, isCorrect: true });
      } else if (submittedAnswer) {
          processedAnswers.push({ ...submittedAnswer, isCorrect: false });
      }
  }

  const testResult = await TestResult.create({
      user: req.user.id,
      test: test._id,
      course: test.course,
      score,
      totalQuestions: test.questions.length,
      answers: processedAnswers
  });

  res.status(200).json({
    status: 'success',
    data: { testResult }
  });
});
