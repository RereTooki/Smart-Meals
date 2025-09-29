// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBryjyXDFv9Hs8nXsFDuwDOE3McqMQMRn4",
  authDomain: "smart-meal-planner-3e139.firebaseapp.com",
  projectId: "smart-meal-planner-3e139",
  storageBucket: "smart-meal-planner-3e139.firebasestorage.app",
  messagingSenderId: "1027567915839",
  appId: "1:1027567915839:web:f76bcf57ee8991f17d798a",
  measurementId: "G-Y4GT8FZ50G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
