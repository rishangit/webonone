const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create reusable transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.webonone.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    },
  });

  return transporter;
};

/**
 * Load email template from file
 * @param {string} templateName - Name of the template file (without .html extension)
 * @returns {string} - Template content
 */
const loadEmailTemplate = (templateName) => {
  try {
    const templatePath = path.join(__dirname, 'emails', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
};

/**
 * Replace template variables
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {object} variables - Object with variable values
 * @returns {string} - Template with replaced variables
 */
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  return result;
};

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name (optional)
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (to, resetToken, userName = 'User') => {
  try {
    const emailTransporter = createTransporter();
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/system/reset-password?token=${resetToken}`;

    // Load and populate template
    const template = loadEmailTemplate('passwordReset');
    const html = replaceTemplateVariables(template, {
      userName: userName,
      resetLink: resetLink,
      currentYear: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"WebOnOne" <${process.env.EMAIL_FROM || 'noreply@webonone.com'}>`,
      to: to,
      subject: 'Password Reset Request - WebOnOne',
      html: html,
      text: `
        Hello ${userName},
        
        We received a request to reset your password for your WebOnOne account.
        
        Click the following link to reset your password:
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        © ${new Date().getFullYear()} WebOnOne. All rights reserved.
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

/**
 * Send account verification email (for signup process)
 * @param {string} to - Recipient email address
 * @param {string} verificationToken - Email verification token
 * @param {string} userName - User's name (optional)
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (to, verificationToken, userName = 'User') => {
  try {
    const emailTransporter = createTransporter();
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/system/email-verify?token=${verificationToken}`;

    // Load and populate template
    const template = loadEmailTemplate('emailVerification');
    const html = replaceTemplateVariables(template, {
      userName: userName,
      verificationLink: verificationLink,
      currentYear: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"WebOnOne" <${process.env.EMAIL_FROM || 'noreply@webonone.com'}>`,
      to: to,
      subject: 'Verify Your Email Address - WebOnOne',
      html: html,
      text: `
        Hello ${userName},
        
        Thank you for creating an account with WebOnOne! Please verify your email address and set your password to complete your registration.
        
        Click the following link to verify your email and set your password:
        ${verificationLink}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
        
        © ${new Date().getFullYear()} WebOnOne. All rights reserved.
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Verify email service configuration
 * @returns {Promise<boolean>}
 */
const verifyEmailConfig = async () => {
  try {
    const emailTransporter = createTransporter();
    await emailTransporter.verify();
    console.log('Email service configuration is valid');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  verifyEmailConfig,
  createTransporter,
};
