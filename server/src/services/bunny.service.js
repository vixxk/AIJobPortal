const axios = require('axios');

const BUNNY_API_KEY = () => process.env.BUNNY_STREAM_API_KEY;
const BUNNY_LIBRARY_ID = () => process.env.BUNNY_STREAM_LIBRARY_ID;
const BUNNY_CDN_HOSTNAME = () => process.env.BUNNY_CDN_HOSTNAME || '';

const BUNNY_BASE_URL = 'https://video.bunnycdn.com';

/**
 * Create a video object in the Bunny Stream library
 * @param {string} title - Video title
 * @returns {Promise<{videoId: string, ...}>} Created video metadata
 */
exports.createVideo = async (title) => {
  const res = await axios.post(
    `${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID()}/videos`,
    { title },
    {
      headers: {
        AccessKey: BUNNY_API_KEY(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );
  return res.data; // { guid, ...metadata }
};

/**
 * Upload a video file buffer to Bunny Stream
 * @param {string} videoId - The video GUID from createVideo
 * @param {Buffer} fileBuffer - Raw file buffer
 * @returns {Promise<object>}
 */
exports.uploadVideo = async (videoId, fileBuffer) => {
  const res = await axios.put(
    `${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID()}/videos/${videoId}`,
    fileBuffer,
    {
      headers: {
        AccessKey: BUNNY_API_KEY(),
        'Content-Type': 'application/octet-stream',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );
  return res.data;
};

/**
 * Get video details/status from Bunny Stream
 * @param {string} videoId - The video GUID
 * @returns {Promise<object>} Video metadata including status
 */
exports.getVideo = async (videoId) => {
  const res = await axios.get(
    `${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID()}/videos/${videoId}`,
    {
      headers: {
        AccessKey: BUNNY_API_KEY(),
        Accept: 'application/json',
      },
    }
  );
  return res.data;
};

/**
 * Delete a video from Bunny Stream
 * @param {string} videoId - The video GUID
 * @returns {Promise<void>}
 */
exports.deleteVideo = async (videoId) => {
  await axios.delete(
    `${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID()}/videos/${videoId}`,
    {
      headers: {
        AccessKey: BUNNY_API_KEY(),
      },
    }
  );
};

/**
 * Build the embed/play URL for a Bunny Stream video
 * @param {string} videoId
 * @returns {string}
 */
exports.getEmbedUrl = (videoId) => {
  const libraryId = BUNNY_LIBRARY_ID();
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
};

/**
 * Build the thumbnail URL for a Bunny Stream video
 * @param {string} videoId
 * @returns {string}
 */
exports.getThumbnailUrl = (videoId) => {
  const cdnHost = BUNNY_CDN_HOSTNAME();
  if (cdnHost) {
    return `https://${cdnHost}/${videoId}/thumbnail.jpg`;
  }
  // Fallback to default bunny CDN
  return `https://vz-${BUNNY_LIBRARY_ID()}.b-cdn.net/${videoId}/thumbnail.jpg`;
};
