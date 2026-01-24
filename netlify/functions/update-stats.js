import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

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
try { User = mongoose.model('User'); } catch { User = mongoose.model('User', UserSchema); }

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
    const { username, action, amount } = JSON.parse(event.body);

    if (!username || !action) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing username or action' }) };
    }

    const user = await User.findOne({ username });
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
    }

    // Handle different actions
    switch (action) {
      case 'win':
        user.stats.wins += 1;
        user.balance += (amount || 200);
        break;
      case 'loss':
        user.balance -= (amount || 100);
        break;
      case 'train':
        // Deduct training cost if needed
        break;
      case 'upgrade_defense':
        user.stats.defense += 10;
        break;
    }

    await user.save();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Stats updated', user })
    };

  } catch (error) {
    console.error('Update Stats Error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server Error', error: error.message }) };
  }
}
