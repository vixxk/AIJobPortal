const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
  // ── Opportunity Type ───────────────────────────────────────────────────────
  opportunityType: {
    type: String,
    enum: ['Job', 'Internship'],
    default: 'Job'
  },

  // ── Core Details ───────────────────────────────────────────────────────────
  title: {
    type: String,
    required: [true, 'Job title is required']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  location: {
    type: String,
    required: [true, 'Job location is required']
  },
  companyName: String,
  companyLogo: String,
  companyBanner: String,
  aboutCompany: String,
  companyWebsite: String,

  // ── Skills & Requirements ──────────────────────────────────────────────────
  skillsRequired: {
    type: [String],
    required: true
  },
  responsibilities: {
    type: [String],
    default: []
  },
  eligibilityCriteria: {
    type: [String],
    default: []
  },
  candidatePreferences: String,

  // ── Job Configuration ──────────────────────────────────────────────────────
  workMode: {
    type: String,
    enum: ['In Office', 'Hybrid', 'Remote', 'Onsite'],
    default: 'In Office'
  },
  workSchedule: {
    type: String,
    enum: ['Full-Time', 'Part-Time'],
    default: 'Full-Time'
  },
  experienceRequired: {
    type: String,
    enum: ['Fresher', '1 Year', '2 Years', '3+ Years', '5+ Years'],
    default: 'Fresher'
  },
  numberOfOpenings: {
    type: Number,
    default: 1
  },

  // ── Legacy fields (kept for backward compat) ──────────────────────────────
  salaryRange: String,
  experienceRange: String,
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    default: 'Full-time'
  },

  // ── Salary & Benefits (Job) ────────────────────────────────────────────────
  fixedPayMin: Number,
  fixedPayMax: Number,
  variablePayMin: Number,
  variablePayMax: Number,
  benefits: {
    type: [String],
    default: []
  },

  // ── Internship-Specific Fields ─────────────────────────────────────────────
  internshipStartType: {
    type: String,
    enum: ['Immediate', 'Later'],
    default: 'Immediate'
  },
  internshipStartFrom: Date,
  internshipStartTo: Date,
  internshipDuration: {
    type: Number,
    min: 1,
    max: 6
  },
  stipendType: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Paid'
  },
  stipendMin: Number,
  stipendMax: Number,
  stipendVariableMin: Number,
  stipendVariableMax: Number,
  ppoOffered: {
    type: Boolean,
    default: false
  },
  perks: {
    type: [String],
    default: []
  },

  // ── Pre-Screening Questions ────────────────────────────────────────────────
  screeningQuestions: {
    type: [{
      question: String,
      isDefault: { type: Boolean, default: false }
    }],
    default: []
  },

  // ── AI / Ranking ───────────────────────────────────────────────────────────
  enableSmartRanking: {
    type: Boolean,
    default: true
  },
  enableAICandidateMatching: {
    type: Boolean,
    default: true
  },
  aiInterviewQuestions: {
    type: [String],
    default: []
  },

  // ── Metadata ───────────────────────────────────────────────────────────────
  duration: String,
  applicationDeadline: Date,
  startDate: String,
  applyLink: String,
  applyLinkVisibility: {
    type: String,
    enum: ['public', 'internal'],
    default: 'internal'
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'CLOSED', 'DRAFT'],
    default: 'PENDING'
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

jobSchema.virtual('applicants', {
  ref: 'Application',
  foreignField: 'jobId',
  localField: '_id'
});

jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ opportunityType: 1 });
const registerPendingCountsHook = require('../../utils/pendingCountsHook');
registerPendingCountsHook(jobSchema);

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;

