const mongoose = require('mongoose');

const businessInfoSchema = new mongoose.Schema({
  contact: String,
  email: String,
  address: String,
  website: String,
  gcashName: String,
  gcashQR: String // Store image URL or file path
});

module.exports = mongoose.model('BusinessInfo', businessInfoSchema);