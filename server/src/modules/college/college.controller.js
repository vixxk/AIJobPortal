const { CollegeProfile, PlacementDrive, CollegeMessage, PlacementSession, RecruiterCollegeInvite } = require('./college.model');
const RecruiterProfile = require('../recruiter/recruiter.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const sendEmail = require('../../config/mailer');

// ─────────────────────────────────────────────────────────────────────────────
// COLLEGE PROFILE
// ─────────────────────────────────────────────────────────────────────────────

exports.getMe = catchAsync(async (req, res) => {
  const profile = await CollegeProfile.findOne({ userId: req.user.id });
  res.status(200).json({ status: 'success', data: { profile: profile || {} } });
});

exports.createOrUpdateProfile = catchAsync(async (req, res) => {
  const { collegeName, location, courses, studentStrength, website, description, establishedYear, affiliation, accreditation, placementRate } = req.body;
  const updateData = { collegeName, location, website, description, establishedYear, affiliation, accreditation, placementRate };
  if (courses) updateData.courses = Array.isArray(courses) ? courses : courses.split(',').map(c => c.trim()).filter(Boolean);
  if (studentStrength) updateData.studentStrength = Number(studentStrength);

  const profile = await CollegeProfile.findOneAndUpdate(
    { userId: req.user.id },
    { $set: updateData },
    { new: true, upsert: true, runValidators: true }
  );
  res.status(200).json({ status: 'success', data: { profile } });
});

exports.getAllColleges = catchAsync(async (req, res) => {
  const colleges = await CollegeProfile.find({ approved: true }).populate('userId', 'email name');
  res.status(200).json({ status: 'success', results: colleges.length, data: colleges });
});

// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT DRIVES
// ─────────────────────────────────────────────────────────────────────────────

exports.getDrives = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  if (!college) return res.status(200).json({ status: 'success', data: [] });
  const drives = await PlacementDrive.find({ collegeId: college._id }).sort({ driveDate: 1 });
  res.status(200).json({ status: 'success', results: drives.length, data: drives });
});

exports.createDrive = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  if (!college) return res.status(400).json({ status: 'fail', message: 'Please complete your college profile first.' });

  const { companyName, driveTitle, description, roles, eligibilityCriteria, packageOffered, driveDate, registrationDeadline, venue, mode } = req.body;
  const drive = await PlacementDrive.create({
    collegeId: college._id,
    companyName,
    driveTitle,
    description,
    roles: Array.isArray(roles) ? roles : (roles || '').split(',').map(r => r.trim()).filter(Boolean),
    eligibilityCriteria,
    packageOffered,
    driveDate,
    registrationDeadline,
    venue,
    mode: mode || 'OFFLINE'
  });
  res.status(201).json({ status: 'success', data: { drive } });
});

exports.updateDrive = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  const drive = await PlacementDrive.findOneAndUpdate(
    { _id: req.params.id, collegeId: college._id },
    { $set: req.body },
    { new: true }
  );
  if (!drive) return res.status(404).json({ status: 'fail', message: 'Drive not found.' });
  res.status(200).json({ status: 'success', data: { drive } });
});

exports.deleteDrive = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  await PlacementDrive.findOneAndDelete({ _id: req.params.id, collegeId: college._id });
  res.status(204).json({ status: 'success', data: null });
});

// Public: get all drives (for recruiters / students)
exports.getAllDrives = catchAsync(async (req, res) => {
  const { collegeId } = req.query;
  const filter = collegeId ? { collegeId } : {};
  const drives = await PlacementDrive.find(filter).populate('collegeId', 'collegeName location').sort({ driveDate: 1 });
  res.status(200).json({ status: 'success', results: drives.length, data: drives });
});

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES / EMAILS
// ─────────────────────────────────────────────────────────────────────────────

exports.sendMessage = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  if (!college) return res.status(400).json({ status: 'fail', message: 'Complete your college profile first.' });

  const { toRecruiterEmail, toRecruiterId, subject, message, templateType } = req.body;

  // Optionally resolve recruiter profile if ID is given
  let resolvedRecruiterId = toRecruiterId;
  if (!resolvedRecruiterId && toRecruiterEmail) {
    const rp = await RecruiterProfile.findOne().populate({ path: 'userId', match: { email: toRecruiterEmail } });
    if (rp?.userId) resolvedRecruiterId = rp._id;
  }

  try {
    await sendEmail({
      email: toRecruiterEmail,
      subject: subject,
      message: message
    });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'There was an error sending the email. Try again later.' });
  }

  const msg = await CollegeMessage.create({
    fromCollegeId: college._id,
    toRecruiterEmail,
    toRecruiterId: resolvedRecruiterId,
    subject,
    message,
    templateType: templateType || 'CUSTOM'
  });
  res.status(201).json({ status: 'success', data: { message: msg } });
});

exports.getMessages = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  if (!college) return res.status(200).json({ status: 'success', data: [] });
  const messages = await CollegeMessage.find({ fromCollegeId: college._id }).sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: messages.length, data: messages });
});

// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT SESSIONS (Online Interviews / Shortlisting)
// ─────────────────────────────────────────────────────────────────────────────

exports.getSessions = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  if (!college) return res.status(200).json({ status: 'success', data: [] });
  const sessions = await PlacementSession.find({ collegeId: college._id })
    .populate('driveId', 'companyName driveTitle')
    .populate('candidates.studentId', 'name email')
    .sort({ scheduledAt: 1 });
  res.status(200).json({ status: 'success', results: sessions.length, data: sessions });
});

exports.createSession = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  if (!college) return res.status(400).json({ status: 'fail', message: 'Complete your college profile first.' });

  const { driveId, sessionTitle, interviewType, scheduledAt, durationMinutes, meetingLink, candidates } = req.body;
  const session = await PlacementSession.create({
    driveId,
    collegeId: college._id,
    sessionTitle,
    interviewType: interviewType || 'HR',
    scheduledAt,
    durationMinutes: durationMinutes || 60,
    meetingLink,
    candidates: candidates || []
  });
  res.status(201).json({ status: 'success', data: { session } });
});

exports.updateSession = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  const session = await PlacementSession.findOneAndUpdate(
    { _id: req.params.id, collegeId: college._id },
    { $set: req.body },
    { new: true }
  );
  if (!session) return res.status(404).json({ status: 'fail', message: 'Session not found.' });
  res.status(200).json({ status: 'success', data: { session } });
});

exports.updateCandidateStatus = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  const { candidateId, status, score, notes } = req.body;

  const session = await PlacementSession.findOneAndUpdate(
    { _id: req.params.id, collegeId: college._id, 'candidates._id': candidateId },
    { $set: { 'candidates.$.status': status, 'candidates.$.score': score, 'candidates.$.notes': notes } },
    { new: true }
  );
  if (!session) return res.status(404).json({ status: 'fail', message: 'Session or candidate not found.' });
  res.status(200).json({ status: 'success', data: { session } });
});

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITER ↔ COLLEGE INVITES
// ─────────────────────────────────────────────────────────────────────────────

exports.sendRecruiterInvite = catchAsync(async (req, res) => {
  const recruiter = await RecruiterProfile.findOne({ userId: req.user.id });
  if (!recruiter) return res.status(400).json({ status: 'fail', message: 'Recruiter profile not found.' });

  const { collegeId, message, rolesOffered, packageRange } = req.body;
  const existing = await RecruiterCollegeInvite.findOne({ recruiterId: recruiter._id, collegeId });
  if (existing) {
    existing.message = message || existing.message;
    existing.status = 'PENDING';
    await existing.save();
    return res.status(200).json({ status: 'success', data: { invite: existing } });
  }

  const invite = await RecruiterCollegeInvite.create({
    recruiterId: recruiter._id,
    collegeId,
    message,
    rolesOffered: Array.isArray(rolesOffered) ? rolesOffered : (rolesOffered || '').split(',').map(r => r.trim()).filter(Boolean),
    packageRange
  });
  res.status(201).json({ status: 'success', data: { invite } });
});

exports.getCollegeInvites = catchAsync(async (req, res) => {
  // For college admin: see all recruiter invites directed to them
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  if (!college) return res.status(200).json({ status: 'success', data: [] });
  const invites = await RecruiterCollegeInvite.find({ collegeId: college._id })
    .populate('recruiterId', 'companyName companyDescription website logo')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: invites.length, data: invites });
});

exports.respondToInvite = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  const { status } = req.body; // 'ACCEPTED' or 'DECLINED'
  const invite = await RecruiterCollegeInvite.findOneAndUpdate(
    { _id: req.params.id, collegeId: college._id },
    { status },
    { new: true }
  );
  if (!invite) return res.status(404).json({ status: 'fail', message: 'Invite not found.' });
  res.status(200).json({ status: 'success', data: { invite } });
});

exports.getRecruiterSentInvites = catchAsync(async (req, res) => {
  const recruiter = await RecruiterProfile.findOne({ userId: req.user.id });
  if (!recruiter) return res.status(200).json({ status: 'success', data: [] });
  const invites = await RecruiterCollegeInvite.find({ recruiterId: recruiter._id })
    .populate('collegeId', 'collegeName location studentStrength courses')
    .sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: invites.length, data: invites });
});

// Stats for college dashboard overview
exports.getCollegeStats = catchAsync(async (req, res) => {
  const college = await CollegeProfile.findOne({ userId: req.user.id });
  if (!college) return res.status(200).json({ status: 'success', data: { drives: 0, sessions: 0, messages: 0, invites: 0 } });

  const [drives, sessions, messages, invites] = await Promise.all([
    PlacementDrive.countDocuments({ collegeId: college._id }),
    PlacementSession.countDocuments({ collegeId: college._id }),
    CollegeMessage.countDocuments({ fromCollegeId: college._id }),
    RecruiterCollegeInvite.countDocuments({ collegeId: college._id, status: 'PENDING' })
  ]);

  res.status(200).json({ status: 'success', data: { drives, sessions, messages, invites, profile: college } });
});
