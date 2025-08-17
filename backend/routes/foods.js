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

// Delete food (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: 'Food deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit food (admin only)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
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