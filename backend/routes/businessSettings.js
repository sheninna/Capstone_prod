const express = require('express');
const router = express.Router();
const { getBusinessSettings, updateBusinessSettings } = require('../controllers/businessController');
const adminOnly = require('../middleware/adminOnly'); // Only admin should update

router.get('/', getBusinessSettings);
router.put('/', adminOnly, updateBusinessSettings);

module.exports = router;