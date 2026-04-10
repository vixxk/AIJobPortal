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
 * Upload a video file to Bunny Stream via native HTTPS streaming
 * @param {string} videoId - The video GUID from createVideo
 * @param {ReadableStream} fileStream - Readable file stream
 * @param {number} fileSize - File size in bytes
 * @param {Function} onProgress - Progress callback ({ loaded, total })
 * @returns {Promise<object>}
 */
exports.uploadVideo = (videoId, fileStream, fileSize, onProgress) => {
  const https = require('https');

  return new Promise((resolve, reject) => {
    const url = new URL(`${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID()}/videos/${videoId}`);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'PUT',
      headers: {
        AccessKey: BUNNY_API_KEY(),
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileSize,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(body)); } catch { resolve(body); }
        } else {
          reject(new Error(`Bunny upload failed with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    // Track upload progress
    let uploaded = 0;
    fileStream.on('data', (chunk) => {
      uploaded += chunk.length;
      if (onProgress) {
        onProgress({ loaded: uploaded, total: fileSize });
      }
    });

    fileStream.on('error', (err) => {
      req.destroy();
      reject(err);
    });

    // Pipe file data directly to the HTTPS request socket
    fileStream.pipe(req);
  });
};

/**
 * Upload a custom thumbnail to a Bunny Stream video
 * @param {string} videoId - The video GUID
 * @param {Buffer} imageBuffer - Raw image data
 * @returns {Promise<object>}
 */
exports.setThumbnail = async (videoId, imageBuffer) => {
  const res = await axios.post(
    `${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID()}/videos/${videoId}/thumbnail`,
    imageBuffer,
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
