const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const adminOnly = require('../middleware/adminOnly');

// POST /api/foods - Only admin can add food
router.post('/', adminOnly, async (req, res) => {
  const { name, category, price } = req.body; // Get price from the request body

  // Validation for required fields
  if (!name || !category || price === undefined) { // Check for price as well
    return res.status(400).json({ error: 'Missing required fields: name, category, or price' });
  }

  try {
    const food = new Food({ name, category, price }); // Include price in food object
    await food.save();
    res.status(201).json(food); // Return the created food item
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete food (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: 'Food deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all foods (for customers to browse)
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;