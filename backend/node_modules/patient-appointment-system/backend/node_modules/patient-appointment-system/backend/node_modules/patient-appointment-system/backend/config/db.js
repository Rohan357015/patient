const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse the connection to optimize serverless performance
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/patient_booking';
    
    // Set connection timeout parameters for faster failure feedback
    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // IMPORTANT: Do NOT call process.exit(1) on Vercel/serverless environments!
    // Instead, throw the error so Express can catch and report it gracefully.
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
