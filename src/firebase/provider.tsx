'use client';

import React from 'react';

export const useFirebase = () => ({ app: null, auth: null, db: null });
export const useAuth = () => null;
export const useFirestore = () => null;

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
