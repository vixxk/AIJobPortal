const mongoose = require('mongoose');
const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Competition title is required']
  },
  description: {
    type: String,
    required: [true, 'Competition description is required']
  },
  organizer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Hackathon'
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Online'
  },
  location: String,
  registrationLink: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  rewards: String,
  rules: String,
  eligibility: String,
  bannerImage: String,
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: String,
    ref: 'User'
  },
  rounds: [{
    title: { type: String, required: true },
    description: String,
    date: Date
  }]
}, { timestamps: true });
const Competition = mongoose.model('Competition', competitionSchema);
module.exports = Competition;
