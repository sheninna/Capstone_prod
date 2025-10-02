const Admin = require('../models/admin');
const User = require('../models/user');
const Food = require('../models/Food');
const Order = require('../models/Order');
const RevokedToken = require('../models/revokedToken');
const jwt = require('jsonwebtoken');

// Admin Signup
const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();

    // Set token to expire in 24 hours
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, admin: newAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Login
const login = async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password);
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('Admin not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Set token to expire in 24 hours
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: err.message });
  }
};

// View all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit user
const editUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit food (admin only)
const editFood = async (req, res) => {
  const { name, category, portions, price, portion } = req.body;
  const updatedFields = {};

  if (name) updatedFields.name = name;
  if (category) updatedFields.category = category;

  // Handle multiple portions
  if (portions) {
    try {
      let parsedPortions = Array.isArray(portions) ? portions : JSON.parse(portions);
      updatedFields.portions = parsedPortions.filter(p => p.portion && p.price !== undefined);
      // Remove single price/portion if portions are present
      updatedFields.price = undefined;
      updatedFields.portion = undefined;
    } catch (err) {
      return res.status(400).json({ message: 'Invalid portions format' });
    }
  } else {
    // Handle single portion/price
    if (price !== undefined) updatedFields.price = price;
    if (portion !== undefined) updatedFields.portion = portion;
    updatedFields.portions = []; // Clear portions if switching to single price
  }

  // Handle image update if needed
  if (req.file && req.file.path) {
    updatedFields.image = req.file.path;
  }

  try {
    const food = await Food.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json(food);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Admin Dashboard
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalFoods = await Food.countDocuments();
    res.json({ totalUsers, totalOrders, totalFoods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit admin profile
const editAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.admin._id, req.body, { new: true });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change admin password
const changeAdminPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    admin.password = req.body.newPassword;
    await admin.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Logout (Token Revocation)
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    // Decode token to get exp, user, and jti
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Save revoked token with required fields
    await RevokedToken.create({
      token,
      expAt: new Date(decoded.exp * 1000), // JWT exp is in seconds
      user: decoded.id || decoded._id || decoded.user, // adjust based on your payload
      jti: decoded.jti || decoded._id || decoded.id // adjust based on your payload
    });

    res.json({ message: 'Logout successful. Token revoked.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
};
