import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    role: { type: String, enum: ['student', 'teacher'], required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamp: true },
);

const User = mongoose.model('User', userSchema);
export default User;
