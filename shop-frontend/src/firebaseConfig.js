// Import statements for Firebase services
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// !! IMPORTANT !!
// Replace this with your own Firebase config object from your project settings
const firebaseConfig = {
  apiKey: "AIzaSyCLvtyzU1OoCDJxMGMNdS17NGB11LaU3ok",
  authDomain: "electrosense-shop.firebaseapp.com",
  projectId: "electrosense-shop",
  storageBucket: "electrosense-shop.firebasestorage.app",
  messagingSenderId: "644134521773",
  appId: "1:644134521773:web:403c9092c73ebdb5baaf24",
  measurementId: "G-5DXNSDSNDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
