import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    password: { type: String },
    role: {
      type: String,
      enum: ['admin', 'student', 'teacher'],
      default: 'student',
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;
