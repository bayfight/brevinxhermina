import 'server-only';

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: Storage | null = null;

// Initialize Firebase Admin SDK (lazy loaded on first access)
function initFirebaseAdmin() {
  if (app) return;

  // If already initialized by another instance, reuse it
  if (getApps().length > 0) {
    app = getApps()[0];
    _auth = getAuth(app);
    _db = getFirestore(app);
    _storage = getStorage(app);
    return;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // If it's Next.js build phase and environment variables are missing,
    // do not throw hard error to prevent build failure. 
    // This allows build to succeed, but operations will fail gracefully at runtime.
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || !process.env.NODE_ENV;
    if (isBuildPhase) {
      console.warn(
        "⚠️ Warning: Firebase Admin credentials missing during build. Skipping initialization."
      );
      return;
    }

    throw new Error(
      "Missing Firebase Admin SDK credentials. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in your env variables."
    );
  }

  try {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // Replace escaped newlines with actual newlines
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      storageBucket: `${projectId}.firebasestorage.app`,
    });

    _auth = getAuth(app);
    _db = getFirestore(app);
    _storage = getStorage(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

// Export Proxies for auth, db, and storage to lazy-initialize them on first property access
export const auth = new Proxy({} as Auth, {
  get: (_, prop) => {
    initFirebaseAdmin();
    if (!_auth) {
      throw new Error("Firebase Admin Auth SDK is not initialized due to missing credentials.");
    }
    return Reflect.get(_auth, prop);
  },
});

export const db = new Proxy({} as Firestore, {
  get: (_, prop) => {
    initFirebaseAdmin();
    if (!_db) {
      throw new Error("Firebase Admin Firestore SDK is not initialized due to missing credentials.");
    }
    return Reflect.get(_db, prop);
  },
});

export const storage = new Proxy({} as Storage, {
  get: (_, prop) => {
    initFirebaseAdmin();
    if (!_storage) {
      throw new Error("Firebase Admin Storage SDK is not initialized due to missing credentials.");
    }
    return Reflect.get(_storage, prop);
  },
});

/**
 * Verify Firebase ID token
 * @param token - Firebase ID token from client
 * @returns Decoded token with user information and custom claims
 */
export async function verifyIdToken(token: string) {
  try {
    // Accessing auth here will trigger the proxy get handler and initialize Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid or expired token");
  }
}
