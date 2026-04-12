const mongoose = require('mongoose');

// ── College Profile ──────────────────────────────────────────────────────────
const collegeProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, unique: true },
  collegeName: { type: String, required: [true, 'College name is required'] },
  location: String,
  website: String,
  description: String,
  establishedYear: Number,
  affiliation: String,
  accreditation: String,
  courses: { type: [String], default: [] },
  studentStrength: Number,
  placementRate: Number,
  approved: { type: Boolean, default: false }
}, { timestamps: true });

// ── Placement Drive ──────────────────────────────────────────────────────────
const placementDriveSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.ObjectId, ref: 'CollegeProfile', required: true },
  companyName: { type: String, required: true },
  companyLogo: String,
  driveTitle: { type: String, required: true },
  description: String,
  roles: { type: [String], default: [] },
  eligibilityCriteria: String,
  packageOffered: String,
  driveDate: { type: Date, required: true },
  registrationDeadline: Date,
  venue: String,
  mode: { type: String, enum: ['ONLINE', 'OFFLINE', 'HYBRID'], default: 'OFFLINE' },
  status: { type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'UPCOMING' },
  registeredStudents: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  shortlistedStudents: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  hiredStudents: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
}, { timestamps: true });

// ── College Message (Email Thread) ─────────────────────────────────────────
const collegeMessageSchema = new mongoose.Schema({
  fromCollegeId: { type: mongoose.Schema.ObjectId, ref: 'CollegeProfile', required: true },
  toRecruiterEmail: { type: String, required: true },
  toRecruiterId: { type: mongoose.Schema.ObjectId, ref: 'RecruiterProfile' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  templateType: { type: String, enum: ['INVITATION', 'STANDARD_INVITATION', 'SCHEDULING', 'INTERVIEW_SCHEDULING', 'FOLLOWUP', 'FOLLOW-UP', 'PROPOSAL', 'PLACEMENT_PROPOSAL', 'CUSTOM'], default: 'CUSTOM' },
  status: { type: String, enum: ['SENT', 'READ', 'REPLIED'], default: 'SENT' }
}, { timestamps: true });

// ── Placement Session (Online Drive) ────────────────────────────────────────
const placementSessionSchema = new mongoose.Schema({
  driveId: { type: mongoose.Schema.ObjectId, ref: 'PlacementDrive', required: true },
  collegeId: { type: mongoose.Schema.ObjectId, ref: 'CollegeProfile', required: true },
  sessionTitle: { type: String, required: true },
  interviewType: { type: String, enum: ['TECHNICAL', 'HR', 'GROUP_DISCUSSION', 'APTITUDE', 'FINAL'], default: 'HR' },
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  meetingLink: String,
  candidates: [{
    studentId: { type: mongoose.Schema.ObjectId, ref: 'User' },
    status: { type: String, enum: ['INVITED', 'APPEARED', 'SHORTLISTED', 'REJECTED', 'HIRED'], default: 'INVITED' },
    score: Number,
    notes: String
  }],
  status: { type: String, enum: ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' }
}, { timestamps: true });

// ── Recruiter-College Invite ─────────────────────────────────────────────────
const recruiterCollegeInviteSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.ObjectId, ref: 'RecruiterProfile', required: true },
  collegeId: { type: mongoose.Schema.ObjectId, ref: 'CollegeProfile', required: true },
  message: String,
  rolesOffered: [String],
  packageRange: String,
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED'], default: 'PENDING' }
}, { timestamps: true });

const CollegeProfile = mongoose.model('CollegeProfile', collegeProfileSchema);
const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);
const CollegeMessage = mongoose.model('CollegeMessage', collegeMessageSchema);
const PlacementSession = mongoose.model('PlacementSession', placementSessionSchema);
const RecruiterCollegeInvite = mongoose.model('RecruiterCollegeInvite', recruiterCollegeInviteSchema);

module.exports = { CollegeProfile, PlacementDrive, CollegeMessage, PlacementSession, RecruiterCollegeInvite };
