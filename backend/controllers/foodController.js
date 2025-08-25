const Food = require('../models/Food');

// Add food (only admin can add)
const addFood = async (req, res) => {
  const { name, category, price } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, category, or price' });
  }

  try {
    const food = new Food({ name, category, price });
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete food (admin only)
const deleteFood = async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: 'Food deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all foods (for customers to browse)
const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addFood,
  deleteFood,
  getAllFoods,
};
