import connectToDatabase from './db.js';
import User from './models/User.js';
import { calculateRegen } from './gameEngine.js';

export default async function handler(request, response) {
  try {
    await connectToDatabase();

    if (request.method === 'GET') {
        const users = await User.find({}).select('-password').sort({ 'stats.wins': -1 });
        
        // Apply passive regeneration to all users before returning
        users.forEach(user => {
            calculateRegen(user);
            // Ideally we should save this state, but for read-heavy endpoint we can just calculate 'view' state
            // If we want to persist, we'd need to bulkWrite or save individually. 
            // For hackathon, doing a save on the specific user FE is interested in or just lazily updating is fine.
            // Let's just return the calculated values. User object is mutable here.
        });

        return response.status(200).json(users);
    }
    
    return response.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    return response.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}
