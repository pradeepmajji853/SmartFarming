const mongoose = require('mongoose');
require('dotenv').config();
const Crop = require('../models/Crop');

// Sample crop data for seeding
const crops = [
  {
    name: 'Wheat',
    season: 'winter',
    soilType: ['loamy', 'clayey'],
    waterRequirement: 'medium',
    growthDuration: 120,
    idealTemperature: {
      min: 15,
      max: 25
    },
    description: 'Wheat is a grass widely cultivated for its seed, a cereal grain which is a worldwide staple food. The many species of wheat together make up the genus Triticum.',
    cultivationTips: 'Plant wheat in winter. Apply fertilizer at the time of sowing and again at tillering stage. Keep the field weed-free.',
    image: 'https://source.unsplash.com/featured/?wheat'
  },
  {
    name: 'Rice',
    season: 'rainy',
    soilType: ['clayey'],
    waterRequirement: 'high',
    growthDuration: 120,
    idealTemperature: {
      min: 20,
      max: 35
    },
    description: 'Rice is the seed of the grass species Oryza sativa or Oryza glaberrima. As a cereal grain, it is the most widely consumed staple food for a large part of the world's human population.',
    cultivationTips: 'Rice requires standing water for optimal growth. Transplant seedlings at 20-25 days old. Maintain water level of 5-7 cm.',
    image: 'https://source.unsplash.com/featured/?rice'
  },
  {
    name: 'Cotton',
    season: 'summer',
    soilType: ['black', 'alluvial'],
    waterRequirement: 'medium',
    growthDuration: 180,
    idealTemperature: {
      min: 20,
      max: 35
    },
    description: 'Cotton is a soft, fluffy staple fiber that grows in a boll around the seeds of the cotton plants, which are native to tropical and subtropical regions around the world, including the Americas, Africa, and India.',
    cultivationTips: 'Plant cotton in rows, thin plants when they have two true leaves. Control weeds and monitor for bollworms and other pests regularly.',
    image: 'https://source.unsplash.com/featured/?cotton'
  },
  {
    name: 'Tomato',
    season: 'all',
    soilType: ['loamy', 'sandy loam'],
    waterRequirement: 'medium',
    growthDuration: 90,
    idealTemperature: {
      min: 18,
      max: 29
    },
    description: 'The tomato is the edible berry of the plant Solanum lycopersicum, commonly known as a tomato plant. It is widely grown and consumed around the world.',
    cultivationTips: 'Stake plants for support. Prune suckers for indeterminate varieties. Water regularly at the base to avoid leaf diseases.',
    image: 'https://source.unsplash.com/featured/?tomato'
  },
  {
    name: 'Potatoes',
    season: 'winter',
    soilType: ['loamy', 'sandy'],
    waterRequirement: 'medium',
    growthDuration: 100,
    idealTemperature: {
      min: 15,
      max: 25
    },
    description: 'The potato is a root vegetable native to the Americas that is a starchy tuber of the plant Solanum tuberosum, a perennial in the family Solanaceae.',
    cultivationTips: 'Plant seed potatoes 12cm deep and 30cm apart. Hill the soil around the stems as they grow. Keep soil consistently moist.',
    image: 'https://source.unsplash.com/featured/?potato'
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartfarming')
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seed function
const seedCrops = async () => {
  try {
    // Clear existing data
    await Crop.deleteMany({});
    console.log('All existing crops deleted');

    // Insert new data
    const seededCrops = await Crop.insertMany(crops);
    console.log(`${seededCrops.length} crops seeded successfully`);

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedCrops();