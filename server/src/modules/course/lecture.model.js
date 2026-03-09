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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;
