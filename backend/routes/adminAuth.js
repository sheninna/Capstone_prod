const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const User = require('../models/user');
const Food = require('../models/Food');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const adminOnly = require('../middleware/adminOnly');

// Admin Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();

    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, admin: newAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View all users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit user
router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Dashboard
router.get('/dashboard', adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalFoods = await Food.countDocuments();
    res.json({ totalUsers, totalOrders, totalFoods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit admin profile
router.put('/profile', adminOnly, async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.admin._id, req.body, { new: true });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change admin password
router.put('/change-password', adminOnly, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    admin.password = req.body.newPassword;
    await admin.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;