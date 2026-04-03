const mongoose = require('mongoose');

const englishTutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  xp: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date
  },
  isInitialTestCompleted: {
    type: Boolean,
    default: false
  },
  focusAreas: [String],
  dailyGoals: {
    lessonCompleted: { type: Boolean, default: false },
    speakingMinutes: { type: Number, default: 0 },
    newWordsLearned: { type: Number, default: 0 }
  },
  testResults: [{
    levelAssigned: Number,
    scores: {
      fluency: Number,
      grammar: Number,
      vocabulary: Number,
      pronunciation: Number
    },
    errorDistribution: [{
      category: String,
      count: Number,
      example: String
    }],
    feedback: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  lessonsProgress: [{
    level: Number,
    lessonId: String,
    title: String,
    completed: {
      type: Boolean,
      default: false
    },
    scores: {
      fluency: Number,
      grammar: Number,
      vocabulary: Number,
      pronunciation: Number
    },
    xpEarned: Number,
    dateCompleted: Date
  }],
  errorTracking: {
    GRAMMAR_TENSE: { type: Number, default: 0 },
    PRONUNCIATION_PHONEME: { type: Number, default: 0 },
    VOCAB_REPETITION: { type: Number, default: 0 },
    FLUENCY_PAUSE: { type: Number, default: 0 },
    articles: { type: Number, default: 0 },
    sentence_structure: { type: Number, default: 0 },
    frequent_mistakes: [String]
  },
  stats: {
    overallFluency: { type: Number, default: 0 },
    overallGrammar: { type: Number, default: 0 },
    overallVocab: { type: Number, default: 0 },
    overallPronunciation: { type: Number, default: 0 },
    lessonsCompletedCount: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 }
  }
}, { timestamps: true });

englishTutorSchema.methods.checkAndResetDailyTargets = async function() {
  if (!this.lastActivityDate) return this;

  const lastDate = new Date(this.lastActivityDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);

  if (today > lastDate) {
    this.dailyGoals.lessonCompleted = false;
    this.dailyGoals.newWordsLearned = 0;
    this.dailyGoals.speakingMinutes = 0;
    
    // Check if the daily target reset also affects the streak
    const diffTime = today - lastDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      this.streak = 0;
    }
  }
  
  return this;
};

const EnglishTutor = mongoose.model('EnglishTutor', englishTutorSchema);

module.exports = EnglishTutor;
