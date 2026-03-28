const { uploadToS3 } = require('../config/aws');
const AppError = require('./appError');

/**
 * Uploads a file to AWS S3
 * @param {Object} file - Multer file object
 * @param {string} folder - Destination folder name in S3
 * @param {boolean} optimize - Whether to optimize image
 * @param {string} unused - Deprecated param for local storage
 * @param {string} type - 'image', 'resume', or 'cert'
 */
const uploadFile = async (file, folder, optimize = true, unused = '', type = 'image') => {
  if (!file || !file.buffer) {
    throw new AppError('No file provided for upload', 400);
  }

  // Check if AWS is configured
  const awsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                       process.env.AWS_ACCESS_KEY_ID !== 'YOUR_AWS_ACCESS_KEY_ID' &&
                       process.env.AWS_S3_BUCKET_NAME &&
                       process.env.AWS_S3_BUCKET_NAME !== 'your_bucket_name';

  if (!awsConfigured) {
    console.warn('AWS S3 is not fully configured. Using S3 is MANDATORY.');
    throw new AppError('Storage service not configured. Please contact administrator.', 500);
  }

  try {
    return await uploadToS3(file.buffer, folder, file.mimetype, optimize);
  } catch (err) {
    console.error('S3 Upload Error:', err);
    throw new AppError('Failed to upload file to cloud storage.', 500);
  }
};

module.exports = { uploadFile };
