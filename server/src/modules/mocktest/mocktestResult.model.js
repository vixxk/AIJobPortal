const mongoose = require('mongoose');

const mockTestResultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  mockTestId: {
    type: mongoose.Schema.ObjectId,
    ref: 'MockTest',
    required: true
  },
  totalScore: {
    type: Number,
    required: true
  },
  sectionScores: [{
    sectionName: String,
    score: Number
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

mockTestResultSchema.index({ studentId: 1, mockTestId: 1 });
mockTestResultSchema.index({ totalScore: -1 }); // For leaderboard

const MockTestResult = mongoose.model('MockTestResult', mockTestResultSchema);
module.exports = MockTestResult;
