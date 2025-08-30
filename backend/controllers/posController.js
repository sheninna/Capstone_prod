const User = require('../models/admin');  
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');

// POS User Login
const posLogin = async (req, res) => {
  const { username, password } = req.body;

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

    res.json({ message: 'POS login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all online orders for POS users
const getOnlineOrders = async (req, res) => {
  try {
    // Retrieve all orders where the source is 'online'
    const orders = await Order.find({ source: 'online' }).populate('user').populate('items'); 
    res.json(orders);  
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving orders', error: err.message });
  }
};

module.exports = {
  posLogin,
  getOnlineOrders,
};
