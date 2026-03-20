const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  location: {
    type: String,
    required: [true, 'Job location is required']
  },
  salaryRange: String,
  companyName: String,
  responsibilities: {
    type: [String],
    default: []
  },
  skillsRequired: {
    type: [String],
    required: true
  },
  experienceRange: String,
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    default: 'Full-time'
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'CLOSED'],
    default: 'PENDING'
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

jobSchema.virtual('applicants', {
  ref: 'Application',
  foreignField: 'jobId',
  localField: '_id'
});

jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ status: 1 });
const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
