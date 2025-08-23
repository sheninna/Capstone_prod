const express = require('express');
const router = express.Router();
const User = require('../models/admin');  
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminOnly = require('../middleware/adminOnly');


// POS User Login Route (Using Username)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;  // Use username instead of email

  try {
    // Find the user by username (could be an admin or employee for POS)
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for POS login
    const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });

    // Send the token back to the client for authentication
    res.json({ message: 'POS login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all online orders for POS users
router.get('/pos/orders', adminOnly, async (req, res) => {
  try {
    // Retrieve all orders where the source is 'online'
    const orders = await Order.find({ source: 'online' }).populate('user').populate('items'); // Populate to get user and items data
    res.json(orders);  // Send the orders as a response
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving orders', error: err.message });
  }
});


module.exports = router;
