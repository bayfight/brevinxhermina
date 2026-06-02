import 'server-only';

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let app: App;
let auth: Auth;
let db: Firestore;
let storage: Storage;

// Initialize Firebase Admin SDK (server-side only)
if (getApps().length === 0) {
  // Check if we have the required environment variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin SDK credentials. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in your .env.local file."
    );
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Replace escaped newlines with actual newlines
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    storageBucket: `${projectId}.firebasestorage.app`,
  });
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

/**
 * Verify Firebase ID token
 * @param token - Firebase ID token from client
 * @returns Decoded token with user information and custom claims
 */
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid or expired token");
  }
}

export { app, auth, db, storage };
