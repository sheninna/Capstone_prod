const express = require('express');
const router = express.Router();
const adminOnly = require('../middleware/adminOnly');
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
router.put('/foods/:id', adminOnly, editFood);

// Admin Dashboard
router.get('/dashboard', adminOnly, getDashboard);

// Edit admin profile
router.put('/profile', adminOnly, editAdminProfile);

// Change admin password
router.put('/change-password', adminOnly, changeAdminPassword);

module.exports = router;
