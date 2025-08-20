const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const foodRoutes = require('./routes/foods');
const adminAuthRoutes = require('./routes/adminAcces');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());  

const authRoutes = require('./routes/auth'); // Authentication route
const orderRoutes = require('./routes/orders'); 


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/foods', foodRoutes); 
app.use('/api/admin', adminAuthRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
