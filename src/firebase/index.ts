
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
  
  if (!auth) {
    try {
      // Defensive check: only init auth if apiKey looks valid
      if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10) {
        auth = getAuth(app);
      }
    } catch (e) {
      console.warn("Firebase Auth could not be initialized:", e);
    }
  }
  
  if (!db) {
    try {
      db = getFirestore(app);
    } catch (e) {
      console.warn("Firestore could not be initialized:", e);
    }
  }
  
  return { app, auth, db };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
