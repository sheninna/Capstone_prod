const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  portions: [
    {
      portion: { type: String },
      price: { type: Number }
    }
  ],
  price: { type: Number },      // For single price (no portions)
  portion: { type: String }     // For single portion (N/A)
});

module.exports = mongoose.model('Food', foodSchema);