const mongoose = require('mongoose');
const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: String,
  middleName: String,
  lastName: String,
  currentPosition: String,
  address: String,
  phoneNumber: String,
  email: String,
  summary: {
    type: String,
    maxLength: 500
  },
  expectedSalary: {
    minimum: Number,
    maximum: Number,
    currency: String,
    frequency: String
  },
  skills: {
    type: [String],
    default: []
  },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    current: Boolean
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String,
    current: Boolean
  }],
  projects: [{
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    url: String
  }],
  certifications: [{
    title: String,
    publishingOrganization: String,
    dateOfIssue: Date,
    expirationDate: Date,
    doesNotExpire: { type: Boolean, default: false },
    credentialId: String,
    credentialUrl: String
  }],
  professionalExams: [{
    title: String,
    score: String,
    dateTaken: Date,
    description: String
  }],
  awards: [{
    title: String,
    issuer: String,
    dateAwarded: Date,
    description: String
  }],
  seminars: [{
    topic: String,
    organizer: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  organizationActivities: [{
    organization: String,
    role: String,
    startDate: Date,
    endDate: Date,
    stillMember: Boolean,
    description: String
  }],
  languages: [{
    language: String,
    proficiency: String
  }],
  affiliations: [{
    organization: String,
    role: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  references: [{
    name: String,
    company: String,
    occupation: String,
    email: String,
    phoneNumber: String
  }],
  jobSeekingStatus: {
    type: String,
    enum: ['Actively looking for jobs', 'Passively looking for jobs', 'Not looking for jobs'],
    default: 'Actively looking for jobs'
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  }
}, { timestamps: true });
studentProfileSchema.index({ skills: 'text' });
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
module.exports = StudentProfile;