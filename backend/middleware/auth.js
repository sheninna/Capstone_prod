const jwt = require('jsonwebtoken');
const User = require('../models/user'); 


const protect = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];  // Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Decode the token using the secret

    // Fetch the user from the database using the decoded user ID
    const user = await User.findById(decoded.id);  // Get full user object from the database

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;  // Store the full user object in req.user

    next();  // Move to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


module.exports = protect;
