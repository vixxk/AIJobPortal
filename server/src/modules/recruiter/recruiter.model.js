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
  },
  // Company Details
  city: String,
  state: String,
  country: String,
  companyLinkedinPage: String,
  companyType: {
    type: String,
    enum: [
      'Private Limited',
      'Limited Company',
      'LLP',
      'Proprietorship',
      'Partnership Firm',
      'Startup',
      'NGO',
      'Educational Institution',
      'Government Organization',
      'Other'
    ]
  },
  // Registration Details
  gstNumber: String,
  panNumber: String,
  // Authorized Representative
  authorizedPersonName: String,
  designation: String,
  officialEmail: String,
  contactNumber: String,
  // Documents Upload (URLs of files)
  gstCertificate: String,
  panCard: String,
  companyRegistrationCertificate: String,
  startupIndiaCertificate: String,
  // Submission Status
  verificationSubmitted: {
    type: Boolean,
    default: false
  },
  rejectionReason: String
}, { timestamps: true });
const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);
module.exports = RecruiterProfile;
