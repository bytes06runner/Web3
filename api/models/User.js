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
  unitType: {
    type: String,
    enum: ['Infantry', 'Archer', 'Cavalry'],
    default: 'Infantry'
  },
  lastRaidTime: {
     type: Date,
     default: null
  },
  barracksLevel: {
    type: Number,
    default: 1
  },
  capacity: {
    type: Number,
    default: 100
  },
  maxCapacity: {
    type: Number,
    default: 100
  },
  lastCapacityUpdate: {
    type: Date,
    default: Date.now
  },
  balance: {
    type: Number,
    default: 1000
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
