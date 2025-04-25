
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../middleware/auth';
import connectToDatabase from '../../../lib/mongodb';
import { Store } from '../../../models/Store';
import { UserStoreAccess } from '../../../models/UserStoreAccess';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Connect to the database
  await connectToDatabase();
  
  // Check authentication
  const authResult = await verifyToken(req);
  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error });
  }
  
  const user = authResult.user;
  
  // GET - List stores based on user role
  if (req.method === 'GET') {
    try {
      let stores = [];
      
      if (user.role === 'admin') {
        // Admins see all stores
        stores = await Store.find().populate('owner_id', 'name email');
      } else if (user.role === 'owner') {
        // Owners see their own stores
        stores = await Store.find({ owner_id: user._id });
      } else {
        // Workers see stores they have access to
        const access = await UserStoreAccess.find({ user_id: user._id });
        const storeIds = access.map(a => a.store_id);
        stores = await Store.find({ _id: { $in: storeIds } });
      }
      
      return res.status(200).json(stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      return res.status(500).json({ error: 'Failed to fetch stores' });
    }
  }
  
  // POST - Create a new store
  if (req.method === 'POST') {
    try {
      // Only admin and owner can create stores
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ error: 'Only admins and owners can create stores' });
      }
      
      const { name } = req.body;
      
      // Create the store
      const store = await Store.create({
        name,
        owner_id: user._id
      });
      
      // Create user access entry
      await UserStoreAccess.create({
        user_id: user._id,
        store_id: store._id,
        role: 'owner'
      });
      
      return res.status(201).json(store);
    } catch (error) {
      console.error('Error creating store:', error);
      return res.status(500).json({ error: 'Failed to create store' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
