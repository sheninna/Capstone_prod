const express = require('express');
const router = express.Router();
const {
  getMonthlySales,
  getBestSelling,
  getOrderTypes,
  getOrdersByMonth,
  getBestSellingMenuDashboard
} = require('../controllers/reportsController');
const adminOnly = require('../middleware/adminOnly');

// Monthly sales
router.get('/monthly-sales', adminOnly, getMonthlySales);

// Best selling items
router.get('/best-selling', adminOnly, getBestSelling);

// Order types
router.get('/order-types', adminOnly, getOrderTypes);

// Orders by month
router.get('/orders-by-month', adminOnly, getOrdersByMonth);

// Best selling dashboard
router.get('/best-selling-dashboard', adminOnly, getBestSellingMenuDashboard);

module.exports = router;