const mongoose = require('mongoose');

const consumerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addresses: [{
    _id: mongoose.Schema.Types.ObjectId,
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home'
    },
    street: String,
    city: String,
    state: String,
    pincode: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    is_default: {
      type: Boolean,
      default: false
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  saved_farmers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  }],
  favorite_products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  total_orders: {
    type: Number,
    default: 0
  },
  total_spent: {
    type: Number,
    default: 0
  },
  avg_rating_given: {
    type: Number,
    default: 0
  },
  preferences: {
    notifications_enabled: {
      type: Boolean,
      default: true
    },
    delivery_time_preference: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'afternoon'
    },
    dietary_preferences: [String]
  },
  cart: {
    items: [{
      product_id: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      added_at: Date
    }],
    last_updated: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

consumerSchema.index({ city: 1 });

module.exports = mongoose.model('Consumer', consumerSchema);
