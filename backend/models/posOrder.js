const mongoose = require('mongoose');
const OrderSchema = require('./Order').schema;  

const PosOrder = mongoose.model('PosOrder', OrderSchema, 'POS_orders'); 

module.exports = PosOrder;
