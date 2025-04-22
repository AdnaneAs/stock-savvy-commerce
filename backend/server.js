
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialize PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    
    // Get user from PostgreSQL
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [decodedToken.uid]
    );
    
    if (rows.length === 0) {
      // First-time login, create user in PostgreSQL
      const newUser = await pool.query(
        'INSERT INTO users (firebase_uid, email, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [decodedToken.uid, decodedToken.email, decodedToken.name || decodedToken.email?.split('@')[0] || '', 'worker']
      );
      req.dbUser = newUser.rows[0];
    } else {
      req.dbUser = rows[0];
    }
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/api/users/me', verifyToken, async (req, res) => {
  res.json(req.dbUser);
});

// Products API
app.get('/api/products', verifyToken, async (req, res) => {
  const { role, id } = req.dbUser;
  
  try {
    let query;
    let params;
    
    if (role === 'admin') {
      // Admins can see all products
      query = 'SELECT * FROM products';
      params = [];
    } else if (role === 'owner') {
      // Owners see their store products
      query = 'SELECT p.* FROM products p JOIN stores s ON p.store_id = s.id WHERE s.owner_id = $1';
      params = [id];
    } else {
      // Workers see products from stores they have access to
      query = `
        SELECT p.* FROM products p
        JOIN user_store_access usa ON p.store_id = usa.store_id
        WHERE usa.user_id = $1
      `;
      params = [id];
    }
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', verifyToken, async (req, res) => {
  const { role, id } = req.dbUser;
  const { name, quantity, price, store_id } = req.body;
  
  // Only owners and admins can add products
  if (role !== 'owner' && role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    // Verify store ownership if not admin
    if (role === 'owner') {
      const { rows } = await pool.query(
        'SELECT * FROM stores WHERE id = $1 AND owner_id = $2',
        [store_id, id]
      );
      
      if (rows.length === 0) {
        return res.status(403).json({ error: 'Unauthorized: Not your store' });
      }
    }
    
    const { rows } = await pool.query(
      'INSERT INTO products (store_id, name, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [store_id, name, quantity, price]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/stores', verifyToken, async (req, res) => {
  const { role, id } = req.dbUser;
  const { name } = req.body;
  
  // Only owners and admins can create stores
  if (role !== 'owner' && role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO stores (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, id]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/invite-worker', verifyToken, async (req, res) => {
  const { role, id } = req.dbUser;
  const { email, store_id } = req.body;
  
  // Only owners and admins can invite workers
  if (role !== 'owner' && role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    // Verify store ownership if not admin
    if (role === 'owner') {
      const { rows } = await pool.query(
        'SELECT * FROM stores WHERE id = $1 AND owner_id = $2',
        [store_id, id]
      );
      
      if (rows.length === 0) {
        return res.status(403).json({ error: 'Unauthorized: Not your store' });
      }
    }
    
    // Check if user already exists
    const { rows: existingUsers } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    let user_id;
    
    if (existingUsers.length === 0) {
      // User doesn't exist in our system yet
      // We'll create a placeholder and update when they sign up
      const { rows: newUser } = await pool.query(
        'INSERT INTO users (firebase_uid, email, role) VALUES ($1, $2, $3) RETURNING id',
        [`placeholder-${Date.now()}`, email, 'worker']
      );
      user_id = newUser[0].id;
    } else {
      user_id = existingUsers[0].id;
    }
    
    // Add store access
    await pool.query(
      'INSERT INTO user_store_access (user_id, store_id, role) VALUES ($1, $2, $3)',
      [user_id, store_id, 'worker']
    );
    
    res.status(201).json({ message: 'Worker invited successfully' });
  } catch (error) {
    console.error('Error inviting worker:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Run the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
