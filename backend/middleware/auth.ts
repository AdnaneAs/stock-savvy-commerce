
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../lib/firebase-admin';
import { connectToDatabase } from '../lib/mongodb';
import { User } from '../models/User';

export async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split('Bearer ')[1];
  
  if (!token) {
    return { success: false, error: 'No token provided' };
  }
  
  try {
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Find or create user in MongoDB
    let user = await User.findOne({ firebase_uid: firebaseUid });
    
    if (!user) {
      // Create new user
      user = await User.create({
        firebase_uid: firebaseUid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email?.split('@')[0] || '',
        role: 'worker', // Default role
        photo_url: decodedToken.picture || ''
      });
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { success: false, error: 'Invalid token' };
  }
}

export async function authMiddleware(req: NextRequest) {
  const result = await verifyToken(req);
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error }, 
      { status: 401 }
    );
  }
  
  return result.user;
}
