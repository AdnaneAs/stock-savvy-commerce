
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../middleware/auth';
import connectToDatabase from '../../../lib/mongodb';
import { Product } from '../../../models/Product';
import { User } from '../../../models/User';
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
  
  // GET - List products based on user role
  if (req.method === 'GET') {
    try {
      let products = [];
      
      // Determine which products to fetch based on user role
      if (user.role === 'admin') {
        // Admins see all products
        products = await Product.find().populate('store_id');
      } else if (user.role === 'owner') {
        // Owners see products from their stores
        const stores = await Store.find({ owner_id: user._id });
        const storeIds = stores.map(store => store._id);
        products = await Product.find({ store_id: { $in: storeIds } }).populate('store_id');
      } else {
        // Workers see products from stores they have access to
        const access = await UserStoreAccess.find({ user_id: user._id });
        const storeIds = access.map(a => a.store_id);
        products = await Product.find({ store_id: { $in: storeIds } }).populate('store_id');
      }
      
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }
  
  // POST - Create a new product
  if (req.method === 'POST') {
    try {
      const { name, description, barcode, sku, category, price, quantity, store_id } = req.body;
      
      // Check if user has permission to add products to this store
      let hasAccess = false;
      
      if (user.role === 'admin') {
        hasAccess = true;
      } else if (user.role === 'owner') {
        const store = await Store.findOne({ _id: store_id, owner_id: user._id });
        hasAccess = !!store;
      } else {
        const access = await UserStoreAccess.findOne({ 
          user_id: user._id, 
          store_id: store_id,
          role: { $in: ['owner', 'worker'] }
        });
        hasAccess = !!access;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have permission to add products to this store' });
      }
      
      // Create the product
      const product = await Product.create({
        name,
        description,
        barcode,
        sku,
        category,
        price,
        quantity,
        store_id,
        created_by: user._id
      });
      
      return res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
