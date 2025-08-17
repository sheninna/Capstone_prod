const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const protect = require('../middleware/auth'); 
const adminOnly = require('../middleware/adminOnly');

// Place Order Route (Authenticated)
router.post('/', protect, async (req, res) => {
  const { items, name, phone, orderType, address, people, date, time, source } = req.body;
  const userId = req.user;  // User ID from the token

  try {
    let newOrder = {
      user: userId,
      items,
      totalAmount: calculateTotalAmount(items),
      name,
      phone,
      orderType,
      address, people, date, time,
      source: source || 'online',  // Default to 'online' if no source is provided
    };

    // Handle different order types
    if (orderType === 'reservation') {
      // Set date, time, and number of people for reservations
      newOrder.reservationDate = date;  // Store reservation date
      newOrder.reservationTime = time;  // Store reservation time
      newOrder.numberOfPeople = people; // Store number of people for the reservation
      newOrder.deliveryAddress = null;  // Set to null for reservations
    } else if (orderType === 'delivery') {
      // Set delivery address for deliveries
      newOrder.deliveryAddress = address; // Store delivery address
      newOrder.reservationDate = null;    // Set to null for delivery orders
      newOrder.reservationTime = null;    // Set to null for delivery orders
      newOrder.numberOfPeople = null;     // Set to null for delivery orders
    } else if (orderType === 'pickup') {
      // Set pickup time for pickups
      newOrder.pickupTime = time;         // Store pickup time
      newOrder.deliveryAddress = null;    // Set to null for pickup orders
      newOrder.reservationDate = null;    // Set to null for pickup orders
      newOrder.numberOfPeople = null;     // Set to null for pickup orders
    }

    // Save the order to the database
    const order = new Order(newOrder);
    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});

// Get order history for a user
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('items');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin dashboard, POS, etc.)
router.get('/', adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('items');

    const ordersWithDetails = orders.map(order => {
      let orderDetails = {
        ...order.toObject(),  
      };

      if (order.orderType === 'reservation') {
        orderDetails.date = order.reservationDate;
        orderDetails.time = order.reservationTime;
        orderDetails.people = order.numberOfPeople;
        orderDetails.address = null; 
      } else if (order.orderType === 'delivery') {
        orderDetails.address = order.deliveryAddress;
        orderDetails.date = null;  
        orderDetails.time = null;  
        orderDetails.people = null;  
      } else if (order.orderType === 'pickup') {
        orderDetails.time = order.pickupTime;
        orderDetails.address = null; 
        orderDetails.date = null;  
        orderDetails.people = null; 
      }
      return orderDetails;
    });

    res.json(ordersWithDetails);  // Send the formatted orders to the admin
  } catch (err) {
    res.status(500).json({ message: err.message });
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
