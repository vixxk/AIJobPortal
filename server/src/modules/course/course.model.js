const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  order: { type: Number, default: 0 }
});

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
  priceChangeRequest: {
    requestedPrice: { type: Number },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] }
  },
  category: {
    type: String,
    default: 'Skill'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  language: {
    type: String,
    default: 'English'
  },
  duration: {
    type: Number, // total hours
    default: 0
  },
  tags: [{ type: String, trim: true }],
  chapters: [chapterSchema],
  prerequisites: [{ type: String, trim: true }],
  objectives: [{ type: String, trim: true }],
  isPublished: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  createdByAdmin: {
    type: Boolean,
    default: false
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
