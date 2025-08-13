const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const adminOnly = require('../middleware/adminOnly');

// POST /api/foods - Only admin can add food
router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const food = new Food({ name, category });
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;