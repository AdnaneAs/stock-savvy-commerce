
-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_store_access;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS user_role;

-- Create role enum
CREATE TYPE user_role AS ENUM ('admin', 'owner', 'worker');

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role user_role DEFAULT 'worker',
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  sku TEXT,
  barcode TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Map users to stores with role
CREATE TABLE user_store_access (
  user_id INTEGER REFERENCES users(id),
  store_id INTEGER REFERENCES stores(id),
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, store_id)
);

-- Add admin user
INSERT INTO users (firebase_uid, email, name, role)
VALUES ('admin-uid', 'admin@admin.com', 'Admin', 'admin');
