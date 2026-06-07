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
    enum: ['STUDENT', 'RECRUITER', 'COLLEGE_ADMIN', 'TEACHER', 'SUPER_ADMIN'],
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
  },
  notificationSettings: {
    platform: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'PRO_PLUS'],
      default: 'FREE'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'PENDING_AUTH'],
      default: 'ACTIVE'
    },
    cashfreeSubscriptionId: String,
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  },
  usageLimits: {
    spokenEnglish: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 30 },
      lastSpokenEnglishDate: { type: Date, default: null },
      dailyUsed: { type: Number, default: 0 }
    },
    resumes: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 1 }
    },
    resumesRewrites: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 20 } // 1 * 20 for Free
    },
    interviews: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 4 }, // 4 per month
      lastInterviewDate: { type: Date, default: null },
      dates: { type: [Date], default: [] }
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.virtual('studentProfile', {
  ref: 'StudentProfile',
  foreignField: 'userId',
  localField: '_id',
  justOne: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
