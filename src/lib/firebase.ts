import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBItl0U69DfXY-sN5ngSrink10X_o-ZP3k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fps-interpolation.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fps-interpolation",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fps-interpolation.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "628991123060",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:628991123060:web:aff781c6bcfdd66c567b21",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-48BCXQQ8DC"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
