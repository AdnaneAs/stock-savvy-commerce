
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../middleware/auth';
import connectToDatabase from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Connect to the database
  await connectToDatabase();
  
  // Check authentication
  const authResult = await verifyToken(req);
  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error });
  }
  
  const user = authResult.user;
  
  // Handle GET - return current user info
  if (req.method === 'GET') {
    return res.status(200).json(user);
  }
  
  // Handle PUT - update user info
  if (req.method === 'PUT') {
    try {
      const { displayName, photoURL } = req.body;
      
      // Update user data
      const updatedUser = await user.updateOne({
        name: displayName || user.name,
        photo_url: photoURL || user.photo_url
      });
      
      return res.status(200).json({
        ...user.toObject(),
        name: displayName || user.name,
        photo_url: photoURL || user.photo_url
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
