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
  resume: {
    type: String,
    required: [true, 'An application must have a resume.'],
    validate: {
      validator: function(v) {
        // Strip query params for checking extension
        const urlWithoutParams = v.split('?')[0];
        // Must be a PDF and NOT a known mock/dummy link
        return urlWithoutParams.toLowerCase().endsWith('.pdf') && 
               !v.includes('dummy.pdf') && 
               !v.includes('default.pdf');
      },
      message: props => `${props.value} is not a valid PDF resume upload!`
    }
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
  },
  matchingScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  aiSummary: {
    type: String,
    default: ''
  }
}, { timestamps: true });
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.pre('save', function() {
  if (this.isNew) {
    this.timeline.push({ status: 'APPLIED' });
  }
});
const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
