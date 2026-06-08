/**
 * Hyrego Email Templates — Centralized, premium email design system
 * All emails use a consistent brand identity with modern styling.
 */

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─────────────────────────────────────────────────────────────────────────────
// BASE LAYOUT WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

const baseWrapper = (content, { preheader = '' } = {}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Hyrego</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f1a; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#0f0f1a;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f1a;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="${CLIENT_URL}/hyrego-logo-favicon.png" alt="Hyrego Logo" width="36" height="36" style="display: block; border-radius: 10px;" />
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Hyrego</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <div style="background: linear-gradient(145deg, #1a1a2e 0%, #16162a 100%); border-radius: 24px; border: 1px solid rgba(99, 102, 241, 0.15); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(99, 102, 241, 0.05); overflow: hidden;">
                ${content}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 12px; color: #4a4a6a; margin: 0; line-height: 1.6;">
                Sent via <span style="color: #8b5cf6; font-weight: 700;">Hyrego AI Career Assistant</span>
              </p>
              <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 11px; color: #3a3a5a; margin: 8px 0 0;">
                © ${new Date().getFullYear()} Hyrego. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const accentBar = (color = '#6366f1') => `
  <div style="height: 4px; background: linear-gradient(90deg, ${color}, ${color}88, transparent); border-radius: 0 0 4px 4px;"></div>
`;

const statusBadge = (text, bgColor, textColor) => `
  <div style="display: inline-block; padding: 8px 20px; background: ${bgColor}; border-radius: 50px; margin-top: 8px;">
    <span style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 13px; font-weight: 800; color: ${textColor}; letter-spacing: 1px; text-transform: uppercase;">${text}</span>
  </div>
`;

const ctaButton = (text, url, gradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)') => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
    <tr>
      <td align="center" style="border-radius: 14px; background: ${gradient};">
        <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

const infoCard = (items) => {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 10px 16px; border-bottom: 1px solid rgba(99, 102, 241, 0.08);">
        <span style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.8px;">${item.label}</span>
        <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 14px; font-weight: 600; color: #e2e2f0; margin: 4px 0 0; line-height: 1.4;">${item.value}</p>
      </td>
    </tr>
  `).join('');

  return `
    <div style="background: rgba(99, 102, 241, 0.06); border: 1px solid rgba(99, 102, 241, 0.12); border-radius: 16px; overflow: hidden; margin: 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows}
      </table>
    </div>
  `;
};

const quoteBlock = (label, text) => `
  <div style="margin: 24px 0; padding: 16px 20px; border-left: 3px solid #6366f1; background: rgba(99, 102, 241, 0.05); border-radius: 0 12px 12px 0;">
    <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 10px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">${label}</p>
    <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 14px; font-weight: 500; color: #a0a0c0; line-height: 1.6; margin: 0; font-style: italic;">"${text}"</p>
  </div>
`;

const heading = (text, color = '#ffffff') => `
  <h2 style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 24px; font-weight: 800; color: ${color}; margin: 0 0 8px; letter-spacing: -0.5px; line-height: 1.3;">${text}</h2>
`;

const subtext = (text) => `
  <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 15px; font-weight: 500; color: #8888a8; line-height: 1.7; margin: 0 0 24px;">${text}</p>
`;

const greeting = (name) => `
  <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 15px; font-weight: 600; color: #c0c0d8; margin: 0 0 16px;">Hi ${name || 'there'},</p>
`;

const divider = () => `
  <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent); margin: 28px 0;"></div>
`;

const footerNote = (text) => `
  <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 12px; color: #5a5a7a; line-height: 1.6; margin: 24px 0 0; text-align: center;">${text}</p>
`;

const companyFooter = (companyName) => `
  <div style="text-align: center; padding-top: 8px;">
    <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 11px; color: #4a4a6a; margin: 0;">
      Sent by <span style="color: #8888a8; font-weight: 600;">${companyName}</span> via <span style="color: #8b5cf6; font-weight: 700;">Hyrego AI</span>
    </p>
  </div>
`;

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * OTP Login / Verification Email
 */
const otpEmail = (otp, name) => {
  const digits = otp.toString().split('');
  const otpBoxes = digits.map(d => `
    <td style="padding: 0 4px;">
      <div style="width: 48px; height: 60px; background: linear-gradient(145deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.08)); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 12px; text-align: center; line-height: 60px;">
        <span style="font-family: 'Inter', 'Courier New', monospace; font-size: 28px; font-weight: 900; color: #a78bfa; letter-spacing: 0;">${d}</span>
      </div>
    </td>
  `).join('');

  const content = `
    ${accentBar('#6366f1')}
    <div style="padding: 40px 36px;">
      <div style="text-align: center;">
        <div style="display: inline-block; padding: 10px 14px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; margin-bottom: 20px;">
          <span style="font-size: 28px;">🔐</span>
        </div>
        ${heading('Verification Code')}
        ${greeting(name)}
        ${subtext('Use the code below to sign in to your Hyrego account. This code expires in <strong style="color: #a78bfa;">10 minutes</strong>.')}
      </div>
      
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
        <tr>
          ${otpBoxes}
        </tr>
      </table>
      
      ${divider()}
      ${footerNote("If you didn't request this code, you can safely ignore this email.")}
    </div>
  `;

  return baseWrapper(content, { preheader: `${otp} is your Hyrego verification code` });
};

/**
 * Account Approved Email
 */
const accountApprovedEmail = (name, role, loginUrl) => {
  const content = `
    ${accentBar('#10b981')}
    <div style="padding: 40px 36px;">
      <div style="text-align: center;">
        <div style="display: inline-block; padding: 10px 14px; background: rgba(16, 185, 129, 0.1); border-radius: 12px; margin-bottom: 20px;">
          <span style="font-size: 28px;">🎉</span>
        </div>
        ${heading('Account Approved!', '#34d399')}
      </div>
      
      ${greeting(name)}
      ${subtext(`Your <strong style="color: #34d399;">${role === 'RECRUITER' ? 'Recruiter' : 'College'}</strong> account on Hyrego has been reviewed and approved by our admin team. You now have full access to all platform features.`)}
      
      ${infoCard([
        { label: 'Account Type', value: role === 'RECRUITER' ? '🏢 Recruiter' : '🏫 College Admin' },
        { label: 'Status', value: '✅ Verified & Active' }
      ])}
      
      <div style="text-align: center; margin: 32px 0 8px;">
        ${ctaButton('Login to Dashboard →', loginUrl, 'linear-gradient(135deg, #10b981, #059669)')}
      </div>
      
      ${divider()}
      ${footerNote('Welcome aboard! Start exploring opportunities on Hyrego.')}
    </div>
  `;

  return baseWrapper(content, { preheader: 'Great news! Your Hyrego account has been approved.' });
};

/**
 * Account Rejected Email
 */
const accountRejectedEmail = (name, role, reason) => {
  const content = `
    ${accentBar('#ef4444')}
    <div style="padding: 40px 36px;">
      <div style="text-align: center;">
        <div style="display: inline-block; padding: 10px 14px; background: rgba(239, 68, 68, 0.1); border-radius: 12px; margin-bottom: 20px;">
          <span style="font-size: 28px;">📋</span>
        </div>
        ${heading('Application Update', '#f87171')}
      </div>
      
      ${greeting(name)}
      ${subtext(`Unfortunately, your <strong style="color: #f87171;">${role === 'RECRUITER' ? 'Recruiter' : 'College'}</strong> account application was not approved at this time.`)}
      
      <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 14px; padding: 20px; margin: 24px 0;">
        <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 11px; font-weight: 800; color: #f87171; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Reason for Rejection</p>
        <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 14px; font-weight: 500; color: #d0d0e0; line-height: 1.6; margin: 0;">${reason}</p>
      </div>
      
      ${subtext('Please log back in, review your application details, and resubmit for approval.')}
      
      ${divider()}
      ${footerNote('Need help? Reply to this email and our support team will assist you.')}
    </div>
  `;

  return baseWrapper(content, { preheader: 'Update regarding your Hyrego account application.' });
};

/**
 * Application Status Update Email
 */
const applicationStatusEmail = (studentName, jobTitle, status, feedback, companyName) => {
  const statusConfig = {
    HIRED: {
      emoji: '🎊',
      color: '#34d399',
      accentColor: '#10b981',
      heading: 'Congratulations!',
      message: `We are thrilled to inform you that you have been <strong style="color: #34d399;">Hired</strong> for the <strong style="color: #e2e2f0;">${jobTitle}</strong> position! The team was highly impressed with your profile.`,
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeText: '#34d399'
    },
    REJECTED: {
      emoji: '📝',
      color: '#f87171',
      accentColor: '#ef4444',
      heading: 'Application Update',
      message: `Thank you for your interest in the <strong style="color: #e2e2f0;">${jobTitle}</strong> position. After careful review, we have decided to move forward with other candidates at this time.`,
      badgeBg: 'rgba(239, 68, 68, 0.12)',
      badgeText: '#f87171'
    },
    SHORTLISTED: {
      emoji: '⭐',
      color: '#fbbf24',
      accentColor: '#f59e0b',
      heading: 'You\'ve Been Shortlisted!',
      message: `Great news! You have been <strong style="color: #fbbf24;">Shortlisted</strong> for the <strong style="color: #e2e2f0;">${jobTitle}</strong> role. We will reach out soon with next steps.`,
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeText: '#fbbf24'
    },
    DEFAULT: {
      emoji: '📬',
      color: '#a78bfa',
      accentColor: '#6366f1',
      heading: 'Application Status Update',
      message: `Your application for <strong style="color: #e2e2f0;">${jobTitle}</strong> has been updated.`,
      badgeBg: 'rgba(99, 102, 241, 0.12)',
      badgeText: '#a78bfa'
    }
  };

  const cfg = statusConfig[status] || statusConfig.DEFAULT;

  const content = `
    ${accentBar(cfg.accentColor)}
    <div style="padding: 40px 36px;">
      <div style="text-align: center;">
        <div style="display: inline-block; padding: 10px 14px; background: ${cfg.badgeBg}; border-radius: 12px; margin-bottom: 20px;">
          <span style="font-size: 28px;">${cfg.emoji}</span>
        </div>
        ${heading(cfg.heading, cfg.color)}
      </div>
      
      ${greeting(studentName)}
      ${subtext(cfg.message)}
      
      <div style="text-align: center; margin: 24px 0;">
        ${infoCard([
          { label: 'Position', value: jobTitle },
          { label: 'Current Status', value: `<span style="color: ${cfg.color}; font-weight: 800;">${status}</span>` }
        ])}
      </div>
      
      ${feedback ? quoteBlock('Message from Recruiter', feedback) : ''}
      
      ${subtext('Log in to your candidate dashboard to view full details and track your applications.')}
      
      ${divider()}
      ${companyFooter(companyName || 'Recruitment Team')}
    </div>
  `;

  const preheaders = {
    HIRED: `Congratulations! You've been hired for ${jobTitle}!`,
    REJECTED: `Update regarding your application for ${jobTitle}`,
    SHORTLISTED: `Great news! You've been shortlisted for ${jobTitle}`,
    DEFAULT: `Application update for ${jobTitle}`
  };

  return baseWrapper(content, { preheader: preheaders[status] || preheaders.DEFAULT });
};

