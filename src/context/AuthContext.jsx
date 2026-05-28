import { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    // Handle redirect result from Google sign-in
    getRedirectResult(auth).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token         = await firebaseUser.getIdToken();
        const idTokenResult = await firebaseUser.getIdTokenResult();
        let role = idTokenResult.claims?.role ?? 'CLIENT';

        // If role is CLIENT, check if they have an approved provider application
        // This handles providers who signed up AFTER being approved
        if (role === 'CLIENT') {
          try {
            const token = idTokenResult.token;
            const checkRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/check-provider`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const checkData = await checkRes.json();
            if (checkData.role === 'PROVIDER') {
              // Force token refresh to get new claim
              const refreshed = await fbUser.getIdTokenResult(true);
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

  const login          = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup         = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const loginWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (e) {
      // If popup blocked by COOP policy, fall back to redirect
      if (e.code === 'auth/popup-blocked' || e.message?.includes('Cross-Origin')) {
        return signInWithRedirect(auth, googleProvider);
      }
      throw e;
    }
  };
  const logout         = ()                => signOut(auth);
  const resetPassword  = (email)           => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }