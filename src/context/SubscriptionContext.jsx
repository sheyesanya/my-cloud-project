import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const SubscriptionContext = createContext(null);

const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading]           = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    try {
      const headers = await authHeader();
      const res = await axios.get(`${API}/subscription`, { headers });
      setSubscription(res.data);
    } catch {
      setSubscription({ tier: 'FREE', status: 'INACTIVE', features: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  // Computed helpers
  const tier      = subscription?.tier || 'FREE';
  const isActive  = subscription?.status === 'ACTIVE' && new Date(subscription?.expiresAt) > new Date();
  const isPremium = isActive && (tier === 'PREMIUM' || tier === 'PRO');
  const isPro     = isActive && tier === 'PRO';
  const isFree    = !isPremium;

  const canAccess = (requiredTier) => {
    if (!requiredTier || requiredTier === 'FREE') return true;
    if (requiredTier === 'PREMIUM') return isPremium;
    if (requiredTier === 'PRO')     return isPro;
    return false;
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, tier, isActive, isPremium, isPro, isFree, canAccess, refetch: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);