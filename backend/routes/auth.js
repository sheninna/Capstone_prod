const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const protect = require('../middleware/auth');
const {
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
} = require('../controllers/authController');


router.post('/google-sign-in', googleSignIn);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout); 
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profilePic'), updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/favorites', protect, addToFavorites);
router.get('/favorites', protect, getFavorites);

module.exports = router;
