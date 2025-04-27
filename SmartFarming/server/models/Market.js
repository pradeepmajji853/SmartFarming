const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: [true, 'Please provide crop name'],
    index: true
  },
  location: {
    type: String,
    required: [true, 'Please provide market location'],
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide price']
  },
  unit: {
    type: String,
    required: [true, 'Please provide unit of measurement'],
    enum: ['kg', 'quintal', 'ton', 'dozen', 'piece']
  },
  marketType: {
    type: String,
    enum: ['wholesale', 'retail'],
    required: true
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  demand: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  date: {
    type: Date,
    default: Date.now
  },
  trend: {
    type: String,
    enum: ['rising', 'falling', 'stable'],
    default: 'stable'
  },
  previousPrice: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Market', MarketSchema);