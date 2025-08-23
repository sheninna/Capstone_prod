const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ name: String, quantity: Number }],
  totalAmount: Number,
  name: String,
  phone: String,
  orderType: { type: String, enum: ['reservation', 'delivery', 'pickup', 'walk-in'], required: function() {
      return this.source !== 'walk-in'; 
    },
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
  enum: ['pending', 'in process', 'out for delivery', 'ready for pick-up', 'delivered'],
  default: 'pending',
}
});

module.exports = mongoose.model('Order', orderSchema);
