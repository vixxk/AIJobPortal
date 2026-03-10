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
  videoIdentifier: {
    type: String,
  },
  type: {
    type: String,
    enum: ['LIVE', 'RECORDED'],
    default: 'RECORDED'
  },
  status: {
    type: String,
    enum: ['READY', 'LIVE', 'ENDED'],
    default: 'READY'
  },
  description: {
    type: String,
    trim: true
  },
  streamKey: {
    type: String,
  },
  duration: {
    type: Number, // duration in minutes
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;
