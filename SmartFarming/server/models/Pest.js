const mongoose = require('mongoose');

const PestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  affectedCrops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }],
  symptoms: {
    type: String,
    required: true
  },
  preventiveMeasures: {
    type: [String]
  },
  controlMethods: {
    organic: [String],
    chemical: [String]
  },
  seasonalPrevalence: {
    type: [String],
    enum: ['summer', 'winter', 'rainy', 'all']
  },
  image: {
    type: String // URL to pest image
  },
  description: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Pest', PestSchema);