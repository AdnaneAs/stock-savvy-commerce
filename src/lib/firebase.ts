
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";

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
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Check if admin account exists, if not create it
const initializeAdminAccount = async () => {
  try {
    const adminEmail = "admin@admin.com";
    const adminPassword = "admin";
    
    // Check if user already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", adminEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      try {
        // Create admin user
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        const user = userCredential.user;
        
        // Add admin user to Firestore with admin role
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: adminEmail,
          role: "admin",
          displayName: "Admin",
          createdAt: new Date(),
          invitedUsers: [],
          products: []
        });
        
        console.log("Admin account created");
      } catch (error: any) {
        // Admin might already exist in Auth but not in Firestore
        if (error.code === "auth/email-already-in-use") {
          try {
            // Try to sign in as admin
            const credential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            const adminUser = credential.user;
            
            // Check if admin exists in Firestore
            const adminDoc = await getDoc(doc(db, "users", adminUser.uid));
            if (!adminDoc.exists()) {
              // Create admin user profile
              await setDoc(doc(db, "users", adminUser.uid), {
                uid: adminUser.uid,
                email: adminEmail,
                role: "admin",
                displayName: "Admin",
                createdAt: new Date(),
                invitedUsers: [],
                products: []
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
initializeAdminAccount();

// Helper functions for user management
const createUserProfile = async (uid, userData) => {
  await setDoc(doc(db, "users", uid), {
    uid,
    ...userData,
    role: userData.role || "user",
    invitedUsers: userData.invitedUsers || [],
    products: userData.products || [],
    createdAt: new Date()
  });
};

const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};

const inviteUser = async (inviterUid, invitedUserUid) => {
  await updateDoc(doc(db, "users", inviterUid), {
    invitedUsers: arrayUnion(invitedUserUid)
  });
};

// Add product management functions
const addUserProduct = async (uid, productData) => {
  const productRef = doc(collection(db, "products"));
  const productId = productRef.id;
  
  // Add product with owner information
  await setDoc(productRef, {
    id: productId,
    ownerId: uid,
    ...productData,
    createdAt: new Date()
  });
  
  // Add product ID to user's products array
  await updateDoc(doc(db, "users", uid), {
    products: arrayUnion(productId)
  });
  
  return productId;
};

const getUserProducts = async (uid) => {
  const productsRef = collection(db, "products");
  const q = query(productsRef, where("ownerId", "==", uid));
  const querySnapshot = await getDocs(q);
  
  const products = [];
  querySnapshot.forEach((doc) => {
    products.push(doc.data());
  });
  
  return products;
};

const getAllUsers = async () => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  
  const users = [];
  querySnapshot.forEach((doc) => {
    users.push(doc.data());
  });
  
  return users;
};

const updateUserRole = async (uid, newRole) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    role: newRole
  });
};

export { 
  auth, 
  googleProvider, 
  db, 
  createUserProfile, 
  getUserProfile,
  inviteUser,
  addUserProduct,
  getUserProducts,
  getAllUsers,
  updateUserRole
};
