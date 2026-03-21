const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/avatars');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});
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
  limits: { fileSize: 10 * 1024 * 1024 } // Increased to 10MB for high-quality thumbnails
});

exports.uploadImage      = uploadMemory.single('image');
exports.uploadResume     = uploadMemory.single('resume');
exports.uploadCertificate = uploadMemory.single('certificate');
exports.uploadLogo       = uploadMemory.single('logo');
