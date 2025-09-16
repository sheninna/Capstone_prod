const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const posAuth = require('../middleware/posAuth');
const {
  placeOrder,
  placePosOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', protect, placeOrder);
router.post('/pos', posAuth, placePosOrder);
router.get('/:userId', getUserOrders);
router.get('/', posAuth, getAllOrders);
router.patch('/:orderId/status', posAuth, updateOrderStatus);

module.exports = router;
