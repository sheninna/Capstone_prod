const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const adminOnly = async (req, res, next) => {
  // Get token from header or request
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Attach the admin to the request object
    req.admin = admin;
    next(); // Allow the request to proceed
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = adminOnly;
