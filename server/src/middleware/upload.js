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

// For video uploads (lectures → Bunny Stream)
const videoFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only video files (mp4, webm, mov, avi, mkv) are allowed.', 400), false);
  }
};

const uploadVideoMemory = multer({
  storage: memoryStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

exports.uploadImage      = uploadImageOnly.single('image');
exports.uploadResume     = uploadMemory.single('resume');
exports.uploadCertificate = uploadMemory.single('certificate');
exports.uploadLogo       = uploadImageOnly.single('logo');
exports.uploadVideo      = uploadVideoMemory.single('video');

