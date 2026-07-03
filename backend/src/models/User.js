const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Base Schema
const userSchema = new mongoose.Schema({
  user_type: {
    type: String,
    enum: ['farmer', 'delivery_partner', 'consumer', 'admin'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profile_pic: {
    type: String,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  verification_token: {
    type: String,
    select: false
  },
  verification_token_sent_at: {
    type: Date,
    select: false,
    default: null
  },
  phone_otp: {
    type: String,
    select: false,
    default: null
  },
  phone_otp_timestamp: {
    type: Date,
    select: false,
    default: null
  },
  last_login: {
    type: Date,
    default: null
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
