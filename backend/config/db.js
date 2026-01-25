const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('Mongo URI:', process.env.MONGO_URI?.replace(/(mongodb\+srv:\/\/.*?:).*@/, '$1***@'));
    process.exit(1);
  }
};

module.exports = connectDB;
