const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: 8,
    select: false
    // Not required globally - Google OAuth users won't have a password
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // allows multiple nulls
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['STUDENT', 'RECRUITER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'],
    default: null // null means role not yet assigned
  },
  // For email verification (traditional sign-up)
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  // OTP for email login
  otpCode: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  // Admin approval status for RECRUITER and COLLEGE_ADMIN
  approvalStatus: {
    type: String,
    enum: ['NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'],
    default: 'NOT_REQUIRED'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Profile Completion Fields
  nickname: String,
  dateOfBirth: Date,
  phoneNumber: String,
  gender: String,
  country: String,
  expertise: {
    type: [String],
    default: []
  },
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  // In Mongoose 7+, async middleware must NOT use next() — just return/throw
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
