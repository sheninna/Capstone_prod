const BusinessSettings = require('../models/BusinessSettings');

// Get business settings
const getBusinessSettings = async (req, res) => {
  const settings = await BusinessSettings.findOne();
  res.json(settings);
};

// Update business settings
const updateBusinessSettings = async (req, res) => {
  const { openTime, closeTime, closedDays, holidays } = req.body;
  let settings = await BusinessSettings.findOne();
  if (!settings) {
    settings = new BusinessSettings({ openTime, closeTime, closedDays, holidays });
  } else {
    settings.openTime = openTime;
    settings.closeTime = closeTime;
    settings.closedDays = closedDays;
    settings.holidays = holidays;
  }
  await settings.save();
  res.json(settings);
};

module.exports = { getBusinessSettings, updateBusinessSettings };