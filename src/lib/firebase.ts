// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp, Timestamp } from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(cfg);
const db = getFirestore(app);
const auth = getAuth(app);

/** Sign in anonymously if not already */
export async function signIn() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

export { db, serverTimestamp, Timestamp, auth, onAuthStateChanged, FirebaseUser };
