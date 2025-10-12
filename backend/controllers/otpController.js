const User = require('../models/user');
const Otp = require('../models/otp');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/mailer'); // Import from mailer.js

// Generate and send OTP for signup (even if user doesn't exist yet)
const sendSignupOtp = async (req, res) => {
  const { username, email, password } = req.body; // Accept username and password
  const user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: 'User already exists' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Save username and password in OTP record
  await Otp.create({ email, otp, expiresAt, username, password });
  await sendOtpEmail(email, otp);

  res.json({ message: 'OTP sent to email' });
};

// Verify OTP and create user account
const verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
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
    const newUser = new User({
      username: record.username,
      email,
      password: record.password
    });
    await newUser.save();

    await Otp.deleteMany({ email });

    // Generate JWT token
    const jti = require('crypto').randomBytes(16).toString('hex');
    const token = jwt.sign({ id: newUser._id, jti }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendSignupOtp, verifySignupOtp };