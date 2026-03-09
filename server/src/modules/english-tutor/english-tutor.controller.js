const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const pythonService = require('../../services/python.service');
const EnglishTutor = require('./english-tutor.model');

exports.getDashboard = catchAsync(async (req, res, next) => {
  let tutorData = await EnglishTutor.findOne({ user: req.user.id });

  if (!tutorData) {

    tutorData = await EnglishTutor.create({
      user: req.user.id,
      currentLevel: 1,
      isInitialTestCompleted: true,
      xp: 0,
      streak: 0,
      stats: {
        overallFluency: 0,
        overallGrammar: 0,
        overallVocab: 0,
        overallPronunciation: 0,
        lessonsCompletedCount: 0,
        totalXP: 0
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: tutorData
  });
});

exports.submitSpeakingTest = catchAsync(async (req, res, next) => {
  const { responses } = req.body;
  const isIncomplete = !responses || responses.length < 5;
  const allEmpty = !responses || responses.length === 0 || responses.every(r =>
    !r.transcript ||
    r.transcript.trim() === '' ||
    r.transcript.includes('[No speech detected]')
  );

  let evalData;

  if (isIncomplete) {
    evalData = {
      assigned_level: 0,
      overall_feedback: "Assessment Incomplete! To give you an accurate English Level, I need you to complete all 5 tasks. Please start again and finish the entire session.",
      scores: { grammar: 0, pronunciation: 0, fluency: 0, vocabulary: 0 },
      error_distribution: [],
      focus_areas: ["Complete all 5 tasks", "Microphone Check"]
    };
  } else if (allEmpty) {
    evalData = {
      assigned_level: 1,
      overall_feedback: "I didn't hear any speech! Please check your microphone settings and try again so I can accurately assess your Level.",
      scores: { grammar: 0, pronunciation: 0, fluency: 0, vocabulary: 0 },
      error_distribution: [],
      focus_areas: ["Microphone Setup", "Basic Pronunciation"]
    };
  } else {
    const evaluation = await pythonService.evaluateSpeakingTest({ responses });
    if (evaluation.status !== 'success') {
      return next(new AppError('AI Evaluation failed', 500));
    }
    evalData = evaluation.data;
  }

  let tutorData = await EnglishTutor.findOne({ user: req.user.id });
  if (!tutorData) {
    tutorData = new EnglishTutor({ user: req.user.id });
  }

  if (evalData.assigned_level > 0) {
    tutorData.currentLevel = evalData.assigned_level;
    tutorData.isInitialTestCompleted = true;
    tutorData.focusAreas = evalData.focus_areas;

    tutorData.testResults.push({
      levelAssigned: evalData.assigned_level,
      scores: evalData.scores,
      errorDistribution: evalData.error_distribution,
      feedback: evalData.overall_feedback
    });

    if (evalData.error_distribution) {
      evalData.error_distribution.forEach(err => {
        if (tutorData.errorTracking[err.category] !== undefined) {
          tutorData.errorTracking[err.category] += err.count;
        }
      });
    }

    const initialXP = 250;
    tutorData.xp = (tutorData.xp || 0) + initialXP;
    tutorData.stats.totalXP = (tutorData.stats.totalXP || 0) + initialXP;
    tutorData.stats.overallFluency = evalData.scores.fluency;
    tutorData.stats.overallGrammar = evalData.scores.grammar;
    tutorData.stats.overallVocab = evalData.scores.vocabulary;
    tutorData.stats.overallPronunciation = evalData.scores.pronunciation;

    tutorData.lastActivityDate = new Date();
    tutorData.streak = (tutorData.streak || 0) >= 1 ? tutorData.streak : 1;

    await tutorData.save();
  }

  res.status(200).json({
    status: 'success',
    data: tutorData
  });
});

exports.getLesson = catchAsync(async (req, res, next) => {
  const tutorData = await EnglishTutor.findOne({ user: req.user.id });

  if (tutorData && tutorData.lastActivityDate) {
    const lastDate = new Date(tutorData.lastActivityDate).setHours(0,0,0,0);
    const today = new Date().setHours(0,0,0,0);
    if (today > lastDate) {
        tutorData.dailyGoals.lessonCompleted = false;
        tutorData.dailyGoals.newWordsLearned = 0;

        tutorData.dailyGoals.speakingMinutes = 0;
    }
  }

  const level = tutorData ? tutorData.currentLevel : 1;
  const lessonIndex = (tutorData ? tutorData.lessonsProgress.filter(l => l.level === level).length : 0) + 1;

  const lesson = await pythonService.generateLesson({ level, lesson_index: lessonIndex });

  res.status(200).json(lesson);
});

exports.submitLessonTask = catchAsync(async (req, res, next) => {
  const { task_type, transcript, context_json } = req.body;
  const context = JSON.parse(context_json || '{}');
  const filePath = req.file ? req.file.path : null;

  const result = await pythonService.evaluateTutorTask({
    task_type,
    transcript,
    context,
    filePath
  });

  if (result.status === 'success') {
    const { evaluation } = result.data;

    const tutorData = await EnglishTutor.findOne({ user: req.user.id });
    if (tutorData) {

      if (evaluation.error_tags) {
        evaluation.error_tags.forEach(tag => {
          if (tutorData.errorTracking[tag] !== undefined) {
            tutorData.errorTracking[tag] += 1;
          }
        });
      }

      const wordCount = transcript.split(/\s+/).length;
      const estimatedMinutes = wordCount / 130;
      tutorData.dailyGoals.speakingMinutes += parseFloat(estimatedMinutes.toFixed(2));

      const alpha = 0.2;
      tutorData.stats.overallFluency = Math.round(tutorData.stats.overallFluency * (1 - alpha) + evaluation.scores.fluency * alpha);
      tutorData.stats.overallGrammar = Math.round(tutorData.stats.overallGrammar * (1 - alpha) + evaluation.scores.grammar * alpha);
      tutorData.stats.overallVocab = Math.round(tutorData.stats.overallVocab * (1 - alpha) + evaluation.scores.vocabulary * alpha);
      tutorData.stats.overallPronunciation = Math.round(tutorData.stats.overallPronunciation * (1 - alpha) + evaluation.scores.pronunciation * alpha);

      tutorData.lastActivityDate = new Date();
      await tutorData.save();
    }
  }

  res.status(200).json(result);
});

exports.completeLesson = catchAsync(async (req, res, next) => {
    const { lessonId, title, level, scores } = req.body;

    let tutorData = await EnglishTutor.findOne({ user: req.user.id });
    if (!tutorData) return next(new AppError('Tutor data not found', 404));

    const xpEarned = 100;

    tutorData.lessonsProgress.push({
        level,
        lessonId,
        title,
        completed: true,
        scores,
        xpEarned,
        dateCompleted: new Date()
    });

    tutorData.stats.lessonsCompletedCount += 1;
    tutorData.stats.totalXP += xpEarned;
    tutorData.xp += xpEarned;

    tutorData.dailyGoals.lessonCompleted = true;
    tutorData.dailyGoals.newWordsLearned += 3;

    const now = new Date();
    if (tutorData.lastActivityDate) {
        const lastDate = new Date(tutorData.lastActivityDate);
        const diffTime = Math.abs(now - lastDate);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays > 1 && diffDays < 2) {
            tutorData.streak += 1;
        } else if (diffDays >= 2) {
            tutorData.streak = 1;
        }
    } else {
        tutorData.streak = 1;
    }
    tutorData.lastActivityDate = now;

    const lessonsInCurLevel = tutorData.lessonsProgress.filter(l => l.level === tutorData.currentLevel).length;
    if (lessonsInCurLevel >= 5 && tutorData.currentLevel < 10) {
        tutorData.currentLevel += 1;
    }

    await tutorData.save();

    res.status(200).json({
        status: 'success',
        data: tutorData
    });
});
