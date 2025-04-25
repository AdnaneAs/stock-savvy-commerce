
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "firebase/auth";
import { userApi, productsApi } from "@/services/api";
import { UserProfile } from "@/components/auth/RequireAuth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add auth state observer
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('User is signed out');
  }
});

// Function to get current user
const getCurrentUser = () => {
  return auth.currentUser || currentUser;
};

// Function to check if user is authenticated
const isAuthenticated = () => {
  return !!getCurrentUser();
};

// Functions that call the API
const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    return await userApi.getUserById(uid);
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

const updateUser = async (uid: string, userData: Partial<UserProfile>) => {
  try {
    return await userApi.updateUser(uid, userData);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const updateUserRole = async (uid: string, role: "admin" | "owner" | "worker") => {
  try {
    return await userApi.updateUserRole(uid, role);
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    return await userApi.getAllUsers();
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

const createUserProfile = async (uid: string, userData: any) => {
  try {
    return await userApi.createUser(uid, userData);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Product related functions
const getUserProducts = async (userId: string) => {
  try {
    return await productsApi.getUserProducts(userId);
  } catch (error) {
    console.error("Error getting user products:", error);
    return [];
  }
};

const deleteProduct = async (productId: string) => {
  try {
    return await productsApi.deleteProduct(productId);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

const db = getFirestore(app);

export { 
  auth, 
  googleProvider,
  getCurrentUser,
  isAuthenticated,
  getUserProfile,
  updateUser,
  updateUserRole,
  getAllUsers,
  createUserProfile,
  getUserProducts,
  deleteProduct,
  db
};
