const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const RevokedToken = require('../models/revokedToken'); 

const protect = async (req, res, next) => {
  let token = req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1];  // Check cookies first, then header

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Decode the token to get its payload (including `jti`)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token using the secret
    const jti = decoded.jti;  // Get the JWT ID (jti) from the token

    // Debug: Print the token's `jti` and check if it's revoked
    console.log('Token jti:', jti);

    // Check if the token's `jti` is in the `RevokedToken` collection
    const revokedToken = await RevokedToken.findOne({ jti });

    if (revokedToken) {
      console.log('Token is revoked, blocking request...');
      return res.status(401).json({ message: 'Token is revoked, please log in again' });
    }

    // If token is valid and not revoked, fetch user from the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;  // Attach user data to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Token verification error', err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = protect;
