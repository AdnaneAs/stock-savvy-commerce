
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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

export { auth, googleProvider };
