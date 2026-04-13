const mongoose = require('mongoose');
const recruiterProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  companyDescription: String,
  website: String,
  logo: String,
  companyBanner: String,
  address: String,
  phoneNumber: String,
  approved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);
module.exports = RecruiterProfile;
