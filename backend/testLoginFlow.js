const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function testLoginFlow() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshfarm', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected\n');

    // Simulate login request
    const email = 'admin@freshfarm.com';
    const password = 'Admin@123';

    console.log('📝 Login Request Simulation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Find user
    console.log('Step 1: Finding user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password_hash');

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Type:', user.user_type);
    console.log('  - Password Hash:', user.password_hash.substring(0, 30) + '...\n');

    // Step 2: Compare password
    console.log('Step 2: Comparing password...');
    console.log('  - Entered password:', password);
    
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      console.log('❌ Password DOES NOT match\n');
      console.log('Debugging info:');
      console.log('  - Password hash in DB:', user.password_hash);
      process.exit(1);
    }

    console.log('✅ Password matches!\n');

    // Step 3: Would generate token
    console.log('Step 3: Token generation would happen');
    console.log('✅ Login would be successful\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ LOGIN FLOW SUCCESSFUL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testLoginFlow();
