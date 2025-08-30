const User = require('../models/user');
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
  console.log('Received Google token:', token);

  if (!token) {
    return res.status(400).json({ success: false, message: 'No Google token provided' });
  }

  if (!CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID is not set in environment');
    return res.status(500).json({ success: false, message: 'Server not configured for Google Sign-In' });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Token payload:', payload);
    console.log('Audience in token (payload.aud):', payload.aud);
    console.log('Backend expects CLIENT_ID:', CLIENT_ID);

    if (payload.aud !== CLIENT_ID) {
      console.error(`Mismatch: payload.aud = ${payload.aud}, expected CLIENT_ID = ${CLIENT_ID}`);
      throw new Error('Token audience mismatch');
    }

    if (!payload || !payload.email) {
      throw new Error('Token payload missing required fields');
    }

    const googleUserId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const profilePicUrl = payload.picture;

    console.log('Google payload:', { googleUserId, email, name });

    // Step 1: Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If the user doesn't exist, create a new user
      console.log('User not found, creating new user...');
      user = new User({
        email,
        username: name || email,
        googleId: googleUserId,
        profilePicUrl,
      });
      await user.save();
    } else if (!user.googleId) {
      // If the user exists but the googleId is missing, update the user record
      console.log('User found but googleId is missing, updating...');
      user.googleId = googleUserId;
      if (!user.profilePicUrl && profilePicUrl) user.profilePicUrl = profilePicUrl;
      await user.save();
    }

    // Step 2: Generate a JWT token for the user
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Step 3: Return the JWT token and user info
    return res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
      },
    });
  } catch (error) {
    console.error('Error verifying Google token:', error && (error.stack || error.message) || error);
    return res.status(400).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message,
      backendClientId: CLIENT_ID // for debugging
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
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
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
    // Check for the refresh token in cookies or the Authorization header
    const token = req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ message: 'No token, authorization denied' });
    }

    // Decode the token to get its payload (including the `jti` and user ID)
    const payload = jwt.decode(token);  

    // Always store the token's jti and user ID for revocation
    if (payload && payload.jti && payload.id) {
      await RevokedToken.create({
        jti: payload.jti,
        user: payload.id,  
        expAt: new Date(payload.exp * 1000),  // Expiration time in milliseconds
      });
    }
    // Clear the refresh token from the client's cookies
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
};
