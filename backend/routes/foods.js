const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const adminOnly = require('../middleware/adminOnly');
const {
  addFood,
  deleteFood,
  getAllFoods,
} = require('../controllers/foodController');

// Only admin can add food
router.post('/', adminOnly, upload.single('image'), addFood);

// Only admin can delete food
router.delete('/:id', adminOnly, deleteFood);

// Get all foods for customers to browse
router.get('/', getAllFoods);

module.exports = router;
