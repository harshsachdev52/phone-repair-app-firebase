// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBt0btPAdKsPFtn_DYDFE3e5dR5BOMRMHE",
  authDomain: "phone-ad587.firebaseapp.com",
  projectId: "phone-ad587",
  storageBucket: "phone-ad587.firebasestorage.app",
  messagingSenderId: "407606294517",
  appId: "1:407606294517:web:35c1a25a61f381be1ad2bc",
  measurementId: "G-JTRP8BCSL1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
