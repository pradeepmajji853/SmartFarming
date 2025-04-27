const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartfarming');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/pests', require('./routes/pests'));
app.use('/api/market', require('./routes/market'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/expert', require('./routes/expert'));
app.use('/api/marketplace', require('./routes/marketplace')); // Add marketplace routes

// Root route
app.get('/', (req, res) => {
  res.send('Smart Farming API is running');
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});