
import * as admin from 'firebase-admin';

// Get the Firebase config values from your frontend
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

// Check if firebase app is already initialized
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin with a minimal configuration for development
    admin.initializeApp({
      projectId: FIREBASE_PROJECT_ID,
      credential: admin.credential.applicationDefault()
    });
    console.log('Firebase Admin initialized for development');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    console.log('Attempting to initialize with Google Application Default Credentials fallback...');
    
    // Fallback to the most minimal configuration possible
    try {
      admin.initializeApp({
        projectId: FIREBASE_PROJECT_ID
      });
      console.log('Firebase Admin initialized with minimal config');
    } catch (fallbackError) {
      console.error('Firebase Admin fallback initialization failed:', fallbackError);
    }
  }
}

export const auth = admin.auth();

export default admin;
