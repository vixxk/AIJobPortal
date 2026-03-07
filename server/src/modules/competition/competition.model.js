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
  registrationLink: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    default: 'SUPER_ADMIN'
  }
}, { timestamps: true });
const Competition = mongoose.model('Competition', competitionSchema);
module.exports = Competition;