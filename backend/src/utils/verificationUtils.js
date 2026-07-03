const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send Verification Email
const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - FreshFarm',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to FreshFarm!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with FreshFarm. Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p>Or copy this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          
          <p>This link expires in 24 hours.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, message: error.message };
  }
};

// Send OTP via Email
const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for FreshFarm - Mobile Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Mobile Verification</h2>
          <p>Hi ${name},</p>
          <p>Your One-Time Password (OTP) for mobile verification is:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <h1 style="letter-spacing: 10px; color: #4CAF50; font-size: 32px;">${otp}</h1>
          </div>
          
          <p>This OTP is valid for 10 minutes.</p>
          <p style="color: #d9534f; font-weight: bold;">Do not share this OTP with anyone.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, message: error.message };
  }
};

// Send SMS OTP (using Twilio)
const sendOTPSMS = async (phone, otp) => {
  try {
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 SMS OTP (Development Mode - Not Configured)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Phone: ${phone}`);
      console.log(`OTP: ${otp}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'); // Log for development
      return { success: true, message: 'OTP sent successfully (SMS not configured, check logs)' };
    }

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: `Your FreshFarm OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    // If Twilio module not installed, log and continue
    if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 SMS OTP (Fallback - Twilio Not Installed)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Phone: ${phone}`);
      console.log(`OTP: ${otp}`);
      console.log('ℹ️  Install Twilio: npm install twilio');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return { success: true, message: 'OTP sent successfully (SMS module not available, check logs)' };
    }
    
    console.error('Error sending OTP SMS:', error);
    return { success: false, message: error.message };
  }
};

// Verify OTP Expiry
const isOTPExpired = (otpTimestamp, expiryMinutes = 10) => {
  if (!otpTimestamp) return true;
  
  const currentTime = new Date();
  const otpTime = new Date(otpTimestamp);
  const diffMinutes = (currentTime - otpTime) / (1000 * 60);
  
  return diffMinutes > expiryMinutes;
};

// Verify Token Expiry
const isTokenExpired = (tokenTimestamp, expiryHours = 24) => {
  if (!tokenTimestamp) return true;
  
  const currentTime = new Date();
  const tokenTime = new Date(tokenTimestamp);
  const diffHours = (currentTime - tokenTime) / (1000 * 60 * 60);
  
  return diffHours > expiryHours;
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  sendVerificationEmail,
  sendOTPEmail,
  sendOTPSMS,
  isOTPExpired,
  isTokenExpired
};
