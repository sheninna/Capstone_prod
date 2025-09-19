const Food = require('../models/Food');
const upload = require('../middleware/multerConfig');
const path = require('path');

// Add food (only admin can add)
const addFood = async (req, res) => {
  const { name, category, price, portion, portions } = req.body;
  let image = null;
  if (req.file) {
    image = path.join('uploads', req.file.filename).replace(/\\/g, '/');
  }

  console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  if (!name || !category) {
    return res.status(400).json({ error: 'Missing required fields: name or category' });
  }

  try {
    let food;
    if (portions) {
      let parsedPortions;
      try {
        parsedPortions = JSON.parse(portions);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid portions format' });
      }
      if (!Array.isArray(parsedPortions) || parsedPortions.length === 0) {
        return res.status(400).json({ error: 'At least one portion is required' });
      }
      food = new Food({ name, category, portions: parsedPortions, image });
    } else {
      if (price === undefined || price === null || isNaN(Number(price))) {
        return res.status(400).json({ error: 'Missing or invalid price' });
      }
      food = new Food({ name, category, price: Number(price), portion: portion || 'N/A', image });
    }
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    console.error('Add food error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
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
