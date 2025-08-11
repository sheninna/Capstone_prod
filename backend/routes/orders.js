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
      totalAmount: calculateTotalAmount(items),  // Calculate total based on items
      name,
      phone,
      orderType, // Store the order type (delivery, reservation, pickup)
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
      newOrder.deliveryAddress = null;  // No address for pickup
      newOrder.reservationDate = null;
      newOrder.pickupTime = time;
      newOrder.numberOfPeople = null;
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
  // Prices for each item (ensure that these are in sync with the food items in the order)
  const prices = {
    'Lomi': 75.00,
    'Sweet & Spicy': 75.00,
    'Plain': 75.00,
    'Bihon': 90.00,
    // Add more food items with their prices here
  };

  // Calculate the total amount based on the price and quantity of each item
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
