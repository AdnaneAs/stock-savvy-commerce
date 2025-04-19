import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { 
  createUser, 
  getUserByUid, 
  getAllUsers, 
  updateUser as dbUpdateUser, 
  inviteUser as dbInviteUser,
  createProduct,
  getProductsByOwnerId,
  getProductById,
  updateProduct,
  deleteProduct
} from "./database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx7YgxGJ-PKuQqq-5RvCRmXj0T9ZTCA-c",
  authDomain: "stocksavvy-inventory.firebaseapp.com",
  projectId: "stocksavvy-inventory",
  storageBucket: "stocksavvy-inventory.appspot.com",
  messagingSenderId: "391547046129",
  appId: "1:391547046129:web:b70ef9e6f776c635724f5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Check if admin account exists, if not create it
const initializeAdminAccount = async () => {
  try {
    const adminEmail = "admin@admin.com";
    const adminPassword = "admin";
    
    // Check if user already exists in the database
    const adminUser = await getUserByUid("admin-uid");
    
    if (!adminUser) {
      try {
        // Create admin user in Firebase Auth
        console.log("Creating admin user in Firebase Auth");
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        const user = userCredential.user;
        
        // Add admin user to database with admin role
        await createUser({
          uid: user.uid,
          email: adminEmail,
          role: "admin",
          displayName: "Admin",
          createdAt: new Date().toISOString(),
          invitedUsers: []
        });
        
        console.log("Admin account created");
      } catch (error: any) {
        // Admin might already exist in Auth but not in database
        if (error.code === "auth/email-already-in-use") {
          try {
            // Try to sign in as admin
            const credential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            const adminUser = credential.user;
            
            // Check if admin exists in database
            const existingAdminUser = await getUserByUid(adminUser.uid);
            if (!existingAdminUser) {
              // Create admin user profile
              await createUser({
                uid: adminUser.uid,
                email: adminEmail,
                role: "admin",
                displayName: "Admin",
                createdAt: new Date().toISOString(),
                invitedUsers: []
              });
              console.log("Admin profile created");
            }
          } catch (signInError) {
            console.error("Error ensuring admin account:", signInError);
          }
        } else {
          console.error("Error creating admin account:", error);
        }
      }
    } else {
      console.log("Admin account already exists");
    }
  } catch (error) {
    console.error("Error initializing admin account:", error);
  }
};

// Initialize admin account
initializeAdminAccount().catch(error => {
  console.error("Error creating admin account:", error);
});

// Helper functions for user management
const createUserProfile = async (uid, userData) => {
  await createUser({
    uid,
    ...userData,
    role: userData.role || "worker",
    invitedUsers: userData.invitedUsers || [],
    createdAt: new Date().toISOString()
  });
};

const getUserProfile = async (uid) => {
  return getUserByUid(uid);
};

const updateUser = async (uid, userData) => {
  return dbUpdateUser(uid, userData);
};

const inviteUser = async (inviterUid, invitedUserUid) => {
  await dbInviteUser(inviterUid, invitedUserUid);
};

// Add product management functions
const addUserProduct = async (uid, productData) => {
  const productId = `product-${Date.now()}`;
  
  // Add product with owner information
  await createProduct({
    id: productId,
    ownerId: uid,
    ...productData,
  });
  
  return productId;
};

const getUserProducts = async (uid) => {
  return getProductsByOwnerId(uid);
};

const updateUserRole = async (uid, newRole) => {
  await updateUser(uid, { role: newRole });
};

export { 
  auth, 
  googleProvider, 
  createUserProfile, 
  getUserProfile,
  updateUser,
  inviteUser,
  addUserProduct,
  getUserProducts,
  getAllUsers,
  updateUserRole
};
