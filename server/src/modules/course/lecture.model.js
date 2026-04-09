const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a lecture title'],
    trim: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'A lecture must belong to a course']
  },
  chapter: {
    type: mongoose.Schema.ObjectId, // references embedded chapter _id
    default: null
  },
  // Bunny Stream fields
  bunnyVideoId: {
    type: String,
    default: null
  },
  videoStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'READY', 'FAILED'],
    default: 'PENDING'
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  // Legacy field kept for backward compat — will be ignored going forward
  videoIdentifier: {
    type: String,
  },
  type: {
    type: String,
    enum: ['RECORDED'],
    default: 'RECORDED'
  },
  status: {
    type: String,
    enum: ['READY', 'ENDED'],
    default: 'READY'
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // duration in minutes
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  notesUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;
