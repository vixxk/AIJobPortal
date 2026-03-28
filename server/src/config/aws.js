const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3SignedUrl } = require('@aws-sdk/s3-request-presigner');
const sharp = require('sharp');

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
 * Generate a signed URL for private access (e.g., resumes)
 */
const getSignedUrl = async (key, expiresIn = 3600) => {
  if (!key) return null;
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  return await getS3SignedUrl(s3Client, command, { expiresIn });
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
    finalBuffer = await sharp(fileBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .toFormat('webp', { quality: 80 })
      .toBuffer();
    finalMimetype = 'image/webp';
  } else if (isImage && !optimize) {
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
    // Note: ACL is typically managed by bucket policy now
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL;
  const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  const isPrivate = !isImage; // Resumes/PDFs are private

  // images go through CloudFront (if configured) for speed, resumes through S3 Signed URL for privacy
  const baseUrl = isPrivate ? null : (cloudFrontUrl || s3Url);

  return {
    url: isPrivate ? await getSignedUrl(fileName) : `${baseUrl}/${fileName}`,
    key: fileName
  };
};

module.exports = {
  uploadToS3,
  getSignedUrl,
  s3Client
};


