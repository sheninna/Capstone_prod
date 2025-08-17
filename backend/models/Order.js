const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      quantity: Number
    }
  ],
  name: String,
  phone: String,
  orderType: { type: String, enum: ['delivery', 'pickup', 'reservation'] },
  address: String,
  people: Number,
  date: Date,
  time: String,
  source: { type: String, enum: ['online', 'pos'], default: 'online' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
