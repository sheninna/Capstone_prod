const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    { 
      name: String, 
      quantity: Number,
      portion: String 
    }
  ],
  totalAmount: Number,
  name: String,
  phone: String,
  orderType: { 
    type: String, 
    enum: ['reservation', 'delivery', 'pickup', 'walk-in'], 
    required: function() { return this.source !== 'walk-in'; },
    default: 'walk-in',  
  },
  address: String,
  people: Number,
  date: Date,
  time: String,
  source: { type: String, default: 'online' },
  reservationDate: Date,
  reservationTime: String,
  numberOfPeople: Number,
  deliveryAddress: String,
  pickupTime: String,
  status: {
    type: String,
    enum: ['pending', 'in process', 'out for delivery', 'ready for pick-up', 'delivered', 'confirmed', 'declined'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['gcash', 'cash'],
      message: 'Payment method must be either gcash or cash'
    },
    required: true
  },
  paymentProof: {
    type: String, // Store image URL or file path
    required: function() { return this.source !== 'walk-in'; }
  },
  orderPlaced: {
    type: Date,
    default: Date.now,
    required: true
  },
  orderNumber: {
    type: Number,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model('Order', orderSchema);
