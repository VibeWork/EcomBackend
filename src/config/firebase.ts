import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Decode newline-escaped private key
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')?.replace(/\\r/g, '')  ?.trim();
// console.log("🔑 Firebase Private Key (first 20 chars):", firebasePrivateKey?.slice(0, 20));

if (!firebasePrivateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
  throw new Error("❌ Missing Firebase environment variables. Please check .env.");
}

// Initialize app only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: firebasePrivateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// Export commonly used services
export const firebaseAdmin = admin;
export const auth = admin.auth();
export const storage = admin.storage();
export const messaging = admin.messaging();
