const mongoose = require('mongoose');

const lectureProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  lecture: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lecture',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only have one progress record per lecture
lectureProgressSchema.index({ user: 1, lecture: 1 }, { unique: true });

const LectureProgress = mongoose.model('LectureProgress', lectureProgressSchema);

module.exports = LectureProgress;
