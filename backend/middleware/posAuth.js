const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');  

const posAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Authorization denied, no token' });
      }

      const decoded = jwt.verify(token, 'your_secret_key');  

      req.user = await Admin.findById(decoded.id).select('-password'); 

      next();  
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
