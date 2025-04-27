const mongoose = require('mongoose');

const ProductListingSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: [true, 'Please provide the crop name']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify the quantity available']
  },
  unit: {
    type: String,
    required: [true, 'Please specify the unit of measurement'],
    enum: ['kg', 'quintal', 'ton', 'dozen', 'piece']
  },
  price: {
    type: Number,
    required: [true, 'Please provide the price per unit']
  },
  quality: {
    type: String,
    enum: ['A', 'B', 'C', 'Premium', 'Regular', 'Economy'],
    default: 'Regular'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    type: String,
    required: [true, 'Please provide the location']
  },
  harvestDate: {
    type: Date
  },
  images: [{
    type: String // URLs to product images
  }],
  status: {
    type: String,
    enum: ['active', 'sold', 'expired', 'cancelled'],
    default: 'active'
  },
  organicCertified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for listing age in days
ProductListingSchema.virtual('listingAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const differenceInTime = now - created;
  return Math.floor(differenceInTime / (1000 * 3600 * 24));
});

module.exports = mongoose.model('ProductListing', ProductListingSchema);