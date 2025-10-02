const express = require('express');
const router = express.Router();
const adminOnly = require('../middleware/adminOnly');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // or your config
const {
  signup,
  login,
  getUsers,
  editUser,
  deleteUser,
  editFood,
  getDashboard,
  editAdminProfile,
  changeAdminPassword,
  logout,
} = require('../controllers/adminController');

// Admin Signup
router.post('/signup', signup);

// Admin Login
router.post('/login', login);

// View all users
router.get('/users', adminOnly, getUsers);

// Edit user
router.put('/users/:id', adminOnly, editUser);

// Delete user
router.delete('/users/:id', adminOnly, deleteUser);

// Edit food (admin only)
router.put('/foods/:id', adminOnly, upload.single('image'), editFood);

// Admin Dashboard
router.get('/dashboard', adminOnly, getDashboard);

// Edit admin profile
router.put('/profile', adminOnly, editAdminProfile);

// Change admin password
router.put('/change-password', adminOnly, changeAdminPassword);

// Admin Logout
router.post('/logout', logout);

module.exports = router;
