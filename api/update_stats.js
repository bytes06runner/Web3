import connectToDatabase from './db.js';
import User from './models/User.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { attackerWallet, defenderUsername, success } = request.body;

  if (!attackerWallet || !defenderUsername) {
    return response.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connectToDatabase();

    // Find Attacker
    const attacker = await User.findOne({ walletAddress: attackerWallet });
    if (!attacker) {
      return response.status(404).json({ message: 'Attacker not found' });
    }

    // Find Defender
    const defender = await User.findOne({ username: defenderUsername });
    if (!defender) {
      return response.status(404).json({ message: 'Defender not found' });
    }

    if (success) {
        // Update Stats
        attacker.stats.wins = (attacker.stats.wins || 0) + 1;
        attacker.stats.streak = (attacker.stats.streak || 0) + 1;
    } else {
        attacker.stats.streak = 0;
    }

    await attacker.save();

    return response.status(200).json({ 
        message: 'Stats updated', 
        newStats: attacker.stats 
    });

  } catch (error) {
    console.error('Update Error:', error);
    return response.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
