const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const protect = require('../middleware/auth'); 

// Place Order Route (Authenticated)
router.post('/', protect, async (req, res) => {

  const { items, name, phone, orderType, address, people, date, time } = req.body;
  const userId = req.user; 

   try {
    let newOrder = {
      userId,
      items,
      totalAmount: calculateTotalAmount(items),  
      name,
      phone,
      orderType, 
    };

    // Handle different order types
    if (orderType === 'delivery') {
      newOrder.deliveryAddress = address;
      newOrder.reservationDate = null;
      newOrder.reservationTime = null;
      newOrder.numberOfPeople = null;
    } else if (orderType === 'reservation') {
      newOrder.reservationDate = date;
      newOrder.reservationTime = time;
      newOrder.numberOfPeople = people;
      newOrder.deliveryAddress = null;
    } else if (orderType === 'pickup') {
      newOrder.deliveryAddress = null;  
      newOrder.reservationDate = null;
      newOrder.pickupTime = time;
      newOrder.numberOfPeople = null;
    }

    // Save to database
    const order = new Order(newOrder);
    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});


function calculateTotalAmount(items) {
  const prices = {
    'Lomi': 75.00,
    'Sweet & Spicy': 75.00,
    'Plain': 75.00,
    'Bihon': 90.00,
  };
  let total = 0;
  
  items.forEach(item => {
    if (prices[item.name]) {
      total += prices[item.name] * item.quantity;
    } else {
      console.log(`Price for ${item.name} not found.`);
    }
  });

  return total;
}

module.exports = router;