/**
 * Interview Scheduled Email
 */
const interviewScheduledEmail = (studentName, jobTitle, scheduledDate, scheduledTime, meetingLink, message, companyName) => {
  const content = `
    ${accentBar('#6366f1')}
    <div style="padding: 40px 36px;">
      <div style="text-align: center;">
        <div style="display: inline-block; padding: 10px 14px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; margin-bottom: 20px;">
          <span style="font-size: 28px;">🎤</span>
        </div>
        ${heading('Interview Scheduled')}
      </div>
      
      ${greeting(studentName)}
      ${subtext(`An interview has been scheduled for the <strong style="color: #e2e2f0;">${jobTitle}</strong> position. Please find the details below.`)}
      
      ${infoCard([
        { label: 'Position', value: jobTitle },
        { label: 'Date', value: `📅 ${scheduledDate}` },
        { label: 'Time', value: `⏰ ${scheduledTime}` },
        { label: 'Meeting Link', value: `<a href="${meetingLink}" style="color: #a78bfa; font-weight: 700; text-decoration: none;">Join Interview →</a>` }
      ])}
      
      ${message ? quoteBlock('Message from Recruiter', message) : ''}
      
      <div style="text-align: center; margin: 32px 0 8px;">
        ${ctaButton('Join Interview →', meetingLink)}
      </div>
      
      ${divider()}
      
      <div style="text-align: center;">
        <p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 13px; font-weight: 700; color: #a78bfa; margin: 0 0 4px;">Good luck! 🍀</p>
      </div>
      
      ${companyFooter(companyName || 'Recruitment Team')}
    </div>
  `;

  return baseWrapper(content, { preheader: `Interview scheduled for ${jobTitle} on ${scheduledDate}` });
};

