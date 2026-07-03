const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

async function createAdminDirect() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected\n');

    // Delete existing
    await User.deleteOne({ email: 'admin@freshfarm.com' });
    console.log('🗑️ Old admin deleted\n');

    // Hash password manually with bcrypt
    const plainPassword = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    console.log('🔐 Password Info:');
    console.log('Plain:', plainPassword);
    console.log('Hashed:', hashedPassword);
    console.log('Hash algorithm: bcrypt with salt 10\n');

    // Create new admin
    const admin = new User({
      email: 'admin@freshfarm.com',
      phone: '9999999999',
      name: 'Admin User',
      user_type: 'admin',
      is_verified: true,
      is_active: true,
      password_hash: hashedPassword  // Use pre-hashed password
    });

    // Disable the pre-save hook that would hash it again
    await User.collection.insertOne({
      email: 'admin@freshfarm.com',
      phone: '9999999999',
      name: 'Admin User',
      user_type: 'admin',
      is_verified: true,
      is_active: true,
      password_hash: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Admin created in database\n');

    // Verify by reading back
    const verifyAdmin = await User.findOne({ email: 'admin@freshfarm.com' }).select('+password_hash');
    const isMatch = await bcrypt.compare(plainPassword, verifyAdmin.password_hash);

    console.log('🧪 Verification:');
    console.log('Password matches:', isMatch ? '✅ YES' : '❌ NO\n');

    if (isMatch) {
      console.log('✅ READY TO LOGIN');
      console.log('Email: admin@freshfarm.com');
      console.log('Password: Admin@123\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌', error.message);
    process.exit(1);
  }
}

createAdminDirect();
