const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [itemSchema],
  totalAmount: { type: Number, required: true },
  orderType: { type: String, enum: ['delivery', 'pickup', 'reservation'], required: true },
  deliveryAddress: { type: String },
  reservationDate: { type: String },
  reservationTime: { type: String },
  pickupTime: { type: String },
  numberOfPeople: { type: Number },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
