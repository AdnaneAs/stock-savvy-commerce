
import knex from 'knex';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Ensure database directory exists
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.resolve(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(dbDir, 'stocksavvy.sqlite');

// Initialize knex with SQLite
export const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true
});

// Initialize database tables
export const initDatabase = async () => {
  // Create users table if it doesn't exist
  const hasUsersTable = await db.schema.hasTable('users');
  if (!hasUsersTable) {
    await db.schema.createTable('users', (table) => {
      table.string('uid').primary();
      table.string('email').notNullable().unique();
      table.string('displayName');
      table.string('role').defaultTo('worker'); // admin, owner, or worker
      table.string('status').defaultTo('Active');
      table.string('photoURL');
      table.json('invitedUsers').defaultTo('[]');
      table.string('invitedBy');
      table.timestamp('createdAt').defaultTo(db.fn.now());
    });

    // Create admin user
    await db('users').insert({
      uid: 'admin-uid',
      email: 'admin@admin.com',
      displayName: 'Admin',
      role: 'admin',
      status: 'Active',
      invitedUsers: '[]',
      createdAt: new Date().toISOString()
    });
  }

  // Create products table if it doesn't exist
  const hasProductsTable = await db.schema.hasTable('products');
  if (!hasProductsTable) {
    await db.schema.createTable('products', (table) => {
      table.string('id').primary();
      table.string('ownerId').notNullable();
      table.string('name').notNullable();
      table.text('description');
      table.decimal('price', 10, 2).defaultTo(0);
      table.integer('stock').defaultTo(0);
      table.string('category');
      table.string('barcode');
      table.string('sku');
      table.string('image');
      table.timestamp('createdAt').defaultTo(db.fn.now());
      table.timestamp('updatedAt').defaultTo(db.fn.now());
      
      table.foreign('ownerId').references('users.uid');
    });
  }
};

// User functions
export const createUser = async (userData: any) => {
  await db('users').insert({
    ...userData,
    invitedUsers: JSON.stringify(userData.invitedUsers || []),
  });
};

export const getUserByUid = async (uid: string) => {
  const user = await db('users').where({ uid }).first();
  if (user) {
    return {
      ...user,
      invitedUsers: JSON.parse(user.invitedUsers || '[]'),
    };
  }
  return null;
};

export const getAllUsers = async () => {
  const users = await db('users').select('*');
  return users.map(user => ({
    ...user,
    invitedUsers: JSON.parse(user.invitedUsers || '[]'),
  }));
};

export const updateUser = async (uid: string, updateData: any) => {
  // Handle invitedUsers specially if it exists
  if (updateData.invitedUsers) {
    updateData = {
      ...updateData,
      invitedUsers: JSON.stringify(updateData.invitedUsers)
    };
  }
  
  await db('users').where({ uid }).update(updateData);
};

export const inviteUser = async (inviterUid: string, invitedUid: string) => {
  const inviter = await getUserByUid(inviterUid);
  if (inviter) {
    const invitedUsers = [...inviter.invitedUsers, invitedUid];
    await updateUser(inviterUid, { invitedUsers });
  }
};

// Product functions
export const createProduct = async (productData: any) => {
  await db('products').insert({
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return productData.id;
};

export const getProductsByOwnerId = async (ownerId: string) => {
  return db('products').where({ ownerId }).select('*');
};

export const getProductById = async (id: string) => {
  return db('products').where({ id }).first();
};

export const updateProduct = async (id: string, updateData: any) => {
  updateData.updatedAt = new Date().toISOString();
  await db('products').where({ id }).update(updateData);
};

export const deleteProduct = async (id: string) => {
  await db('products').where({ id }).delete();
};

// Initialize the database
initDatabase().catch(console.error);
