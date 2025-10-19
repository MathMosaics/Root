import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBb_YXiOhu_6QM-YEoe4oWZ5RD2OKHWRAM",
  authDomain: "minecraftmathquest.firebaseapp.com",
  projectId: "minecraftmathquest",
  storageBucket: "minecraftmathquest.firebasestorage.app",
  messagingSenderId: "499038424835",
  appId: "1:499038424835:web:8821ae115b3c325ab9e336",
  measurementId: "G-E8HD0X629C"

};

let db: firebase.firestore.Firestore | null = null;
let auth: firebase.auth.Auth | null = null;
let firebaseInitialized = false;

if (firebaseConfig.apiKey) {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        auth = firebase.auth();
        firebaseInitialized = true;
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase config is missing. Running in offline mode.");
}

export { db, auth, firebaseInitialized };
