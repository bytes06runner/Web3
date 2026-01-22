import connectToDatabase from './db.js';
import User from './models/User.js';
import { calculateRegen } from './gameEngine.js';

export default async function handler(request, response) {
  try {
    await connectToDatabase();

    if (request.method === 'GET') {
        const { walletAddress } = request.query;

        if (walletAddress) {
            const user = await User.findOne({ walletAddress });
            if (!user) return response.status(404).json({ message: 'User not found' });
            
            calculateRegen(user);
            // We return the user with regenerated stats
            return response.status(200).json(user);
        }

        const users = await User.find({}).select('-password').sort({ 'stats.wins': -1 });
        return response.status(200).json(users);
    }
    
    return response.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    return response.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}
