const express = require('express');
const router = express.Router();
const adminOnly = require('../middleware/adminOnly');
const { posLogin, getOnlineOrders } = require('../controllers/posController');

// POS User Login Route (Using Username)
router.post('/login', posLogin);

// Get all online orders for POS users
router.get('/pos/orders', adminOnly, getOnlineOrders);

module.exports = router;
