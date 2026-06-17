import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const popupRef              = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let token  = await firebaseUser.getIdToken();
          let claims = await firebaseUser.getIdTokenResult();
          let role   = (claims.claims.role || 'CLIENT').toUpperCase();

          if (role === 'CLIENT') {
            try {
              const checkRes = await axios.post(
                `${API}/auth/check-provider`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (checkRes.data?.role === 'PROVIDER') {
                token  = await firebaseUser.getIdToken(true);
                claims = await firebaseUser.getIdTokenResult();
                role   = (claims.claims.role || 'CLIENT').toUpperCase();
              }
            } catch (e) {
              console.error('check-provider failed:', e.message);
            }
          }

          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role });
        } catch (e) {
          console.error('Auth init failed:', e.message);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'CLIENT' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    if (popupRef.current) return null;
    popupRef.current = true;
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      return result;
    } finally {
      popupRef.current = false;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);