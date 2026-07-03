const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Consumer = require('../models/Consumer');
const DeliveryPartner = require('../models/DeliveryPartner');
const {
  generateOTP,
  generateVerificationToken,
  sendVerificationEmail,
  sendOTPEmail,
  sendOTPSMS,
  isOTPExpired,
  isTokenExpired
} = require('../utils/verificationUtils');

// Generate JWT Token
const generateToken = (id, userType) => {
  return jwt.sign({ id, user_type: userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, phone, password, name, user_type, vehicle_type, vehicle_number, license_number } = req.body;

    // Validation
    if (!email || !phone || !password || !name || !user_type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate delivery partner fields
    if (user_type === 'delivery_partner') {
      if (!vehicle_type || !vehicle_number || !license_number) {
        return res.status(400).json({
          success: false,
          message: 'Please provide vehicle type, vehicle number, and license number'
        });
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone already registered'
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      phone,
      password_hash: password,
      name,
      user_type
    });

    // Generate and send verification email
    const verificationToken = generateVerificationToken();
    user.verification_token = verificationToken;
    user.verification_token_sent_at = new Date();
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.name);

    // Create role-specific profile
    if (user_type === 'farmer') {
      await Farmer.create({
        user_id: user._id,
        farm_name: name
      });
    } else if (user_type === 'consumer') {
      await Consumer.create({
        user_id: user._id
      });
    } else if (user_type === 'delivery_partner') {
      await DeliveryPartner.create({
        user_id: user._id,
        vehicle_type,
        vehicle_number,
        license_number
      });
    }

    // Generate token
    const token = generateToken(user._id, user_type);

    // Get role-specific profile ID
    let profileData = {
      id: user._id,
      email: user.email,
      name: user.name,
      user_type: user.user_type
    };

    if (user_type === 'farmer') {
      const farmer = await Farmer.findOne({ user_id: user._id });
      if (farmer) {
        profileData.farmerId = farmer._id;
      }
    } else if (user_type === 'consumer') {
      const consumer = await Consumer.findOne({ user_id: user._id });
      if (consumer) {
        profileData.consumerId = consumer._id;
      }
    } else if (user_type === 'delivery_partner') {
      const deliveryPartner = await DeliveryPartner.findOne({ user_id: user._id });
      if (deliveryPartner) {
        profileData.deliveryPartnerId = deliveryPartner._id;
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: profileData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password_hash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.user_type);

    // Get role-specific profile ID
    let profileData = {
      id: user._id,
      email: user.email,
      name: user.name,
      user_type: user.user_type
    };

    if (user.user_type === 'farmer') {
      const farmer = await Farmer.findOne({ user_id: user._id });
      if (farmer) {
        profileData.farmerId = farmer._id;
      }
    } else if (user.user_type === 'consumer') {
      const consumer = await Consumer.findOne({ user_id: user._id });
      if (consumer) {
        profileData.consumerId = consumer._id;
      }
    } else if (user.user_type === 'delivery_partner') {
      const deliveryPartner = await DeliveryPartner.findOne({ user_id: user._id });
      if (deliveryPartner) {
        profileData.deliveryPartnerId = deliveryPartner._id;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: profileData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Current User Basic Info
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        user_type: user.user_type,
        profile_pic: user.profile_pic,
        is_active: user.is_active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Current User with Profile Details
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profileDetails = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      user_type: user.user_type,
      profile_pic: user.profile_pic,
      is_verified: user.is_verified,
      created_at: user.created_at,
      last_login: user.last_login
    };

    // Get role-specific details
    if (user.user_type === 'farmer') {
      const farmer = await Farmer.findOne({ user_id: user._id }).select('-__v');
      if (farmer) {
        profileDetails.farmerDetails = farmer;
      }
    } else if (user.user_type === 'consumer') {
      const consumer = await Consumer.findOne({ user_id: user._id }).select('-__v');
      if (consumer) {
        profileDetails.consumerDetails = consumer;
      }
    } else if (user.user_type === 'delivery_partner') {
      const deliveryPartner = await DeliveryPartner.findOne({ user_id: user._id }).select('-__v');
      if (deliveryPartner) {
        profileDetails.deliveryPartnerDetails = deliveryPartner;
      }
    }

    res.status(200).json({
      success: true,
      data: profileDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password_hash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password_hash = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, profile_pic } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user details
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profile_pic) user.profile_pic = profile_pic;
    user.updated_at = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send Email Verification
const sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    user.verification_token = verificationToken;
    user.verification_token_sent_at = new Date();
    await user.save();

    // Send verification email
    const result = await sendVerificationEmail(user.email, verificationToken, user.name);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({ verification_token: token }).select('+verification_token +verification_token_sent_at');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if token is expired (24 hours)
    if (isTokenExpired(user.verification_token_sent_at, 24)) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.'
      });
    }

    // Mark email as verified
    user.email_verified = true;
    user.verification_token = null;
    user.verification_token_sent_at = null;
    user.is_verified = true; // Mark user as verified
    user.updated_at = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send Phone OTP
const sendPhoneOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number or email'
      });
    }

    // Find user
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    user.phone_otp = otp;
    user.phone_otp_timestamp = new Date();
    await user.save();

    // Send OTP via SMS and Email
    const smsResult = await sendOTPSMS(user.phone, otp);
    const emailResult = await sendOTPEmail(user.email, otp, user.name);

    // Log OTP for development
    console.log('\n🔐 [OTP SENT] Development Mode - OTP:', otp);
    console.log('📞 Phone:', user.phone);
    console.log('📧 Email:', user.email);
    console.log('⏱️  Expires in 10 minutes\n');

    const response = {
      success: true,
      message: 'OTP sent successfully to phone and email',
      sms_sent: smsResult.success,
      email_sent: emailResult.success
    };

    // Include OTP in development mode for testing
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      response.isDevMode = true;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify Phone OTP
const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and OTP'
      });
    }

    const user = await User.findOne({ phone }).select('+phone_otp +phone_otp_timestamp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP exists
    if (!user.phone_otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP is expired (10 minutes)
    if (isOTPExpired(user.phone_otp_timestamp, 10)) {
      user.phone_otp = null;
      user.phone_otp_timestamp = null;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (user.phone_otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark phone as verified
    user.phone_verified = true;
    user.phone_otp = null;
    user.phone_otp_timestamp = null;
    user.is_verified = user.email_verified && true; // Mark as verified if email is also verified
    user.updated_at = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Verification Status
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        is_verified: user.is_verified,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
  getVerificationStatus,
  generateToken
};
