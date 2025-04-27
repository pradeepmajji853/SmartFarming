const mongoose = require('mongoose');

const FarmDataSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  fieldSize: {
    type: Number, // in acres/hectares
    required: true
  },
  unit: {
    type: String,
    enum: ['acre', 'hectare'],
    default: 'acre'
  },
  plantingDate: {
    type: Date,
    required: true
  },
  harvestDate: {
    type: Date
  },
  expectedYield: {
    type: Number
  },
  actualYield: {
    type: Number
  },
  expenses: [{
    category: {
      type: String,
      enum: ['seeds', 'fertilizer', 'pesticide', 'irrigation', 'labor', 'machinery', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  revenue: {
    amount: Number,
    pricePerUnit: Number,
    date: Date
  },
  waterUsage: [{
    date: Date,
    amount: Number // in liters or other unit
  }],
  soilData: [{
    date: {
      type: Date,
      default: Date.now
    },
    pH: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    moisture: Number
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FarmData', FarmDataSchema);