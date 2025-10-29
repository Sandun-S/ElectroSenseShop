// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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