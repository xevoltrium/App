
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
  
  // Defensive initialization to prevent 'invalid-api-key' crashes from blocking the UI
  if (!auth) {
    try {
      if (firebaseConfig.apiKey) {
        auth = getAuth(app);
      } else {
        console.warn("Firebase API Key is missing. Auth will be disabled.");
      }
    } catch (e) {
      console.warn("Firebase Auth initialization skipped/failed:", e);
    }
  }
  
  if (!db) {
    try {
      db = getFirestore(app);
    } catch (e) {
      console.warn("Firestore initialization failed:", e);
    }
  }
  
  return { app, auth, db };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
