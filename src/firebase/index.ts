
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Initialize services with extreme caution to prevent "invalid-api-key" from blocking the UI
  if (!auth) {
    try {
      // Only try to getAuth if there's something that looks like an API key
      if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "" && !firebaseConfig.apiKey.includes("YOUR_")) {
        auth = getAuth(app);
      } else {
        console.warn("Firebase Auth: No valid API Key found. Authentication features will be disabled.");
      }
    } catch (e) {
      console.error("Firebase Auth initialization failed:", e);
    }
  }
  
  if (!db) {
    try {
      db = getFirestore(app);
    } catch (e) {
      console.error("Firestore initialization failed:", e);
    }
  }
  
  return { app, auth, db };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
