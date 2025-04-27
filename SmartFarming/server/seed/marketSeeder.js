const mongoose = require('mongoose');
require('dotenv').config();
const Market = require('../models/Market');

// Sample market price data for seeding
const marketPrices = [
  // Wheat prices
  {
    cropName: 'Wheat',
    location: 'Delhi',
    price: 2200,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'high'
  },
  {
    cropName: 'Wheat',
    location: 'Mumbai',
    price: 2350,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'medium'
  },
  {
    cropName: 'Wheat',
    location: 'Hyderabad',
    price: 2150,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'medium'
  },
  {
    cropName: 'Wheat',
    location: 'Delhi',
    price: 28,
    unit: 'kg',
    marketType: 'retail',
    quality: 'medium',
    demand: 'high'
  },
  {
    cropName: 'Wheat',
    location: 'Hyderabad',
    price: 26,
    unit: 'kg',
    marketType: 'retail',
    quality: 'medium',
    demand: 'high'
  },
  
  // Rice prices
  {
    cropName: 'Rice',
    location: 'Delhi',
    price: 3200,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'high'
  },
  {
    cropName: 'Rice',
    location: 'Mumbai',
    price: 3300,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'high'
  },
  {
    cropName: 'Rice',
    location: 'Hyderabad',
    price: 3100,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'medium'
  },
  {
    cropName: 'Rice',
    location: 'Delhi',
    price: 45,
    unit: 'kg',
    marketType: 'retail',
    quality: 'high',
    demand: 'high'
  },
  {
    cropName: 'Rice',
    location: 'Hyderabad',
    price: 42,
    unit: 'kg',
    marketType: 'retail',
    quality: 'medium',
    demand: 'high'
  },
  
  // Potato prices
  {
    cropName: 'Potatoes',
    location: 'Delhi',
    price: 1200,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'medium'
  },
  {
    cropName: 'Potatoes',
    location: 'Mumbai',
    price: 1350,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'medium'
  },
  {
    cropName: 'Potatoes',
    location: 'Hyderabad',
    price: 1150,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'low'
  },
  {
    cropName: 'Potatoes',
    location: 'Delhi',
    price: 18,
    unit: 'kg',
    marketType: 'retail',
    quality: 'medium',
    demand: 'medium'
  },
  {
    cropName: 'Potatoes',
    location: 'Hyderabad',
    price: 16,
    unit: 'kg',
    marketType: 'retail',
    quality: 'medium',
    demand: 'medium'
  },
  
  // Tomato prices
  {
    cropName: 'Tomato',
    location: 'Delhi',
    price: 1500,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'high'
  },
  {
    cropName: 'Tomato',
    location: 'Mumbai',
    price: 1650,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'high',
    demand: 'high'
  },
  {
    cropName: 'Tomato',
    location: 'Hyderabad',
    price: 1450,
    unit: 'quintal',
    marketType: 'wholesale',
    quality: 'medium',
    demand: 'medium'
  },
  {
    cropName: 'Tomato',
    location: 'Delhi',
    price: 25,
    unit: 'kg',
    marketType: 'retail',
    quality: 'medium',
    demand: 'high'
  },
  {
    cropName: 'Tomato',
    location: 'Hyderabad',
    price: 22,
    unit: 'kg',
    marketType: 'retail',
    quality: 'medium',
    demand: 'high'
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartfarming')
  .then(() => console.log('MongoDB connected for seeding market data...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seed function
const seedMarketData = async () => {
  try {
    // Clear existing data
    await Market.deleteMany({});
    console.log('All existing market price data deleted');

    // Insert new data
    const seededMarkets = await Market.insertMany(marketPrices);
    console.log(`${seededMarkets.length} market price entries seeded successfully`);

    console.log('Market data seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding market data:', error);
    process.exit(1);
  }
};

// Run seeder
seedMarketData();