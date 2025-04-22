
import { auth } from "@/lib/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Get authentication token for API requests
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(true);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Make an authenticated API request
 */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error("Not authenticated");
  }
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }
  
  return response.json();
};

/**
 * User related API calls
 */
export const userApi = {
  getCurrentUser: () => apiRequest("/users/me"),
  updateProfile: (data: any) => apiRequest("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};

/**
 * Products related API calls
 */
export const productsApi = {
  getProducts: () => apiRequest("/products"),
  getProduct: (id: string) => apiRequest(`/products/${id}`),
  createProduct: (data: any) => apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateProduct: (id: string, data: any) => apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  deleteProduct: (id: string) => apiRequest(`/products/${id}`, {
    method: "DELETE",
  }),
};

/**
 * Stores related API calls
 */
export const storesApi = {
  getStores: () => apiRequest("/stores"),
  createStore: (data: any) => apiRequest("/stores", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  inviteWorker: (data: any) => apiRequest("/invite-worker", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};
