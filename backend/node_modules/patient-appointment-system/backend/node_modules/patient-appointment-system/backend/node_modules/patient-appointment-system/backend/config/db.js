const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/patient_booking';
    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
