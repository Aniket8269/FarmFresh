const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function createAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB with timeout
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshfarm', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected');

    console.log('🔍 Checking for existing admin...');
    // Delete existing admin if exists
    const existingAdmin = await User.findOne({ email: 'admin@freshfarm.com' });
    if (existingAdmin) {
      console.log('🗑️ Deleting existing admin...');
      await User.deleteOne({ email: 'admin@freshfarm.com' });
      console.log('✅ Existing admin deleted\n');
    }

    console.log('👤 Creating new admin user...');
    // Create fresh admin user
    const admin = new User({
      email: 'admin@freshfarm.com',
      phone: '9999999999',
      password_hash: 'Admin@123',  // Will be hashed by middleware
      name: 'Admin User',
      user_type: 'admin',
      is_verified: true,
      is_active: true
    });

    // Save admin - password will be automatically hashed by middleware
    await admin.save();
    console.log('✅ Admin user created\n');
    
    console.log('🔐 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@freshfarm.com');
    console.log('Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Test if password comparison works
    console.log('🧪 Testing password verification...');
    const testAdmin = await User.findOne({ email: 'admin@freshfarm.com' }).select('+password_hash');
    const isPasswordCorrect = await testAdmin.comparePassword('Admin@123');
    
    if (isPasswordCorrect) {
      console.log('✅ Password verification: WORKING\n');
    } else {
      console.log('❌ Password verification: FAILED\n');
    }
    
    console.log('🌐 Login करो: http://localhost:3000/login');
    console.log('📊 Admin portal: http://localhost:3000/dashboard/admin\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin();
