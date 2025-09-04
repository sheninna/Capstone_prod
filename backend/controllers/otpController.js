const User = require('../models/user');
const Otp = require('../models/otp');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/mailer'); // Import from mailer.js

// Generate and send OTP for signup (even if user doesn't exist yet)
const sendSignupOtp = async (req, res) => {
  const { email } = req.body;
  // Optionally, check if user already exists
  const user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: 'User already exists' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({ email, otp, expiresAt });
  await sendOtpEmail(email, otp);

  res.json({ message: 'OTP sent to email' });
};

// Verify OTP and create user account
const verifySignupOtp = async (req, res) => {
  const { username, email, password, otp } = req.body;
  const record = await Otp.findOne({ email, otp });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Check again if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    await Otp.deleteMany({ email });
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  const newUser = new User({ username, email, password });
  await newUser.save();

  await Otp.deleteMany({ email });

  res.json({ message: 'Account created successfully! Please log in.' });
};

module.exports = { sendSignupOtp, verifySignupOtp };