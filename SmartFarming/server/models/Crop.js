const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  season: {
    type: String,
    required: true,
    enum: ['summer', 'winter', 'rainy', 'all']
  },
  soilType: {
    type: [String],
    required: true
  },
  waterRequirement: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  growthDuration: {
    type: Number, // in days
    required: true
  },
  idealTemperature: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  commonPests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pest'
  }],
  description: {
    type: String
  },
  cultivationTips: {
    type: String
  },
  image: {
    type: String // URL to crop image
  }
});

module.exports = mongoose.model('Crop', CropSchema);