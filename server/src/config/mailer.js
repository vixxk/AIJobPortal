const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const mailConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  // If using Gmail, it's often more reliable to use the 'service' setting
  if (process.env.EMAIL_HOST?.includes('gmail.com')) {
    delete mailConfig.host;
    delete mailConfig.port;
    mailConfig.service = 'gmail';
  }

  const transporter = nodemailer.createTransport(mailConfig);

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;