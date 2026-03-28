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
      isInitialTestCompleted: false, // Changed to false to force placement test
      xp: 0,
      streak: 0,
      stats: {
        overallFluency: 0, overallGrammar: 0, overallVocab: 0, overallPronunciation: 0,
        lessonsCompletedCount: 0, totalXP: 0
      }
    });
  }

  const dashboardData = tutorData.toObject();
  const currentLevel = tutorData.currentLevel || 1;
  dashboardData.lessonsInCurrentLevel = (tutorData.lessonsProgress || []).filter(l => l.level === currentLevel).length;
  dashboardData.lessonsNeededForUpgrade = 5;

  res.status(200).json({
    status: 'success',
    data: dashboardData
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

  const assignedLevel = evalData.suggested_level || evalData.assigned_level || 1;

  if (assignedLevel > 0) {
    tutorData.currentLevel = assignedLevel;
    tutorData.isInitialTestCompleted = true;
    tutorData.focusAreas = evalData.focus_areas || [];

    tutorData.testResults.push({
      levelAssigned: assignedLevel,
      scores: {
        fluency: evalData.scores.fluency * 10,
        grammar: evalData.scores.grammar * 10,
        vocabulary: evalData.scores.vocabulary * 10,
        pronunciation: evalData.scores.pronunciation * 10
      },
      feedback: evalData.analysis || evalData.overall_feedback || "Proficiency evaluation complete."
    });

    const initialXP = 250;
    tutorData.xp = (tutorData.xp || 0) + initialXP;
    tutorData.stats.totalXP = (tutorData.stats.totalXP || 0) + initialXP;
    tutorData.stats.overallFluency = evalData.scores.fluency * 10; 
    tutorData.stats.overallGrammar = evalData.scores.grammar * 10;
    tutorData.stats.overallVocab = evalData.scores.vocabulary * 10;
    tutorData.stats.overallPronunciation = evalData.scores.pronunciation * 10;

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
  const audioBuffer = req.file ? req.file.buffer : null;
  const audioName = req.file ? req.file.originalname : null;

  const result = await pythonService.evaluateTutorTask({
    task_type,
    transcript,
    context,
    audioBuffer,
    audioName
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
      const fScore = evaluation.scores?.fluency ?? evaluation.score ?? tutorData.stats.overallFluency;
      const gScore = evaluation.scores?.grammar ?? evaluation.score ?? tutorData.stats.overallGrammar;
      const vScore = evaluation.scores?.vocabulary ?? evaluation.score ?? tutorData.stats.overallVocab;
      const pScore = evaluation.scores?.pronunciation ?? evaluation.score ?? tutorData.stats.overallPronunciation;

      tutorData.stats.overallFluency = Math.round(tutorData.stats.overallFluency * (1 - alpha) + fScore * alpha);
      tutorData.stats.overallGrammar = Math.round(tutorData.stats.overallGrammar * (1 - alpha) + gScore * alpha);
      tutorData.stats.overallVocab = Math.round(tutorData.stats.overallVocab * (1 - alpha) + vScore * alpha);
      tutorData.stats.overallPronunciation = Math.round(tutorData.stats.overallPronunciation * (1 - alpha) + pScore * alpha);

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

exports.skipAssessment = catchAsync(async (req, res, next) => {
    let tutorData = await EnglishTutor.findOne({ user: req.user.id });
    if (!tutorData) {
        tutorData = new EnglishTutor({ user: req.user.id });
    }

    tutorData.currentLevel = 1;
    tutorData.isInitialTestCompleted = true;
    tutorData.lastActivityDate = new Date();
    await tutorData.save();

    res.status(200).json({
        status: 'success',
        data: tutorData
    });
});

exports.resetProgression = catchAsync(async (req, res, next) => {
    let tutorData = await EnglishTutor.findOne({ user: req.user.id });
    if (!tutorData) {
        return next(new AppError('No tutor data found to reset.', 404));
    }

    // Resetting to absolute baseline
    tutorData.currentLevel = 1;
    tutorData.isInitialTestCompleted = false;
    tutorData.xp = 0;
    tutorData.streak = 0;
    tutorData.stats = {
        overallFluency: 0, overallGrammar: 0, overallVocab: 0, overallPronunciation: 0,
        lessonsCompletedCount: 0, totalXP: 0
    };
    tutorData.lessonsProgress = [];
    tutorData.testResults = [];
    tutorData.errorTracking = {
        GRAMMAR_TENSE: 0, PRONUNCIATION_PHONEME: 0, VOCAB_REPETITION: 0, FLUENCY_PAUSE: 0,
        articles: 0, sentence_structure: 0, frequent_mistakes: []
    };
    tutorData.dailyGoals = {
        lessonCompleted: false,
        speakingMinutes: 0,
        newWordsLearned: 0
    };
    
    await tutorData.save();

    res.status(200).json({
        status: 'success',
        message: 'Progression reset successfully'
    });
});
