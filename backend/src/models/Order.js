const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    unique: true,
    required: true
  },
  consumer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    required: true
  },
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  delivery_partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    default: null
  },
  accepted_at: {
    type: Date,
    default: null
  },
  accepted_by_partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    default: null
  },
  pickup_location: {
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
    }
  },
  items: [{
    _id: mongoose.Schema.Types.ObjectId,
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    product_name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: String,
    unit_price: {
      type: Number,
      required: true
    },
    total_price: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  delivery_charge: {
    type: Number,
    default: 0
  },
  distance_km: {
    type: Number,
    default: 0,
    description: 'Distance in kilometers calculated from Google Maps'
  },
  charge_breakdown: {
    base_cost: Number,
    minimum_charge_applied: Boolean,
    maximum_charge_applied: Boolean,
    final_amount: Number
  },
  estimated_delivery_time: String,
  total_price: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'wallet', 'cod'],
    required: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  delivery_address: {
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
    }
  },
  order_status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimated_delivery: Date,
  actual_delivery: Date,
  notes: String,
  tracking_history: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    }
  }],
  cancellation_reason: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
orderSchema.index({ consumer_id: 1 });
orderSchema.index({ farmer_id: 1 });
orderSchema.index({ delivery_partner_id: 1 });
orderSchema.index({ order_status: 1 });
orderSchema.index({ created_at: -1 });
orderSchema.index({ "delivery_address.location": '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
