const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the entire decoded object or specific properties to req.user
    req.user = decoded;  // Now req.user will contain { id, email, ... }

    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = protect;
