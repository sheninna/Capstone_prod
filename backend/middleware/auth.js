const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
const RevokedToken = require('../models/revokedToken');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);  


const protect = async (req, res, next) => {
  let token = req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1];  // Check cookies first, then header

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Check if it's a Google ID token (JWT)
    if (token.startsWith('eyJhbGciOiJSUzI1NiIs')) {  
      // Verify the Google ID token
     const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  
     }); 

      const payload = ticket.getPayload(); 
      const googleUserId = payload.sub;  
      const email = payload.email; 

      // Check if the Google user exists in your database
      let user = await User.findOne({ email });
      if (!user) {
        // If user doesn't exist, create a new one
        user = new User({
          email,
          username: payload.name || email,
          googleId: googleUserId,
          profilePicUrl: payload.picture,
        });
        await user.save();  // Save the new user to the database
      }

      // Attach user to the request object
      req.user = user;

      // Proceed to the next middleware or route handler
      next();

    } else {
      // If it's not a Google token, proceed with your normal JWT verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Custom JWT verification
      const jti = decoded.jti;  // The JWT ID to check for revocation

      // Check if the token's `jti` is in the `RevokedToken` collection
      const revokedToken = await RevokedToken.findOne({ jti });

      if (revokedToken) {
        console.log('Token is revoked, blocking request...');
        return res.status(401).json({ message: 'Token is revoked, please log in again' });
      }

      // If the token is valid and not revoked, fetch user from the database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = user;  // Attach user data to the request object
      next();  // Proceed to the next middleware or route handler
    }
  } catch (err) {
    console.error('Token verification error', err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = protect;
