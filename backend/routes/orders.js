const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Food = require('../models/Food');
const protect = require('../middleware/auth'); 
const adminOnly = require('../middleware/adminOnly');

// Place Order Route (Authenticated)
router.post('/', protect, async (req, res) => {
  const { items, name, phone, orderType, address, people, date, time, source } = req.body;
  const userId = req.user;  


  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }


  try {

    const foodItems = await Food.find({ 'name': { $in: items.map(item => item.name) } });

    const unavailableItems = foodItems.filter(food => !food.isAvailable);
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        error: `The following items are unavailable: ${unavailableItems.map(item => item.name).join(', ')}`
      });
    }
    // Map food names to their prices
    const foodPriceMap = foodItems.reduce((acc, food) => {
      acc[food.name] = food.price;  // Use food name as key and price as value
      return acc;
    }, {});

    // Calculate total amount based on food prices
    const totalAmount = calculateTotalAmount(items, foodPriceMap);

    let newOrder = {
      user: userId,
      items,
      totalAmount,
      name,
      phone,
      orderType,
      address, people, date, time,
      source: source || 'online',  
    };

    // Handle different order types
    if (orderType === 'reservation') {
      // Set date, time, and number of people for reservations
      newOrder.reservationDate = date;  
      newOrder.reservationTime = time;  
      newOrder.numberOfPeople = people; 
      newOrder.deliveryAddress = null;  
    } else if (orderType === 'delivery') {
      // Set delivery address for deliveries
      newOrder.deliveryAddress = address; 
      newOrder.reservationDate = null;    
      newOrder.reservationTime = null;    
      newOrder.numberOfPeople = null;     
    } else if (orderType === 'pickup') {
      // Set pickup time for pickups
      newOrder.pickupTime = time;         
      newOrder.deliveryAddress = null;    
      newOrder.reservationDate = null;    
      newOrder.numberOfPeople = null;     
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


// Update order status
router.patch('/:orderId', adminOnly, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; //'completed' or 'cancelled'

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status; 
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
});


function calculateTotalAmount(items, foodPriceMap) {
  let total = 0;

  items.forEach(item => {
    const price = foodPriceMap[item.name];
    if (price) {
      total += price * item.quantity;
    } else {
      console.log(`Price for ${item.name} not found.`);
    }
  });

  return total;
}

module.exports = router;
