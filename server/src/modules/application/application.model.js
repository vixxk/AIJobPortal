const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'],
    default: 'APPLIED'
  },
  timeline: [{
    status: {
      type: String,
      enum: ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  feedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({ status: 'APPLIED' });
  }
  next();
});
const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
