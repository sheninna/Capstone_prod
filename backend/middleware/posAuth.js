const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');  // Assuming you are using the Admin model for POS authentication

const posAuth = async (req, res, next) => {
  let token;

  // Check if token is present in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // If token is missing, return error
      if (!token) {
        return res.status(401).json({ message: 'Authorization denied, no token' });
      }

      // Verify the token using the secret key
      const decoded = jwt.verify(token, 'your_secret_key');  // Same secret key as used in token generation

      // Attach the decoded user data to the request object
      req.user = await Admin.findById(decoded.id).select('-password');  // Link it to Admin model

      next();  // Proceed to the next middleware or route handler
    } catch (err) {
      console.log(err);
      res.status(401).json({ message: 'Token is not valid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied, no token' });
  }
};

module.exports = posAuth;
