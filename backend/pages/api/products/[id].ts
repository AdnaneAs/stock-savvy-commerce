
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../middleware/auth';
import connectToDatabase from '../../../lib/mongodb';
import { Product } from '../../../models/Product';
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
  const productId = req.query.id as string;
  
  // Find the product
  const product = await Product.findById(productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Check if user has access to this product's store
  let hasAccess = false;
  
  if (user.role === 'admin') {
    hasAccess = true;
  } else if (user.role === 'owner') {
    const store = await Store.findOne({ _id: product.store_id, owner_id: user._id });
    hasAccess = !!store;
  } else {
    const access = await UserStoreAccess.findOne({ 
      user_id: user._id, 
      store_id: product.store_id 
    });
    hasAccess = !!access;
  }
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'You do not have access to this product' });
  }
  
  // GET - Retrieve product details
  if (req.method === 'GET') {
    return res.status(200).json(product);
  }
  
  // PUT - Update product
  if (req.method === 'PUT') {
    try {
      const { name, description, barcode, sku, category, price, quantity } = req.body;
      
      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          name,
          description,
          barcode,
          sku,
          category,
          price,
          quantity,
          updated_at: new Date()
        },
        { new: true }
      );
      
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }
  
  // DELETE - Delete product
  if (req.method === 'DELETE') {
    try {
      await Product.findByIdAndDelete(productId);
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
