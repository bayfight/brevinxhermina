import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we are in build time and lack the API Key.
// Using a dummy config during build-time prevents the Firebase SDK from throwing "auth/invalid-api-key"
// when compiling static pages like the login page on hosting platforms like Vercel.
const isBuildTime = 
  typeof window === 'undefined' && 
  (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PHASE === 'phase-production-build');

const config = isBuildTime && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  ? {
      apiKey: "dummy-api-key-for-build-time-only",
      authDomain: "dummy-project.firebaseapp.com",
      projectId: "dummy-project",
      storageBucket: "dummy-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    }
  : firebaseConfig;

const app = getApps().length === 0 ? initializeApp(config) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
