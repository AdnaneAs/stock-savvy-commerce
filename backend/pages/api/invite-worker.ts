
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../middleware/auth';
import connectToDatabase from '../../lib/mongodb';
import { User } from '../../models/User';
import { Store } from '../../models/Store';
import { UserStoreAccess } from '../../models/UserStoreAccess';
import { auth } from '../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Connect to the database
  await connectToDatabase();
  
  // Check authentication
  const authResult = await verifyToken(req);  
  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error });
  }
  
  const user = authResult.user;
  
  // Only admins and owners can invite workers
  if (user.role !== 'admin' && user.role !== 'owner') {
    return res.status(403).json({ error: 'Only admins and owners can invite workers' });
  }
  
  const { email, store_id } = req.body;
  
  if (!email || !store_id) {
    return res.status(400).json({ error: 'Email and store_id are required' });
  }
  
  try {
    // Check if store exists and user has access
    let hasAccess = false;
    
    if (user.role === 'admin') {
      hasAccess = true;
    } else {
      const store = await Store.findOne({ _id: store_id, owner_id: user._id });
      hasAccess = !!store;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have permission to invite workers to this store' });
    }
    
    // Check if user exists by email
    let workerUser = await User.findOne({ email });
    
    if (!workerUser) {
      // Create placeholder user
      workerUser = await User.create({
        firebase_uid: `placeholder-${Date.now()}`,
        email,
        role: 'worker'
      });
    }
    
    // Grant access to the store
    try {
      await UserStoreAccess.create({
        user_id: workerUser._id,
        store_id,
        role: 'worker'
      });
    } catch (err: any) {
      // Check if it's a duplicate error (user already has access)
      if (err.code === 11000) {
        return res.status(409).json({ error: 'User already has access to this store' });
      }
      throw err;
    }
    
    return res.status(201).json({ message: 'Worker invited successfully' });
  } catch (error) {
    console.error('Error inviting worker:', error);
    return res.status(500).json({ error: 'Failed to invite worker' });
  }
}
