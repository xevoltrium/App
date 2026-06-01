
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Initialize services only if config is valid to prevent crashes
  if (!auth) {
    try {
      if (firebaseConfig.apiKey) {
        auth = getAuth(app);
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
