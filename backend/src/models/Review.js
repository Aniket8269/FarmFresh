const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewer_type: {
    type: String,
    enum: ['consumer', 'delivery_partner', 'farmer'],
    required: true
  },
  reviewee_type: {
    type: String,
    enum: ['farmer', 'product', 'delivery_partner'],
    required: true
  },
  reviewee_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: {
    type: String,
    maxlength: 1000
  },
  verified_purchase: {
    type: Boolean,
    default: true
  },
  helpful_count: {
    type: Number,
    default: 0
  },
  unhelpful_count: {
    type: Number,
    default: 0
  },
  images: [String],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
reviewSchema.index({ order_id: 1 });
reviewSchema.index({ reviewee_id: 1 });
reviewSchema.index({ reviewee_type: 1 });
reviewSchema.index({ created_at: -1 });

module.exports = mongoose.model('Review', reviewSchema);
