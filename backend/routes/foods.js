const express = require('express');
const router = express.Router();
const adminOnly = require('../middleware/adminOnly');
const {
  addFood,
  deleteFood,
  getAllFoods,
} = require('../controllers/foodController');

// POST /api/foods - Only admin can add food
router.post('/', adminOnly, addFood);

// DELETE /api/foods/:id - Only admin can delete food
router.delete('/:id', adminOnly, deleteFood);

// GET /api/foods - Get all foods for customers to browse
router.get('/', getAllFoods);

module.exports = router;
