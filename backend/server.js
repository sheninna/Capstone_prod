const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const foodRoutes = require('./routes/foods');
const adminAuthRoutes = require('./routes/adminAcces');
const authRoutes = require('./routes/auth'); 
const orderRoutes = require('./routes/orders'); 
const posAuthRoutes = require('./routes/posAuth');
const feedbackRoutes = require('./routes/feedback');
const notificationRoutes = require('./routes/notifications');
const otpRoutes = require('./routes/otp');
const businessInfoRoutes = require('./routes/businessInfo');
const protect = require('./middleware/auth');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());  
app.use('/uploads', express.static('uploads'));


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/otp', otpRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/foods', foodRoutes); 
app.use('/api/admin', adminAuthRoutes);
app.use('/api/pos', posAuthRoutes);
app.use('/api', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/protected-endpoint', protect);
app.use('/api/business-info', businessInfoRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
