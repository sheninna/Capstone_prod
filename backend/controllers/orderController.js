const Order = require('../models/Order');
const Food = require('../models/Food');
const PosOrder = require('../models/posOrder');
const Notification = require('../models/notification');
const CompletedOrder = require('../models/CompletedOrder');
const { sendOrderReceiptEmail, sendStatusUpdateEmail } = require('../utils/mailer');

// Place Order (Authenticated)
const placeOrder = async (req, res) => {
  const { items, name, phone, orderType, address, people, date, time, source, paymentMethod, paymentProof } = req.body;
  const userId = req.user.id;  
  const email = req.user.email;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  // Require payment method and payment proof for online orders
  if (!paymentMethod || paymentMethod !== 'gcash') {
    return res.status(400).json({ error: 'Online orders require GCash as payment method.' });
  }
  if (!paymentProof) {
    return res.status(400).json({ error: 'Payment proof is required for online orders.' });
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

    // Generate unique 5-digit orderNumber FIRST
    let orderNumber;
    let isUnique = false;
    while (!isUnique) {
      orderNumber = Math.floor(10000 + Math.random() * 90000);
      const existingOrder = await Order.findOne({ orderNumber });
      const existingPosOrder = await PosOrder.findOne({ orderNumber });
      if (!existingOrder && !existingPosOrder) isUnique = true;
    }

    // Now create the newOrder object
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
      paymentMethod,
      paymentProof,
      orderPlaced: new Date(),
      orderNumber // <-- Add here
    };

    const order = new Order(newOrder);
    await order.save();

    // Send order receipt email
    await sendOrderReceiptEmail(order, email);

    // Create notification for user
    await Notification.create({
      userId: userId,
      message: `Your order has been placed successfully. Order ID: ${order._id}`,
      type: 'success',
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
};



// POS Order (For Walk-in Orders)
const placePosOrder = async (req, res) => {
  const { items, name, source, paymentMethod, paymentProof } = req.body;
  const userId = req.user._id;  

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  // Require payment method for walk-in orders
  if (!paymentMethod || (paymentMethod !== 'cash' && paymentMethod !== 'gcash')) {
    return res.status(400).json({ error: 'Walk-in orders require payment method: cash or gcash.' });
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

    // Generate unique 5-digit orderNumber
    let orderNumber;
    let isUnique = false;
    while (!isUnique) {
      orderNumber = Math.floor(10000 + Math.random() * 90000);
      const existingOrder = await Order.findOne({ orderNumber });
      const existingPosOrder = await PosOrder.findOne({ orderNumber });
      if (!existingOrder && !existingPosOrder) isUnique = true;
    }

    let newOrder = {
      user: userId,
      name,
      items,
      totalAmount,
      source: source || 'walk-in',
      paymentMethod,
      orderPlaced: new Date(),
    };

    newOrder.orderNumber = orderNumber;

    // Attach payment proof if provided (optional for walk-in)
    if (paymentProof) {
      newOrder.paymentProof = paymentProof;
    }

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
        // Do NOT overwrite address, keep original
      } else if (order.orderType === 'delivery') {
        orderDetails.address = order.address || order.deliveryAddress || null;
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


// Get All Completed Orders (from CompletedOrder collection)
const getCompletedOrders = async (req, res) => {
  try {
    const completedOrders = await CompletedOrder.find({ status: 'completed' });
    res.json(completedOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching completed orders', error: err.message });
  }
};



// Update Order Status (Admin Only)
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = [
    'pending',
    'in process',
    'on delivery',
    'ready for pick-up',
    'completed'
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Valid statuses are: pending, in process, on delivery, ready for pick-up, completed.' });
  }

  try {
    // Try to find in Order collection first
    let order = await Order.findById(orderId).populate('user');
    let isPosOrder = false;

    // If not found, try in PosOrder collection
    if (!order) {
      order = await PosOrder.findById(orderId).populate('user');
      isPosOrder = true;
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // If status is completed, archive to CompletedOrder collection and remove from original collection
    if (status === 'completed') {
      await CompletedOrder.create({
        originalOrderId: order._id,
        user: order.user,
        items: order.items,
        totalAmount: order.totalAmount,
        name: order.name,
        phone: order.phone,
        orderType: order.orderType,
        address: order.address,
        people: order.people,
        date: order.date,
        time: order.time,
        source: order.source,
        paymentMethod: order.paymentMethod,
        paymentProof: order.paymentProof,
        orderPlaced: order.orderPlaced,
        orderNumber: order.orderNumber,
        status: order.status
      });

      // Remove from original collection
      if (isPosOrder) {
        await PosOrder.findByIdAndDelete(order._id);
      } else {
        await Order.findByIdAndDelete(order._id);
      }
    }

    const statusesToNotify = [
      'in process',
      'on delivery',
      'delivered',
      'ready for pick-up',
      'declined'
    ];

    // Only send email if order has a user with an email
    if (statusesToNotify.includes(status) && order.user && order.user.email) {
      await sendStatusUpdateEmail(order, order.user.email, status);

      if (status === 'declined') {
        await Notification.create({
          userId: order.user._id,
          message: `Your order ${order._id} has been declined. Please contact support if you have questions.`,
          type: 'error',
          read: false,
          createdAt: new Date()
        });
      }
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
  getCompletedOrders,
  updateOrderStatus,
};
