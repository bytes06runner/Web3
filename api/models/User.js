import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    select: false,
  },
  walletAddress: {
    type: String,
    required: [true, 'Please provide a wallet address'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  stats: {
    wins: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    stamina: { type: Number, default: 100 },
    streak: { type: Number, default: 0 },
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
