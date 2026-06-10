const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { genericEmail } = require('./emailTemplates');

const sendEmail = async (options) => {
  let htmlBody = options.html;
  if (!htmlBody && options.message) {
    htmlBody = genericEmail(options.subject, options.message, options.name);
  }

  // Embed logo image as an inline attachment
  const inlineImages = [];
  try {
    const logoPath = path.join(__dirname, 'hyrego-logo-favicon.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      inlineImages.push({
        content: logoBuffer.toString('base64'),
        mime_type: 'image/png',
        cid: 'hyrego_logo'
      });
    }
  } catch (err) {
    console.error('Failed to load inline logo for email:', err);
  }

  const payload = {
    from: {
      address: process.env.FROM_EMAIL || 'auth@hyrego.com',
      name: process.env.FROM_NAME || 'Hyrego'
    },
    to: [
      {
        email_address: {
          address: options.email,
          name: options.name || ''
        }
      }
    ],
    subject: options.subject,
    htmlbody: htmlBody,
    textbody: options.message || '',
    inline_images: inlineImages
  };

  try {
    const response = await axios.post(
      process.env.ZEPTOMAIL_API_URL || 'https://api.zeptomail.in/v1.1/email',
      payload,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': process.env.ZEPTOMAIL_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Zeptomail API sending failed:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = sendEmail;

