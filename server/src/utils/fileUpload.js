const { configureCloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads a file to Cloudinary, S3 or Local storage 
 * @param {Object} file - Mulder file object
 * @param {string} folder - Destination folder name
 * @param {string} type - 'image', 'resume', or 'cert'
 */
const uploadFile = async (file, folder, optimize = true, localSubdir = 'misc', type = 'image') => {
  // 1. Try S3 if configured
  const awsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                       process.env.AWS_ACCESS_KEY_ID !== 'YOUR_AWS_ACCESS_KEY_ID' &&
                       process.env.AWS_S3_BUCKET_NAME !== 'your_bucket_name';

  if (awsConfigured) {
    try {
      const { uploadToS3 } = require('../config/aws');
      return await uploadToS3(file.buffer, folder, file.mimetype, optimize);
    } catch (err) {
      console.error('S3 Upload Error, falling back to next provider:', err);
    }
  }

  // 2. Try Cloudinary if configured (Priority for Resumes/Images)
  const isCloudinaryConfigured = (type === 'resume' && process.env.CLOUDINARY_RESUME_CLOUD_NAME) || 
                                (type === 'cert' && process.env.CLOUDINARY_CERT_CLOUD_NAME) ||
                                (type === 'image' && process.env.CLOUDINARY_IMAGE_CLOUD_NAME);

  if (isCloudinaryConfigured) {
    try {
      const cloudinary = configureCloudinary(type);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
      const publicId = `${cleanFileName}_${uniqueSuffix}`;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: type === 'resume' ? 'raw' : 'auto', 
            public_id: type === 'resume' ? `${publicId}.${file.originalname.split('.').pop()}` : publicId,
            access_mode: 'public'
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Stream Error:', error);
              return reject(error);
            }
            resolve({
              url: result.secure_url,
              key: result.public_id
            });
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (err) {
      console.error('Cloudinary Upload Error:', err);
      // Fallback to local
    }
  }

  // 3. Local Storage fallback
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

  return {
    url: `uploads/${localSubdir}/${filename}`,
    key: `uploads/${localSubdir}/${filename}`
  };
};

module.exports = { uploadFile };
