
import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest } from 'next';
import { auth } from '../lib/firebase-admin';
import connectToDatabase from '../lib/mongodb';
import { User } from '../models/User';

// Define a type that can handle both API types
type RequestWithAuth = NextRequest | NextApiRequest;

// Helper function to extract token based on request type
function extractToken(req: RequestWithAuth): string | undefined {
  // Handle NextRequest (App Router)
  if ('nextUrl' in req) {
    return req.headers.get('authorization')?.split('Bearer ')[1];
  } 
  // Handle NextApiRequest (Pages Router)
  else {
    const authHeader = req.headers.authorization as string | undefined;
    return authHeader?.split('Bearer ')[1];
  }
}

export async function verifyToken(req: RequestWithAuth) {
  const token = extractToken(req);
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
        role: 'owner', // Default role
        photo_url: decodedToken.picture || ''
      });
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { success: false, error: 'Invalid token' };
  }
}

// This middleware is intended for use with App Router only
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
