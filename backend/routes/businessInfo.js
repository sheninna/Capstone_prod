const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getBusinessInfo,
  updateBusinessInfo
} = require('../controllers/businessInfoController');

router.get('/', protect, getBusinessInfo);
router.put('/', protect, updateBusinessInfo);

module.exports = router;