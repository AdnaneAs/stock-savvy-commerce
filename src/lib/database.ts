// Using IndexedDB for browser environment instead of SQLite
// This provides similar functionality but works in browsers

// Define types for our data structures
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'owner' | 'worker';
  status?: 'Active' | 'Invited' | 'Inactive';
  photoURL?: string;
  invitedUsers: string[];
  invitedBy?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  barcode?: string;
  sku?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory database for demo purposes (will reset on page refresh)
const db = {
  users: [] as UserProfile[],
  products: [] as Product[]
};

// Initialize with admin user and sample products
export const initDatabase = async () => {
  // Only add admin if not already exists
  if (!db.users.find(user => user.uid === 'admin-uid')) {
    db.users.push({
      uid: 'admin-uid',
      email: 'admin@admin.com',
      displayName: 'Admin',
      role: 'admin',
      status: 'Active',
      invitedUsers: [],
      createdAt: new Date().toISOString()
    });
    
    // Add sample products for the admin user
    const sampleProducts = [
      {
        id: 'prod-1',
        ownerId: 'admin-uid',
        name: 'USB Flash Drive 32GB',
        description: 'High-speed USB 3.0 flash drive',
        price: 12.99,
        stock: 142,
        category: 'Electronics',
        barcode: '8574635284163',
        sku: 'USB-32GB',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-2',
        ownerId: 'admin-uid',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with long battery life',
        price: 24.99,
        stock: 78,
        category: 'Electronics',
        barcode: '7485963210584',
        sku: 'WM-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-3',
        ownerId: 'admin-uid',
        name: 'Office Chair',
        description: 'Adjustable office chair with lumbar support',
        price: 149.99,
        stock: 14,
        category: 'Furniture',
        barcode: '9685741023695',
        sku: 'OC-deluxe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Add sample products to database
    sampleProducts.forEach(product => {
      db.products.push(product);
    });
    
    console.log('Admin user and sample products initialized');
  } else {
    console.log('Admin account already exists');
  }
};

// User functions
export const createUser = async (userData: any) => {
  db.users.push({
    ...userData,
    invitedUsers: userData.invitedUsers || []
  });
};

export const getUserByUid = async (uid: string) => {
  const user = db.users.find(u => u.uid === uid);
  if (!user) return null;
  return { ...user };
};

export const getAllUsers = async () => {
  return [...db.users];
};

export const updateUser = async (uid: string, updateData: any) => {
  const userIndex = db.users.findIndex(u => u.uid === uid);
  if (userIndex !== -1) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updateData
    };
  }
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
  db.products.push({
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return productData.id;
};

export const getProductsByOwnerId = async (ownerId: string) => {
  return db.products.filter(p => p.ownerId === ownerId);
};

export const getProductById = async (id: string) => {
  return db.products.find(p => p.id === id) || null;
};

export const updateProduct = async (id: string, updateData: any) => {
  const productIndex = db.products.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    db.products[productIndex] = {
      ...db.products[productIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
  }
};

export const deleteProduct = async (id: string) => {
  const productIndex = db.products.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    db.products.splice(productIndex, 1);
  }
};

// Initialize the database
initDatabase().catch(console.error);
