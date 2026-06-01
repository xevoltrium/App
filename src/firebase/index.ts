/**
 * Firebase stubbed out to prevent API key errors.
 * Using localStorage for all app data.
 */
export function initializeFirebase() {
  return { app: null, auth: null, db: null };
}

export const FirebaseProvider = ({ children }: { children: any }) => children;
export const useAuth = () => null;
export const useFirestore = () => null;
export const useUser = () => ({ user: null, loading: false });
export const useCollection = () => ({ data: [], loading: false });
export const useDoc = () => ({ data: null, loading: false });
export const useFirebase = () => ({ app: null, auth: null, db: null });
export const useFirebaseApp = () => null;
