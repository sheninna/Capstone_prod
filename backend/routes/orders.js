const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Food = require('../models/Food');
const protect = require('../middleware/auth'); 
const adminOnly = require('../middleware/adminOnly');
const posAuth = require('../middleware/posAuth'); 
const PosOrder = require('../models/posOrder');
const { sendOrderReceiptEmail, sendStatusUpdateEmail } = require('../utils/mailer'); 

// Place Order Route (Authenticated)
router.post('/', protect, async (req, res) => {
  const { items, name, phone, orderType, address, people, date, time, source } = req.body;
  const userId = req.user.id;  // Get the authenticated user ID
  const email = req.user.email;  // Get the authenticated user's email from req.user

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

    const foodPriceMap = foodItems.reduce((acc, food) => {
      acc[food.name] = food.price;
      return acc;
    }, {});

    const totalAmount = calculateTotalAmount(items, foodPriceMap);

    let newOrder = {
      user: userId,
      items,
      totalAmount,
      name,
      phone,
      orderType,
      address,
      people, 
      date, 
      time,
      source: source || 'online',
    };

    // Handle different order types
    if (orderType === 'reservation') {
      newOrder.reservationDate = date;  
      newOrder.reservationTime = time;  
      newOrder.numberOfPeople = people; 
      newOrder.deliveryAddress = null;  
    } else if (orderType === 'delivery') {
      newOrder.deliveryAddress = address; 
      newOrder.reservationDate = null;    
      newOrder.reservationTime = null;    
      newOrder.numberOfPeople = null;     
    } else if (orderType === 'pickup') {
      newOrder.pickupTime = time;         
      newOrder.deliveryAddress = null;    
      newOrder.reservationDate = null;    
      newOrder.numberOfPeople = null;     
    }

    const order = new Order(newOrder);
    await order.save();

    // Send the order receipt email automatically to the authenticated user's email
    await sendOrderReceiptEmail(order, email);  // Pass the user's email from req.user

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});


// === POS Order Route (For Walk-in Orders) ===
router.post('/pos', posAuth, async (req, res) => {
  const { items, name, source } = req.body;
  const userId = req.user._id;  // The authenticated POS user (admin/employee)

  // Ensure the items are an array
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  try {
    // Fetch food items based on the names provided in the order
    const foodItems = await Food.find({ 'name': { $in: items.map(item => item.name) } });

    // Check for unavailable items
    const unavailableItems = foodItems.filter(food => !food.isAvailable);
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        error: `The following items are unavailable: ${unavailableItems.map(item => item.name).join(', ')}`
      });
    }

    // Map food prices to food names
    const foodPriceMap = foodItems.reduce((acc, food) => {
      acc[food.name] = food.price;
      return acc;
    }, {});

    // Calculate the total amount for the order
    const totalAmount = calculateTotalAmount(items, foodPriceMap);

    // Create the new order object for walk-in (POS) order
    let newOrder = {
      user: userId,  // Link the order to the authenticated POS user (admin/employee)
      name,
      items,
      totalAmount,
      source: source || 'walk-in',  // Mark the source as 'walk-in' for POS orders
    };

    // Save the order to the POS_orders collection
    const order = new PosOrder(newOrder);  // Save to POS_orders collection
    await order.save();

    // Respond with the order details
    res.status(201).json({ message: 'Walk-in order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing walk-in order', error: err.message });
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
    const posOrders = await PosOrder.find().populate('user').populate('items');  

    const allOrders = [...orders, ...posOrders];

    const ordersWithDetails = allOrders.map(order => {
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

    res.json(ordersWithDetails);  
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Update order status (admin only)
router.patch('/:orderId/status', adminOnly, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;  // 'pending', 'in process', 'out for delivery', 'delivered'

  // Valid status values
  const validStatuses = ['pending', 'in process', 'out for delivery', 'delivered', 'ready for pick-up'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Valid statuses are: pending, in process, out for delivery, delivered.' });
  }

  try {
    // Find the order by ID and populate user data
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status
    order.status = status;
    await order.save();

    // Define the statuses that should trigger an email
    const statusesToNotify = ['in process', 'out for delivery', 'delivered', 'ready for pick-up'];

    // Send an email to the customer if the status is one of the specified values
    if (statusesToNotify.includes(status)) {
      console.log('Sending email to:', order.user.email);  // Log email address for debugging
      await sendStatusUpdateEmail(order, order.user.email, status);  // Send email to customer
    }

    res.json({
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
      }
    });
  } catch (err) {
    console.error('Error updating order status:', err.message);
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
