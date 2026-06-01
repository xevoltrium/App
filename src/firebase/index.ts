
/**
 * Firebase dummy index to prevent import errors.
 * Firebase is disabled in favor of localStorage.
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
