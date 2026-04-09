const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.ObjectId,
    ref: 'Test',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.ObjectId,
    selectedOptionIndex: Number,
    isCorrect: Boolean
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

testResultSchema.index({ user: 1, test: 1 }, { unique: true });

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;
