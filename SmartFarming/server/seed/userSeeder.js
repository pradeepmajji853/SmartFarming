const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Sample user data for seeding
const users = [
  {
    name: 'Farmer John',
    email: 'farmer@example.com',
    password: 'password123',
    role: 'farmer',
    farmDetails: {
      location: 'Delhi Region',
      size: 25,
      crops: ['Wheat', 'Rice', 'Potatoes']
    }
  },
  {
    name: 'Expert Singh',
    email: 'expert@example.com',
    password: 'password123',
    role: 'expert',
    specialization: 'Crop Disease Management'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Farmer Lakshmi',
    email: 'lakshmi@example.com',
    password: 'password123',
    role: 'farmer',
    farmDetails: {
      location: 'Mumbai Region',
      size: 15,
      crops: ['Cotton', 'Tomatoes']
    }
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartfarming')
  .then(() => console.log('MongoDB connected for seeding users...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seed function
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('All existing users deleted');

    // Hash passwords and create users
    const usersPromises = users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    });
    
    const usersToSeed = await Promise.all(usersPromises);
    
    // Insert new data
    const seededUsers = await User.insertMany(usersToSeed);
    console.log(`${seededUsers.length} users seeded successfully`);
    
    // Print credentials for easy reference
    console.log('\nTest User Credentials:');
    users.forEach(user => {
      console.log(`- ${user.role}: ${user.email} / ${user.password}`);
    });

    console.log('\nUser seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run seeder
seedUsers();