const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
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
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }]
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare hashed password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
