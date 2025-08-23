const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendPasswordResetEmail = require('../utils/mailer');
const protect = require('../middleware/auth'); 
const multer = require('multer');
const path = require('path');




// Set up multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the correct path for the upload folder
    const uploadPath = path.join(__dirname, '../uploads');  // Goes one level up to the root
    cb(null, uploadPath);  // Ensure multer stores files in the uploads folder
  },
  filename: (req, file, cb) => {
    // Save file with a unique name (timestamp + original file extension)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const upload = multer({ storage: storage });



// Signup
router.post('/signup', async (req, res) => {
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
});


// Login
router.post('/login', async (req, res) => {
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
});



// Protected Profile Route
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user);  // Use the user ID from the JWT payload
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const profilePicUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if req.user contains a valid ObjectId
    const userId = req.user;  // This should be a valid MongoDB ObjectId
    
    // Prepare the update data
    const updateData = {
      phoneNumber: phoneNumber || undefined,
      profilePicUrl: profilePicUrl || undefined,
    };

    // Update the user's profile using the ObjectId
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);  // Return the updated user
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Forgot password - Generate Reset Token and Send Email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Password reset link
    const resetLink = `http://localhost:5000/api/auth/reset-password?token=${token}`;

    // Send the reset password email
    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

// Reset password - Verify token and update password
router.post('/reset-password', async (req, res) => {
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
});



// Add to favorites
router.post('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    user.favorites.push(req.body.foodId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get favorites
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
