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
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true 
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['STUDENT', 'RECRUITER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'],
    default: null 
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  otpCode: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
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
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model('User', userSchema);
module.exports = User;