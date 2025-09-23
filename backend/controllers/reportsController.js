const CompletedOrder = require('../models/CompletedOrder');

// Monthly Sales
const getMonthlySales = async (req, res) => {
  const year = parseInt(req.query.year, 10);
  if (isNaN(year)) {
    return res.status(400).json({ message: 'Invalid year' });
  }
  try {
    const orders = await CompletedOrder.find({ 
      status: 'completed',
      $or: [
        { orderPlaced: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) } },
        { date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) } }
      ]
    });
    const monthlyTotals = Array(12).fill(0);
    orders.forEach(order => {
      const date = new Date(order.date || order.orderPlaced);
      const month = date.getMonth();
      monthlyTotals[month] += order.totalAmount || 0;
    });
    res.json({
      labels: [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ],
      data: monthlyTotals
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching monthly sales', error: err.message });
  }
};

// Best Selling Items
const getBestSelling = async (req, res) => {
  try {
    const month = req.query.month; // e.g. "August"
    const year = parseInt(req.query.year, 10);

    // Get month index (0-based)
    const monthIndex = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ].indexOf(month);

    if (monthIndex === -1 || isNaN(year)) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 1));

    // Filter completed orders in the selected month
    const orders = await CompletedOrder.find({
      status: 'completed',
      orderPlaced: { $gte: start, $lt: end }
    });

    // Count total sold for each food item
    const itemCounts = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!item.name) return;
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || item.quantity || 1);
      });
    });

    // Convert to array and sort by total sold, descending
    const sorted = Object.entries(itemCounts)
      .map(([name, totalSold]) => ({ name, totalSold }))
      .sort((a, b) => b.totalSold - a.totalSold);

    // Prepare response
    const labels = sorted.map(item => item.name);
    const data = sorted.map(item => item.totalSold);

    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching best selling foods', error: err.message });
  }
};

// Order Types
const getOrderTypes = async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const monthName = req.query.month;
  let start, end;

  if (monthName) {
    const monthIndex = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ].indexOf(monthName);
    if (monthIndex === -1) return res.status(400).json({ message: 'Invalid month' });
    start = new Date(Date.UTC(year, monthIndex, 1));
    end = new Date(Date.UTC(year, monthIndex + 1, 1));
  } else {
    start = new Date(Date.UTC(year, 0, 1));
    end = new Date(Date.UTC(year + 1, 0, 1));
  }

  const orders = await CompletedOrder.find({
    status: 'completed',
    orderPlaced: { $gte: start, $lt: end }
  });

  let online = 0, walkin = 0;
  orders.forEach(order => {
    const source = (order.source || '').toLowerCase();
    const orderType = (order.orderType || '').toLowerCase();
    if (source === 'online') online++;
    else if (orderType === 'walk-in') walkin++;
  });

  res.json({
    labels: ["Online", "Walk-in"],
    data: [online, walkin]
  });
};

// Orders By Month
const getOrdersByMonth = async (req, res) => {
  const year = parseInt(req.query.year, 10);
  const monthName = req.query.month; // e.g. "August"
  if (!monthName) return res.status(400).json({ message: 'Month is required' });

  const monthIndex = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ].indexOf(monthName);
  if (monthIndex === -1) return res.status(400).json({ message: 'Invalid month' });

  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));

  try {
    const orders = await CompletedOrder.find({
      status: 'completed',
      orderPlaced: { $gte: start, $lt: end }
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders by month', error: err.message });
  }
};

// Best Selling Menu Dashboard
const getBestSellingMenuDashboard = async (req, res) => {
  try {
    // Get all completed orders
    const orders = await CompletedOrder.find({ status: 'completed' });

    // Count total sold for each food item
    const itemCounts = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!item.name) return;
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || item.quantity || 1);
      });
    });

    // Convert to array and sort by total sold, descending
    const sorted = Object.entries(itemCounts)
      .map(([name, totalSold]) => ({ name, totalSold }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 6); // Top 6

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching best selling menu', error: err.message });
  }
};

module.exports = {
  getMonthlySales,
  getBestSelling,
  getOrderTypes,
  getOrdersByMonth,
  getBestSellingMenuDashboard,
};