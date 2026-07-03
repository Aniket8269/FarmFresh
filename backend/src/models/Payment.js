const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  consumer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  payment_method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'wallet', 'cod'],
    required: true
  },
  payment_gateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'manual'],
    default: 'stripe'
  },
  transaction_id: {
    type: String,
    unique: true,
    sparse: true
  },
  gateway_response: {
    id: String,
    status: String,
    error: String
  },
  card_details: {
    last4: String,
    brand: String,
    exp_month: Number,
    exp_year: Number
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  refund_amount: {
    type: Number,
    default: 0
  },
  refund_date: Date,
  refund_reason: String,
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
paymentSchema.index({ order_id: 1 });
paymentSchema.index({ consumer_id: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ created_at: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
