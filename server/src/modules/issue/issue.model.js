const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the issue'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the issue']
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'closed'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
