import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// User Schema (inline for Netlify Functions)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, select: false },
  walletAddress: { type: String, required: true, unique: true, lowercase: true, trim: true },
  stats: {
    wins: { type: Number, default: 0 },
    defense: { type: Number, default: 100 },
    stamina: { type: Number, default: 100 },
    streak: { type: Number, default: 0 },
  },
  balance: { type: Number, default: 1000 },
  troops: {
    archers: { type: Number, default: 0 },
    infantry: { type: Number, default: 0 },
    giants: { type: Number, default: 0 }
  }
}, { timestamps: true });

let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', UserSchema);
}

// DB Connection Cache
let cached = global.mongooseConn;
if (!cached) cached = global.mongooseConn = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    await connectDB();
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing username or password' }) };
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials' }) };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials' }) };
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token, 
        user: { 
          username: user.username, 
          walletAddress: user.walletAddress, 
          stats: user.stats,
          balance: user.balance,
          troops: user.troops
        } 
      })
    };

  } catch (error) {
    console.error('Login Error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server Error', error: error.message }) };
  }
}
