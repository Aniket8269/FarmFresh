const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = require('./src/models/User');

// Test User Verification Status
async function testVerificationStatus() {
  try {
    console.log('🔍 Verification Status Test Tool\n');
    console.log('📊 User Verification Statistics:');

    // Get total users
    const totalUsers = await User.countDocuments();
    console.log(`  Total Users: ${totalUsers}`);

    // Email verified count
    const emailVerified = await User.countDocuments({ email_verified: true });
    console.log(`  Email Verified: ${emailVerified}/${totalUsers}`);

    // Phone verified count
    const phoneVerified = await User.countDocuments({ phone_verified: true });
    console.log(`  Phone Verified: ${phoneVerified}/${totalUsers}`);

    // Both verified (fully verified)
    const fullyVerified = await User.countDocuments({ 
      email_verified: true, 
      phone_verified: true 
    });
    console.log(`  Fully Verified: ${fullyVerified}/${totalUsers}`);

    // Pending verification
    const pending = await User.countDocuments({
      $or: [
        { email_verified: false },
        { phone_verified: false }
      ]
    });
    console.log(`  Pending Verification: ${pending}/${totalUsers}\n`);

    // List recent users with their verification status
    console.log('📋 Recent User Verification Status:');
    const recentUsers = await User.find()
      .select('email phone email_verified phone_verified created_at')
      .sort({ created_at: -1 })
      .limit(5);

    recentUsers.forEach((user, index) => {
      console.log(`\n  ${index + 1}. ${user.email}`);
      console.log(`     Phone: ${user.phone}`);
      console.log(`     Email Verified: ${user.email_verified ? '✅' : '❌'}`);
      console.log(`     Phone Verified: ${user.phone_verified ? '✅' : '❌'}`);
      console.log(`     Created: ${user.created_at.toLocaleDateString()}`);
    });

    // Users with pending verification
    console.log('\n\n📌 Users Requiring Verification:');
    const pendingUsers = await User.find({
      $or: [
        { email_verified: false },
        { phone_verified: false }
      ]
    })
      .select('email phone email_verified phone_verified')
      .limit(5);

    if (pendingUsers.length === 0) {
      console.log('  All users have completed verification! ✨');
    } else {
      pendingUsers.forEach((user, index) => {
        console.log(`\n  ${index + 1}. ${user.email}`);
        if (!user.email_verified) {
          console.log(`     ⚠️  Email verification pending`);
        }
        if (!user.phone_verified) {
          console.log(`     ⚠️  Phone verification pending`);
        }
      });
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run test
testVerificationStatus();
