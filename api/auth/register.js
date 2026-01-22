import connectToDatabase from '../db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectToDatabase();
    const { username, password, walletAddress } = request.body;

    // Basic Validation
    if (!username || !password || !walletAddress) {
        return response.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ 
      $or: [{ username }, { walletAddress }] 
    });

    if (existingUser) {
      return response.status(400).json({ message: 'User or wallet already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      walletAddress,
      stats: { wins: 0, defense: 100, stamina: 100, streak: 0 }
    });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return response.status(201).json({ token, user: { username: user.username, walletAddress: user.walletAddress, stats: user.stats } });

  } catch (error) {
    console.error('Register Error:', error);
    return response.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
