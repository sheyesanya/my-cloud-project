import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user }                          = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const pollRef                           = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res   = await axios.get(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = Array.isArray(res.data) ? res.data : res.data?.notifications ?? [];
      setNotifications(data);
      setUnread(data.filter(n => !n.read).length);
    } catch {}
  }, [user]);

  const markRead = async (id) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.patch(`${API}/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.patch(`${API}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.delete(`${API}/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const removed = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (removed && !removed.read) setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  useEffect(() => {
    if (!user) { setNotifications([]); setUnread(0); return; }
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollRef.current);
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unread, fetchNotifications, markRead, markAllRead, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);