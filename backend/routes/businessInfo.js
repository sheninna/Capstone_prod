const express = require('express');
const router = express.Router();
const adminOnly = require('../middleware/adminOnly');
const {
  getBusinessInfo,
  updateBusinessInfo
} = require('../controllers/businessInfoController');

router.get('/', adminOnly, getBusinessInfo);
router.put('/', adminOnly, updateBusinessInfo);

module.exports = router;