
import * as admin from 'firebase-admin';

// Check if firebase app is already initialized
if (!admin.apps.length) {
  try {
    // Check if we have all the necessary service account credentials for production
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      // Initialize with full service account credentials for production
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace newlines in the private key
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized with full service account credentials');
    } 
    // If we just have a project ID without service account details
    else if (process.env.FIREBASE_PROJECT_ID) {
      // Initialize with application default credentials (works with Google Cloud)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        credential: admin.credential.applicationDefault()
      });
      console.log('Firebase Admin initialized with application default credentials');
    }
    // Development fallback with hardcoded project ID
    else {
      // Fallback to the most minimal configuration for development
      admin.initializeApp({
        projectId: 'stock-ges'
      });
      console.log('Firebase Admin initialized with minimal development config (stock-ges)');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    
    // Last resort fallback for development
    if (!admin.apps.length) {
      try {
        admin.initializeApp();
        console.log('Firebase Admin initialized with empty config (last resort)');
      } catch (fallbackError) {
        console.error('All Firebase Admin initialization attempts failed:', fallbackError);
        console.error('API endpoints requiring authentication will not work properly!');
      }
    }
  }
}

export const auth = admin.auth();

export default admin;
