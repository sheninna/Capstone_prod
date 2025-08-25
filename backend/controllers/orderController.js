// controllers/orderController.js

const Order = require('../models/Order');
const Food = require('../models/Food');
const PosOrder = require('../models/posOrder');
const { sendOrderReceiptEmail, sendStatusUpdateEmail } = require('../utils/mailer');

// Place Order (Authenticated)
const placeOrder = async (req, res) => {
  const { items, name, phone, orderType, address, people, date, time, source } = req.body;
  const userId = req.user.id;  
  const email = req.user.email;

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

    // Handle order types (reservation, delivery, pickup)
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

    // Send order receipt email
    await sendOrderReceiptEmail(order, email);  

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
};

// POS Order (For Walk-in Orders)
const placePosOrder = async (req, res) => {
  const { items, name, source } = req.body;
  const userId = req.user._id;  

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
      name,
      items,
      totalAmount,
      source: source || 'walk-in',
    };

    const order = new PosOrder(newOrder);
    await order.save();

    res.status(201).json({ message: 'Walk-in order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing walk-in order', error: err.message });
  }
};

// Get Order History for a User
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('items');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Orders (Admin Dashboard, POS, etc.)
const getAllOrders = async (req, res) => {
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
};

// Update Order Status (Admin Only)
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'in process', 'out for delivery', 'delivered', 'ready for pick-up'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Valid statuses are: pending, in process, out for delivery, delivered.' });
  }

  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    const statusesToNotify = ['in process', 'out for delivery', 'delivered', 'ready for pick-up'];

    if (statusesToNotify.includes(status)) {
      await sendStatusUpdateEmail(order, order.user.email, status);
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
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
};

// Helper function to calculate total amount for an order
function calculateTotalAmount(items, foodPriceMap) {
  let total = 0;
  items.forEach(item => {
    const price = foodPriceMap[item.name];
    if (price) {
      total += price * item.quantity;
    }
  });
  return total;
}

module.exports = {
  placeOrder,
  placePosOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
