import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-12345",
};

// Safe dev-only check for debugging config
console.log("Firebase Config Initialization:");
console.log("- API Key:", firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}... (Length: ${firebaseConfig.apiKey.length})` : "UNDEFINED/EMPTY");
console.log("- Project ID:", firebaseConfig.projectId);
console.log("- Auth Domain:", firebaseConfig.authDomain);
console.log("- Raw ENV API Key length:", import.meta.env.VITE_FIREBASE_API_KEY ? import.meta.env.VITE_FIREBASE_API_KEY.length : "undefined");

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
