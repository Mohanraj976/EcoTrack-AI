// src/firebase/firebaseConfig.js
// Replace these values with your actual Firebase project configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCd8jewKvz5yhEFxf4KzzonlAmwGfDLrWw",
  authDomain: "carbonscan-467d3.firebaseapp.com",
  projectId: "carbonscan-467d3",
  storageBucket: "carbonscan-467d3.firebasestorage.app",
  messagingSenderId: "236492556952",
  appId: "1:236492556952:web:d6959b16a14afa20a79eed",
  measurementId: "G-J22G6HFYX2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;