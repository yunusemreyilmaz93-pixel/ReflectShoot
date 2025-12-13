
import { initializeApp } from "firebase/app";
// @ts-ignore
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDM72RAVXZvb3cTOQf1DjwTAcAbpcrV2dE",
  authDomain: "reflectandshoot.firebaseapp.com",
  projectId: "reflectandshoot",
  storageBucket: "reflectandshoot.firebasestorage.app",
  messagingSenderId: "619798868982",
  appId: "1:619798868982:web:a53e1fabdcf0c42f824dd7",
  measurementId: "G-MJG60H46RS"
};

// Initialize Firebase (Modular SDK)
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
