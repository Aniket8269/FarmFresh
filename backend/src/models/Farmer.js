const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farm_name: {
    type: String,
    required: true,
    trim: true
  },
  farm_size: {
    type: Number,
    unit: 'acres',
    default: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      default: [78.9, 20.5] // Default center of India
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  avg_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_orders: {
    type: Number,
    default: 0
  },
  total_revenue: {
    type: Number,
    default: 0
  },
  bank_account: {
    account_number: String,
    ifsc_code: String,
    account_holder: String,
    bank_name: String
  },
  documents: {
    aadhar: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending'
    },
    pan: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending'
    },
    farm_license: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending'
    }
  },
  delivery_zones: [{
    radius_km: Number,
    city: String
  }],
  verification_status: {
    type: String,
    enum: ['verified', 'pending', 'rejected'],
    default: 'pending'
  },
  verification_date: Date,
  is_active: {
    type: Boolean,
    default: true
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

// Create geospatial index
farmerSchema.index({ location: '2dsphere' });
farmerSchema.index({ city: 1 });
farmerSchema.index({ verification_status: 1 });

module.exports = mongoose.model('Farmer', farmerSchema);
