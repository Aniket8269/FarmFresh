const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle_type: {
    type: String,
    enum: ['bike', 'car', 'van'],
    required: true
  },
  vehicle_number: {
    type: String,
    required: true,
    unique: true
  },
  vehicle_color: String,
  license_number: {
    type: String,
    required: true,
    unique: true
  },
  license_expiry: Date,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  current_zone: String,
  availability_status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  is_available: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_deliveries: {
    type: Number,
    default: 0
  },
  successful_deliveries: {
    type: Number,
    default: 0
  },
  cancelled_deliveries: {
    type: Number,
    default: 0
  },
  total_reviews: {
    type: Number,
    default: 0
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    today: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    }
  },
  bank_account: {
    account_number: String,
    ifsc_code: String
  },
  documents: {
    driving_license: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending'
    },
    aadhar: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending'
    },
    vehicle_rc: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending'
    }
  },
  verification_status: {
    type: String,
    enum: ['verified', 'pending', 'rejected'],
    default: 'pending'
  },
  current_order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  active_hours: {
    start_time: String,
    end_time: String
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
deliveryPartnerSchema.index({ location: '2dsphere' });
deliveryPartnerSchema.index({ current_zone: 1 });
deliveryPartnerSchema.index({ availability_status: 1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
