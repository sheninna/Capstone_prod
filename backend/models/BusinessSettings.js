const mongoose = require('mongoose');

const businessSettingsSchema = new mongoose.Schema({
  openTime: { type: String, required: true },   // e.g. "08:00"
  closeTime: { type: String, required: true },  // e.g. "17:00"
  closedDays: [{ type: String }],               // e.g. ["Sunday"]
  holidays: [{ type: Date }]                    // e.g. [2025-12-25]
});

module.exports = mongoose.model('BusinessSettings', businessSettingsSchema);