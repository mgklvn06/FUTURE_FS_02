/* eslint-disable no-undef */
import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('Missing MONGO_URI in crm-backend/.env');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};

export default connectDB;
