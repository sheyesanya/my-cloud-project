import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { user }                      = useAuth();
  const [subscription, setSub]        = useState(null);
  const [loading, setLoading]         = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setSub(null); setLoading(false); return; }
    try {
      const token = await auth.currentUser?.getIdToken();
      const res   = await axios.get(`${API}/subscription`, { headers: { Authorization: `Bearer ${token}` } });
      setSub(res.data?.subscription || res.data || null);
    } catch { setSub(null); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const tier      = subscription?.tier?.toUpperCase() || 'FREE';
  const isPremium = tier === 'PREMIUM' || tier === 'PRO';
  const isPro     = tier === 'PRO';

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, isPremium, isPro, refetch: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);