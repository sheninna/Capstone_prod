const User = require('../models/user');
const Otp = require('../models/otp');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/mailer'); // Import from mailer.js

// Generate and send OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({ email, otp, expiresAt });

  // Send OTP via email using mailer.js
  await sendOtpEmail(email, otp);

  res.json({ message: 'OTP sent to email' });
};

// Verify OTP and login
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // OTP is valid, log in user and issue JWT
  const user = await User.findOne({ email });
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Optionally, delete OTP record after use
  await Otp.deleteMany({ email });

  res.json({ token, user });
};

module.exports = { sendOtp, verifyOtp };