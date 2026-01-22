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
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).json({ message: 'Missing username or password' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return response.status(200).json({ token, user: { username: user.username, walletAddress: user.walletAddress, stats: user.stats } });

  } catch (error) {
    console.error('Login Error:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
}
