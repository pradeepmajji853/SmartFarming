const mongoose = require('mongoose');

const PurchaseOfferSchema = new mongoose.Schema({
  productListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductListing',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offerPrice: {
    type: Number,
    required: [true, 'Please provide an offer price']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify the quantity you want to buy']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [300, 'Message cannot be more than 300 characters']
  },
  contactDetails: {
    phone: {
      type: String
    },
    email: {
      type: String
    },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'in-app'],
      default: 'in-app'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseOffer', PurchaseOfferSchema);