const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const path = require('path');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getFileExtension = (mimetype) => {
  return mimetype.split('/')[1] || 'jpg';
};

/**
 * Upload a file to S3 with optional optimization
 */
const uploadToS3 = async (fileBuffer, folder, mimetype, optimize = true) => {
  let finalBuffer = fileBuffer;
  let finalMimetype = mimetype;
  const isImage = mimetype.startsWith('image/');
  const ext = getFileExtension(mimetype);
  
  if (isImage && optimize) {
    // Standard optimization for avatars, etc.
    finalBuffer = await sharp(fileBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .toFormat('webp', { quality: 80 })
      .toBuffer();
    finalMimetype = 'image/webp';
  } else if (isImage && !optimize) {
    // DO NOT REDUCE QUALITY for course thumbnails as requested
    finalBuffer = fileBuffer;
    finalMimetype = mimetype;
  }

  const fileExt = isImage && optimize ? 'webp' : ext;
  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: finalBuffer,
    ContentType: finalMimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL || `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  return {
    url: `${cloudFrontUrl}/${fileName}`,
    key: fileName
  };
};

module.exports = {
  uploadToS3,
  s3Client
};
