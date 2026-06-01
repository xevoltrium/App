
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
    // If apiKey is missing, initializeApp might still run but auth/db will fail later.
    // We provide the config and let Firebase SDK handle the validation.
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Initialize services lazily or once
  if (!auth) auth = getAuth(app);
  if (!db) db = getFirestore(app);
  
  return { app, auth, db };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
