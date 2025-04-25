
import { UserProfile } from "@/components/auth/RequireAuth";
import { auth } from "@/lib/firebase";

// Base API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Helper function to get the authorization header
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

// API functions for users
const userApi = {
  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }
    
    const data = await response.json();
    // Add virtual fields for backward compatibility
    return {
      ...data,
      // These fields are added by getters in UserProfile interface
      uid: data.firebase_uid,
      displayName: data.name,
      photoURL: data.photo_url,
      invitedUsers: data.invitedUsers || []
    };
  },
  
  // Get user by ID
  getUserById: async (userId: string): Promise<UserProfile> => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    const data = await response.json();
    // Add invitedUsers for backward compatibility
    return { 
      ...data, 
      uid: data.firebase_uid,
      displayName: data.name,
      photoURL: data.photo_url,
      invitedUsers: data.invitedUsers || [] 
    };
  },
  
  // Update user profile
  updateProfile: async (userData: Partial<UserProfile>) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users/me`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Map our fields to backend fields
        name: userData.displayName || userData.name,
        photo_url: userData.photoURL || userData.photo_url
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Update any user (admin only)
  updateUser: async (userId: string, userData: Partial<UserProfile>) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userData.displayName || userData.name,
        photo_url: userData.photoURL || userData.photo_url
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Update user role (admin only)
  updateUserRole: async (userId: string, role: "admin" | "owner" | "worker") => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user role: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Get all users (admin only)
  getAllUsers: async () => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    const users = await response.json();
    // Add compatibility fields
    return users.map((user: any) => ({ 
      ...user, 
      uid: user.firebase_uid,
      displayName: user.name,
      photoURL: user.photo_url,
      invitedUsers: user.invitedUsers || [] 
    }));
  },
  
  // Create a new user (admin only)
  createUser: async (uid: string, userData: any) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firebase_uid: uid,
        ...userData
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// API functions for products
const productsApi = {
  // Get products for current user
  getUserProducts: async (userId: string) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/products`, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const products = await response.json();
    // Map MongoDB _id to id for frontend compatibility
    return products.map((product: any) => ({
      ...product,
      id: product._id,
      // Stock is equivalent to quantity in our model
      stock: product.quantity
    }));
  },
  
  // Create a new product
  createProduct: async (productData: any) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...productData,
        // Ensure quantity is properly set from stock if provided
        quantity: productData.stock || productData.quantity || 0
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }
    
    const product = await response.json();
    return {
      ...product,
      id: product._id,
      stock: product.quantity
    };
  },
  
  // Update a product
  updateProduct: async (productId: string, productData: any) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...productData,
        // Ensure quantity is properly set from stock if provided
        quantity: productData.stock !== undefined ? productData.stock : productData.quantity
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }
    
    const product = await response.json();
    return {
      ...product,
      id: product._id,
      stock: product.quantity
    };
  },
  
  // Delete a product
  deleteProduct: async (productId: string) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// API functions for stores
const storesApi = {
  // Get stores for current user
  getUserStores: async () => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/stores`, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stores: ${response.statusText}`);
    }
    
    const stores = await response.json();
    return stores.map((store: any) => ({
      ...store,
      id: store._id
    }));
  },
  
  // Create a new store
  createStore: async (storeData: { name: string }) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/stores`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storeData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create store: ${response.statusText}`);
    }
    
    const store = await response.json();
    return {
      ...store,
      id: store._id
    };
  },
  
  // Invite a worker to a store
  inviteWorker: async (email: string, storeId: string) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/invite-worker`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, store_id: storeId }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to invite worker: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// Export the APIs
export { userApi, productsApi, storesApi };
