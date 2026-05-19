// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import {

  onAuthStateChanged,

  signInWithEmailAndPassword,

  createUserWithEmailAndPassword,

  signInWithPopup,

  signOut,

  sendPasswordResetEmail

} from 'firebase/auth';

import {

  auth,

  googleProvider

} from '../lib/firebase';

const AuthContext =
  createContext();

export function AuthProvider({
  children
}) {

  const [user, setUser]
    = useState(null);

  const [loading, setLoading]
    = useState(true);

  useEffect(() => {

    const unsub =
      onAuthStateChanged(

        auth,

        async (firebaseUser) => {

          if (firebaseUser) {

            const token =
              await firebaseUser.getIdToken();

            setUser({

              uid:
                firebaseUser.uid,

              email:
                firebaseUser.email,

              name:
                firebaseUser.displayName,

              photo:
                firebaseUser.photoURL,

              token,
            });

          } else {

            setUser(null);
          }

          setLoading(false);
        }
      );

    return () => unsub();

  }, []);

  // ─────────────────────────────
  // Email Login
  // ─────────────────────────────

  const login =
    async (email, password) => {

      return signInWithEmailAndPassword(

        auth,

        email,

        password
      );
    };

  // ─────────────────────────────
  // Signup
  // ─────────────────────────────

  const signup =
    async (email, password) => {

      return createUserWithEmailAndPassword(

        auth,

        email,

        password
      );
    };

  // ─────────────────────────────
  // Google Login
  // ─────────────────────────────

  const loginWithGoogle =
    async () => {

      return signInWithPopup(

        auth,

        googleProvider
      );
    };

  // ─────────────────────────────
  // Logout
  // ─────────────────────────────

  const logout =
    async () => {

      return signOut(auth);
    };

  // ─────────────────────────────
  // Reset Password
  // ─────────────────────────────

  const resetPassword =
    async (email) => {

      return sendPasswordResetEmail(

        auth,

        email
      );
    };

  const value = {

    user,

    loading,

    login,

    signup,

    logout,

    resetPassword,

    loginWithGoogle,
  };

  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>
  );
}

export function useAuth() {

  return useContext(
    AuthContext
  );
}