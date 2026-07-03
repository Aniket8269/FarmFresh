const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function testLogin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshfarm', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected\n');

    // Find the admin user
    console.log('🔍 Finding admin user...');
    const admin = await User.findOne({ email: 'admin@freshfarm.com' }).select('+password_hash');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin found:', {
      email: admin.email,
      name: admin.name,
      user_type: admin.user_type,
      hashedPassword: admin.password_hash.substring(0, 20) + '...'
    });

    // Test password comparison
    console.log('\n🧪 Testing password with plain text: "Admin@123"');
    const isMatch1 = await admin.comparePassword('Admin@123');
    console.log('Result:', isMatch1 ? '✅ MATCH' : '❌ NO MATCH');

    // Test with different cases
    console.log('\n🧪 Testing password with "admin@123"');
    const isMatch2 = await admin.comparePassword('admin@123');
    console.log('Result:', isMatch2 ? '✅ MATCH' : '❌ NO MATCH');

    // Check if password schema is configured correctly
    console.log('\n📋 Password Schema Check:');
    console.log('Password hash length:', admin.password_hash.length);
    console.log('Is bcrypt hash format:', admin.password_hash.startsWith('$2a$') || admin.password_hash.startsWith('$2b$'));

    if (isMatch1) {
      console.log('\n✅ PASSWORD VERIFICATION IS WORKING');
      console.log('Admin can login with:');
      console.log('Email: admin@freshfarm.com');
      console.log('Password: Admin@123');
    } else {
      console.log('\n❌ PASSWORD VERIFICATION FAILED');
      console.log('There might be an issue with bcrypt hashing');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testLogin();
