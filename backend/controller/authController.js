const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const sendPasswordResetEmail = require('../utils/mailer');

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Generate a reset token
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Create the password reset link
  const resetLink = `http://localhost:5000/api/auth/reset-password?token=${token}`;

  // Send the password reset email
  await sendPasswordResetEmail(email, resetLink);

  res.status(200).json({ message: 'Password reset link sent to your email' });
};

// Reset password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Find the user and update their password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { forgotPassword, resetPassword };
