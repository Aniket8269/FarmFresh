const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  farmer_pickup_location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    },
    address: {
      type: String,
      required: false
    },
    city: String,
    state: String,
    zipcode: String,
    country: {
      type: String,
      default: 'India'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs', 'Other']
  },
  subcategory: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'liter', 'piece', 'dozen', 'bundle'],
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  weight_unit: {
    type: String,
    enum: ['kg', 'g', 'liter', 'ml'],
    default: 'kg'
  },
  quality: {
    type: String,
    enum: ['premium', 'standard', 'economy'],
    default: 'standard'
  },
  specifications: {
    type: String,
    default: ''
  },
  quantity_available: {
    type: Number,
    required: true,
    min: 0
  },
  quantity_sold: {
    type: Number,
    default: 0
  },
  min_order_quantity: {
    type: Number,
    default: 1
  },
  max_order_quantity: {
    type: Number,
    default: 100
  },
  image_url: {
    type: String,
    required: true
  },
  images: [String],
  is_organic: {
    type: Boolean,
    default: false
  },
  is_seasonal: {
    type: Boolean,
    default: false
  },
  harvest_date: Date,
  expiry_date: Date,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_reviews: {
    type: Number,
    default: 0
  },
  total_orders: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  tags: [String],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Create search index
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ farmer_id: 1 });
productSchema.index({ category: 1 });
productSchema.index({ is_active: 1 });
productSchema.index({ 'farmer_pickup_location': '2dsphere' }); // Geospatial index for location queries

module.exports = mongoose.model('Product', productSchema);
