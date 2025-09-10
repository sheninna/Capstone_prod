const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  googleId: { 
    type: String,
    required: false, 
  }, 
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
   phoneNumber: {
    type: String,
    default: null,  // phone number can be updated later
  },
  profilePicUrl: {
    type: String,
    default: null,  // profile pic can be updated later
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpires: {
    type: Date,
    default: null,
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
