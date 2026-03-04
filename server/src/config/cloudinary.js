// Multiple Cloudinary Configuration Strategy
const cloudinary = require('cloudinary').v2;

// config 1: Images (Profiles, Logos)
const cloudinaryImages = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_IMAGE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_IMAGE_API_KEY,
  api_secret: process.env.CLOUDINARY_IMAGE_API_SECRET,
});

// config 2: Resumes
const cloudinaryResumes = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_RESUME_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_RESUME_API_KEY,
  api_secret: process.env.CLOUDINARY_RESUME_API_SECRET,
});

// config 3: Certificates
const cloudinaryCertificates = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CERT_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CERT_API_KEY,
  api_secret: process.env.CLOUDINARY_CERT_API_SECRET,
});

const uploadImageToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder, ...cloudinaryImages },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
};

const uploadResumeToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'resumes', ...cloudinaryResumes },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
};

const uploadCertificateToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'certificates', ...cloudinaryCertificates },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
};

module.exports = {
  uploadImageToCloudinary,
  uploadResumeToCloudinary,
  uploadCertificateToCloudinary
};
