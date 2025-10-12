const BusinessSettings = require('../models/BusinessSettings');

async function checkBusinessOpen(req, res, next) {
  const settings = await BusinessSettings.findOne();
  if (!settings) return res.status(503).json({ message: "Business hours not set." });

  const now = new Date();
  const day = now.toLocaleString('en-US', { weekday: 'long' }); // e.g. "Sunday"
  const time = now.toTimeString().slice(0,5); // "HH:MM"

  // Check if today is a closed day
  if (settings.closedDays.includes(day)) {
    return res.status(403).json({ message: "Business is closed today." });
  }

  // Check if today is a holiday
  if (settings.holidays.some(date => new Date(date).toDateString() === now.toDateString())) {
    return res.status(403).json({ message: "Business is closed for a holiday." });
  }

  // Check if current time is within open hours
  if (time < settings.openTime || time > settings.closeTime) {
    return res.status(403).json({ message: "Business is currently closed." });
  }

  next();
}

module.exports = checkBusinessOpen;