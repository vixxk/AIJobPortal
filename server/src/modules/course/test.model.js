const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, default: '' }
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a test title'],
    trim: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  chapter: {
    type: mongoose.Schema.ObjectId, // references embedded chapter _id
    default: null
  },
  lecture: {
    type: mongoose.Schema.ObjectId, // references lecture _id if added after a specific lecture
    ref: 'Lecture',
    default: null
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
