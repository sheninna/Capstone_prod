const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String },
  reservationDate: { type: String },
  reservationTime: { type: String },
  numberOfPeople: { type: Number },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
