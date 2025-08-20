// /utils/mailer.js

const nodemailer = require('nodemailer');

// Create the Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail account
    pass: process.env.GMAIL_PASS, // Your Gmail app-specific password
  },
});

// Send reset password email
const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset link sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendPasswordResetEmail;
