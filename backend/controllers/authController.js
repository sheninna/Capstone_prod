const User = require('../models/user');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const RevokedToken = require('../models/revokedToken');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;  
console.log('Backend expects GOOGLE_CLIENT_ID:', CLIENT_ID);
const client = new OAuth2Client(CLIENT_ID);



// Google Sign-In handler
const googleSignIn = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'No Google token provided' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleUserId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const profilePicUrl = payload.picture;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found for this Google email. Please register first using your email and password.',
      });
    } else {
      user.googleId = googleUserId;
      if (profilePicUrl) user.profilePicUrl = profilePicUrl;
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
        googleId: user.googleId
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message,
    });
  }
};



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

  // Generate JWT token with unique jti
  const jti = require('crypto').randomBytes(16).toString('hex');
  const token = jwt.sign({ id: newUser._id, jti }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
    console.log('Login attempt for:', email);
    console.log('User found:', user);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token with unique jti
    const jti = require('crypto').randomBytes(16).toString('hex');
    const token = jwt.sign(
      { id: user._id, email: user.email, jti },
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
    const token = req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ message: 'No token, authorization denied' });
    }

    const payload = jwt.decode(token);  

    if (payload && payload.jti && payload.id) {
      await RevokedToken.create({
        jti: payload.jti,
        user: payload.id,  
        expAt: new Date(payload.exp * 1000),  // Expiration time in milliseconds
      });
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });

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
    const user = await User.findById(req.user);  
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

    const userId = req.user;  
    const updateData = {
      phoneNumber: phoneNumber || undefined,
      profilePicUrl: profilePicUrl || undefined,
    };

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);  
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

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const resetLink = `http://127.0.0.1:5501/frontend/Customer/html/resetpassword.html?token=${token}`;

    console.log('Reset link:', resetLink);

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

    user.password = newPassword;
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

// get recent orders (Customer side)
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user;
    const onlineOrders = await Order.find({ user: userId }).sort({ orderPlaced: -1 });
    res.json(onlineOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your orders', error: err.message });
  }
};

module.exports = {
  googleSignIn,
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
  getOrders
};
