const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

// ── Ensure upload directories exist ───────────────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ── Disk storage for avatars (local) ──────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/avatars');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id || req.user?.id || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    // Use userId so each user always overwrites their own avatar file
    cb(null, `avatar_${userId}${ext}`);
  }
});

// ── Memory storage (for Cloudinary uploads: resumes, certs, logos) ─
const memoryStorage = multer.memoryStorage();

// ── File filter ────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed.', 400), false);
  }
};

const documentFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Not an image or PDF! Please upload only supported files.', 400), false);
  }
};

// ── Multer instances ───────────────────────────────────────────────
const uploadAvatarDisk = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter: documentFilter,
});

exports.uploadImage      = uploadAvatarDisk.single('image');   // avatar → disk
exports.uploadResume     = uploadMemory.single('resume');       // → memory for Cloudinary
exports.uploadCertificate = uploadMemory.single('certificate'); // → memory for Cloudinary
exports.uploadLogo       = uploadAvatarDisk.single('logo');     // → disk
