import connectToDatabase from './db.js';
import User from './models/User.js';

export default async function handler(request, response) {
  try {
    await connectToDatabase();

    if (request.method === 'GET') {
        const users = await User.find({}).select('-password').sort({ 'stats.wins': -1 });
        return response.status(200).json(users);
    }
    
    return response.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    return response.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}
