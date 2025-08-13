const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }
});

module.exports = mongoose.model('Food', FoodSchema);