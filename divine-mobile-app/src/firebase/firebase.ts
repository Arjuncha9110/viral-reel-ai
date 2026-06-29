import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web API keys are public client identifiers.
// Security is enforced by Firebase Security Rules, not by hiding this key.
const firebaseConfig = {
  apiKey: "AIzaSyAj1xiNHYnSXzPorCknJZORjO8-FHmwfuA",
  authDomain: "divine-panchang.firebaseapp.com",
  projectId: "divine-panchang",
  storageBucket: "divine-panchang.firebasestorage.app",
  messagingSenderId: "529674692992",
  appId: "1:529674692992:web:6ac18b7371a9137c66f965",
  measurementId: "G-GXY40KJ505",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
