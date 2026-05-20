import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup,
  signOut, sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token         = await firebaseUser.getIdToken();
        const idTokenResult = await firebaseUser.getIdTokenResult();
        const role          = idTokenResult.claims?.role ?? 'CLIENT';
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
  const loginWithGoogle = ()               => signInWithPopup(auth, googleProvider);
  const logout         = ()                => signOut(auth);
  const resetPassword  = (email)           => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }