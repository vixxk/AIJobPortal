const { uploadToS3 } = require('../config/aws');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Uploads a file to either S3 or Local storage based on environment configuration
 * @param {Object} file - The file object from multer (must have buffer)
 * @param {string} folder - The folder/prefix for the file (e.g., 'resumes')
 * @param {boolean} optimize - Whether to optimize images (resize, webp)
 * @param {string} localSubdir - Local subdirectory under 'uploads/' (e.g., 'resumes')
 * @returns {Promise<{url: string, key: string}>}
 */
const uploadFile = async (file, folder, optimize = true, localSubdir = 'misc') => {
  const awsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                       process.env.AWS_ACCESS_KEY_ID !== 'YOUR_AWS_ACCESS_KEY_ID' &&
                       process.env.AWS_S3_BUCKET_NAME !== 'your_bucket_name';

  if (awsConfigured) {
    try {
      return await uploadToS3(file.buffer, folder, file.mimetype, optimize);
    } catch (err) {
      console.error('S3 Upload Error, falling back to local if possible:', err);
      // If S3 fails, we continue to local fallback
    }
  }

  // Local Storage Fallback
  const uploadsDir = path.join(__dirname, '../../uploads', localSubdir);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  let finalBuffer = file.buffer;
  let filename = `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  if (file.mimetype.startsWith('image/') && optimize) {
    filename = `${uniqueSuffix}.webp`;
    finalBuffer = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .toFormat('webp', { quality: 80 })
      .toBuffer();
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, finalBuffer);

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  return {
    url: `${baseUrl}/uploads/${localSubdir}/${filename}`,
    key: `uploads/${localSubdir}/${filename}`
  };
};

module.exports = { uploadFile };
