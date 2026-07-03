const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  getUserProfile, 
  resetPassword, 
  updateProfile,
  sendEmailVerification,
  verifyEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  getVerificationStatus
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Email Verification Routes
router.post('/send-email-verification', sendEmailVerification);
router.post('/verify-email', verifyEmail);

// Phone Verification Routes
router.post('/send-phone-otp', sendPhoneOTP);
router.post('/verify-phone-otp', verifyPhoneOTP);

// Verification Status
router.post('/verification-status', getVerificationStatus);
router.get('/verification-status', protect, getVerificationStatus);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/profile', protect, getUserProfile);
router.put('/reset-password', protect, resetPassword);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
