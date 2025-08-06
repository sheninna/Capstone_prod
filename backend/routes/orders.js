const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const protect = require('../middleware/auth'); 

// Place Order Route (Authenticated)
router.post('/', protect, async (req, res) => {

  const { items, name, phone, orderType, address, people, date, time } = req.body;
  const userId = req.user; 

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items array is required and should not be empty' });
  }

  try {
    let newOrder = {
      userId,
      items,
      totalAmount: calculateTotalAmount(items),  // Calculate total based on items
      name,
      phone,
    };

    // Handle Delivery Order
    if (orderType === 'delivery') {
      newOrder.deliveryAddress = address;
      newOrder.reservationDate = null;
      newOrder.reservationTime = null;
      newOrder.numberOfPeople = null;
    } 
    // Handle Reservation Order
    else if (orderType === 'reservation') {
      newOrder.reservationDate = date;
      newOrder.reservationTime = time;
      newOrder.numberOfPeople = people;
      newOrder.deliveryAddress = null;
    }

    // Save the new order to the database
    const order = new Order(newOrder);
    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});

// Helper function to calculate the total amount
function calculateTotalAmount(items) {
  const prices = { 'Lomi': 75.00, 'Bihon': 90.00 };
  return items.reduce((total, item) => total + prices[item], 0);
}

module.exports = router;
