const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

const memoryStorage = multer.memoryStorage();

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

const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// For images only (e.g. Logo, Avatar)
const uploadImageOnly = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// For video uploads (lectures → Bunny Stream) — use disk storage to avoid OOM on large files
const fs = require('fs');
const os = require('os');
const videoTmpDir = path.join(os.tmpdir(), 'hyrego-video-uploads');
if (!fs.existsSync(videoTmpDir)) fs.mkdirSync(videoTmpDir, { recursive: true });

const videoDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videoTmpDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const videoFilter = (req, file, cb) => {
  const allowedMime = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/mkv'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  
  if (allowedMime.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only video files (mp4, webm, mov, avi, mkv) are allowed.', 400), false);
  }
};

const uploadVideoDisk = multer({
  storage: videoDiskStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 2000 * 1024 * 1024 } // 2GB limit
});

exports.uploadImage      = uploadImageOnly.single('image');
exports.uploadResume     = uploadMemory.single('resume');
exports.uploadCertificate = uploadMemory.single('certificate');
exports.uploadLogo       = uploadImageOnly.single('logo');
exports.uploadVideo      = uploadVideoDisk.single('video');
exports.uploadJobImages  = uploadImageOnly.fields([
  { name: 'companyLogo', maxCount: 1 },
  { name: 'companyBanner', maxCount: 1 }
]);

