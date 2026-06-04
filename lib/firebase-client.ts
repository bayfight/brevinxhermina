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

// Helper to check if the Firebase API Key is valid
const isValidApiKey = (key?: string): boolean => {
  if (!key) return false;
  const cleanKey = key.trim();
  return cleanKey.length > 10 && cleanKey !== "undefined" && cleanKey !== "null" && cleanKey !== "";
};

// Check if we are in build time or lack a valid API Key.
// Using a dummy config during build-time prevents the Firebase SDK from throwing "auth/invalid-api-key"
// when compiling static pages like the login page on hosting platforms like Vercel.
const isBuildTime = typeof window === 'undefined';
const useDummyConfig = isBuildTime || !isValidApiKey(firebaseConfig.apiKey);

const config = useDummyConfig
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
