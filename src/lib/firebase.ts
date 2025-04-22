
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj70657cHk4894QadtmHsiiJsG3SzZDzI",
  authDomain: "stock-ges.firebaseapp.com",
  projectId: "stock-ges",
  storageBucket: "stock-ges.firebasestorage.app",
  messagingSenderId: "873691268744",
  appId: "1:873691268744:web:66f036719639cccb95013d",
  measurementId: "G-WFVX55BVKD"
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

export { 
  auth, 
  googleProvider,
  getCurrentUser,
  isAuthenticated
};
