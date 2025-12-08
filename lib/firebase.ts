import firebase from "firebase/compat/app";
import "firebase/compat/auth";
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

// Initialize Firebase with compat compatibility for Auth
const app = firebase.initializeApp(firebaseConfig);

// Initialize Services
// Export compat auth instance to avoid "no exported member" errors from modular packages
export const auth = app.auth();
// Export modular firestore instance (cast app to any to satisfy type requirements if needed)
export const db = getFirestore(app as any);