/**
 * New Recruiter Message Email
 */
const recruiterMessageEmail = (studentName, jobTitle, message, companyName) => {
  const content = `
    ${accentBar('#6366f1')}
    <div style="padding: 40px 36px;">
      <div style="text-align: center;">
        <div style="display: inline-block; padding: 10px 14px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; margin-bottom: 20px;">
          <span style="font-size: 28px;">💬</span>
        </div>
        ${heading('New Message')}
      </div>
      
      ${greeting(studentName)}
      ${subtext(`You have received a new message regarding your application for <strong style="color: #e2e2f0;">${jobTitle}</strong>.`)}
      
      ${quoteBlock('From ' + (companyName || 'Recruiter'), message)}
      
      ${subtext('Log in to your candidate portal for full details and to respond.')}
      
      ${divider()}
      ${companyFooter(companyName || 'Recruiter')}
    </div>
  `;

  return baseWrapper(content, { preheader: `New message about your ${jobTitle} application` });
};

/**
 * Generic / Fallback Email (used by mailer.js for plain message emails)
 */
const genericEmail = (subject, messageBody, name) => {
  const formattedMessage = messageBody
    .split('\n')
    .map(para => para.trim())
    .filter(Boolean)
    .map(para => `<p style="font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 14px; font-weight: 500; color: #a0a0c0; line-height: 1.7; margin: 0 0 14px;">${para}</p>`)
    .join('');

  const content = `
    ${accentBar('#6366f1')}
    <div style="padding: 40px 36px;">
      <div style="text-align: center;">
        <div style="display: inline-block; padding: 10px 14px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; margin-bottom: 20px;">
          <span style="font-size: 28px;">📨</span>
        </div>
        ${heading(subject || 'Notification')}
      </div>
      
      ${name ? greeting(name) : ''}
      
      <div style="margin: 24px 0;">
        ${formattedMessage}
      </div>
      
      ${divider()}
      ${footerNote('This is an automated notification from Hyrego.')}
    </div>
  `;

  return baseWrapper(content, { preheader: subject || '' });
};

module.exports = {
  otpEmail,
  accountApprovedEmail,
  accountRejectedEmail,
  applicationStatusEmail,
  interviewScheduledEmail,
  recruiterMessageEmail,
  genericEmail
};
