const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expAt: { type: Date, required: true },
}, { timestamps: true });


// TTL index: when expAt passes, MongoDB auto-removes the record
revokedTokenSchema.index({ expAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RevokedToken', revokedTokenSchema);
