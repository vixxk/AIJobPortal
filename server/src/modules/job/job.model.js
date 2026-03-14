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
  responsibilities: {
    type: [String],
    default: []
  },
  skillsRequired: {
    type: [String],
    required: true
  },
  experienceRange: String,
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN'
  }
}, { timestamps: true });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ status: 1 });
const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
