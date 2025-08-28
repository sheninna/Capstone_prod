const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const RevokedToken = require('../models/revokedToken');
const sendPasswordResetEmail = require('../utils/mailer');

// Signup
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email },  // Include email in the token payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const logout = async (req, res) => {
  try {
    // Check for the refresh token in cookies or the Authorization header
    const token = req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ message: 'No token, authorization denied' });
    }

    // Decode the token to get its payload (including the `jti` and user ID)
    const payload = jwt.decode(token);  // Decode without verifying just to get the payload

    // If the token contains a `jti` (JWT ID) and user ID, store it as a revoked token
    if (payload && payload.jti && payload.userId) {
      await RevokedToken.create({
        jti: payload.jti,
        user: payload.userId,  // Set the user ID from the decoded token
        expAt: new Date(payload.exp * 1000),  // Expiration time in milliseconds
      });
    }

    // Clear the refresh token from the client's cookies
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });

    // Optionally, you can also clear the access token from the front-end (if stored in localStorage or sessionStorage)

    return res.json({ ok: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error', err);
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
    return res.status(500).json({ ok: false, message: 'Logout failed' });
  }
};



// Protected Profile Route
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);  // Use the user ID from the JWT payload
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const profilePicUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const userId = req.user;  // This should be a valid MongoDB ObjectId
    const updateData = {
      phoneNumber: phoneNumber || undefined,
      profilePicUrl: profilePicUrl || undefined,
    };

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);  // Return the updated user
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot password - Generate Reset Token and Send Email
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `http://localhost:5000/api/auth/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
};

// Reset password - Verify token and update password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// Add to favorites
const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    user.favorites.push(req.body.foodId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get favorites
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  addToFavorites,
  getFavorites,
};
