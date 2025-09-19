const mongoose = require('mongoose');

const completedOrderSchema = new mongoose.Schema({
  originalOrderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [],
  totalAmount: Number,
  name: String,
  phone: String,
  orderType: String,
  address: String,
  people: Number,
  date: Date,
  time: String,
  source: String,
  paymentMethod: String,
  paymentProof: String,
  orderPlaced: Date,
  orderNumber: Number,
  status: String,
  archivedAt: { type: Date, default: Date.now }
}, { collection: 'completedorders' }); // <-- THIS LINE IS CRUCIAL

module.exports = mongoose.model('CompletedOrder', completedOrderSchema);