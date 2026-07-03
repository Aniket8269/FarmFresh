const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.MONGODB_DB_NAME || 'freshfarm'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes
    await createIndexes();

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection;
    
    // Users indexes
    db.collection('users').createIndex({ email: 1 }, { unique: true });
    db.collection('users').createIndex({ phone: 1 }, { unique: true });
    db.collection('users').createIndex({ user_type: 1 });

    // Farmers indexes
    db.collection('farmers').createIndex({ location: '2dsphere' });
    db.collection('farmers').createIndex({ verification_status: 1 });

    // Products indexes
    db.collection('products').createIndex({ name: 'text', description: 'text' });
    db.collection('products').createIndex({ farmer_id: 1 });
    db.collection('products').createIndex({ category: 1 });

    // Orders indexes
    db.collection('orders').createIndex({ consumer_id: 1 });
    db.collection('orders').createIndex({ farmer_id: 1 });
    db.collection('orders').createIndex({ delivery_partner_id: 1 });
    db.collection('orders').createIndex({ order_status: 1 });
    db.collection('orders').createIndex({ created_at: -1 });

    console.log('Indexes created successfully');
  } catch (error) {
    console.error(`Error creating indexes: ${error.message}`);
  }
};

module.exports = connectDB;
