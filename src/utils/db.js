// db/connectDB.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoURI = process.env.MONGOURL;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Kết nối MongoDB thành công!');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
  }
};
