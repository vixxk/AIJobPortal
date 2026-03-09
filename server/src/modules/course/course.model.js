const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A course must belong to a teacher']
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'
  },
  enrolledStudents: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  price: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: 'Skill'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseSchema.virtual('lectures', {
  ref: 'Lecture',
  foreignField: 'course',
  localField: '_id'
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
