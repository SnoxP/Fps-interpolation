import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBItl0U69DfXY-sN5ngSrink10X_o-ZP3k",
  authDomain: "fps-interpolation.firebaseapp.com",
  projectId: "fps-interpolation",
  storageBucket: "fps-interpolation.firebasestorage.app",
  messagingSenderId: "628991123060",
  appId: "1:628991123060:web:aff781c6bcfdd66c567b21",
  measurementId: "G-48BCXQQ8DC"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
