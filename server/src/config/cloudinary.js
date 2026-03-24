const cloudinary = require('cloudinary').v2;

const configureCloudinary = (type = 'image') => {
  let config = {};
  
  if (type === 'resume') {
    config = {
      cloud_name: process.env.CLOUDINARY_RESUME_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_RESUME_API_KEY,
      api_secret: process.env.CLOUDINARY_RESUME_API_SECRET
    };
  } else if (type === 'cert') {
    config = {
      cloud_name: process.env.CLOUDINARY_CERT_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_CERT_API_KEY,
      api_secret: process.env.CLOUDINARY_CERT_API_SECRET
    };
  } else {
    config = {
      cloud_name: process.env.CLOUDINARY_IMAGE_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_IMAGE_API_KEY,
      api_secret: process.env.CLOUDINARY_IMAGE_API_SECRET
    };
  }

  cloudinary.config(config);
  return cloudinary;
};

module.exports = { configureCloudinary };
