const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  topic: {
    type: String,
    required: true,
    enum: ['crop', 'pest', 'soil', 'irrigation', 'market', 'technology', 'other']
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String // URLs to images
  }],
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved'],
    default: 'pending'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      type: String // URLs to attachments
    }]
  }],
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Consultation', ConsultationSchema);