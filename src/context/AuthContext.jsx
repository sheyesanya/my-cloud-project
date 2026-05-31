import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup,
  signInWithRedirect, getRedirectResult,
  signOut, sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const popupInProgress       = useRef(false);

  useEffect(() => {
    // Handle redirect result — catches post-redirect Google sign-in
    getRedirectResult(auth).catch(e => {
      if (e.code !== 'auth/no-current-user') console.log('Redirect result:', e.message);
    });

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token         = await firebaseUser.getIdToken();
        const idTokenResult = await firebaseUser.getIdTokenResult();
        let role            = idTokenResult.claims?.role ?? 'CLIENT';

        // Check if CLIENT user has an approved provider application
        if (role === 'CLIENT') {
          try {
            const checkRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-provider`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const checkData = await checkRes.json();
            if (checkData.role === 'PROVIDER') {
              const refreshed = await firebaseUser.getIdTokenResult(true);
              role = refreshed.claims?.role ?? 'PROVIDER';
            }
          } catch(e) { console.log('Provider check (non-fatal):', e.message); }
        }

        setUser({
          uid:   firebaseUser.uid,
          email: firebaseUser.email,
          name:  firebaseUser.displayName,
          photo: firebaseUser.photoURL,
          token,
          role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login  = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    // Prevent double-firing if a popup is already open
    if (popupInProgress.current) return null;
    popupInProgress.current = true;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (e) {
      // User closed the popup deliberately — not an error
      if (e.code === 'auth/popup-closed-by-user') return null;
      // A second popup was requested before the first resolved — ignore
      if (e.code === 'auth/cancelled-popup-request') return null;
      // Popup blocked by browser — fall back to redirect
      if (e.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw e;
    } finally {
      popupInProgress.current = false;
    }
  };

  const logout        = ()      => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }