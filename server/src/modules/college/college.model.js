const mongoose = require('mongoose');
const collegeProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required']
  },
  location: String,
  courses: {
    type: [String],
    default: []
  },
  studentStrength: Number,
  approved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
const CollegeProfile = mongoose.model('CollegeProfile', collegeProfileSchema);
module.exports = CollegeProfile;