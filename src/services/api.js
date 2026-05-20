import axios from 'axios';
import { auth } from '../lib/firebase';

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Attach Firebase token to every request
api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken(false);
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Normalise error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error   ||
      error?.message                 ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

/* ── Analytics ─────────────────────────────────────── */
export const getAnalytics    = ()        => api.get('/analytics').then(r => r.data);

/* ── Media ──────────────────────────────────────────── */
export const getMedia        = ()        => api.get('/media').then(r => r.data);
export const createMedia     = (payload) => api.post('/media', payload).then(r => r.data);

/* ── Bookings ───────────────────────────────────────── */
export const getBookings     = ()                   => api.get('/bookings').then(r => r.data);
export const createBooking   = (payload)            => api.post('/bookings', payload).then(r => r.data);
export const updateBooking   = (bookingId, payload) => api.patch(`/bookings/${bookingId}`, payload).then(r => r.data);

/* ── Delivery Proofs ────────────────────────────────── */
export const uploadDeliveryProof = (payload)   => api.post('/bookings/proof', payload).then(r => r.data);
export const approveDelivery     = (bookingId) => api.post('/bookings/approve-delivery', { bookingId }).then(r => r.data);
export const markProviderPaid    = (bookingId) => api.post('/bookings/mark-paid', { bookingId }).then(r => r.data);

/* ── Campaigns ──────────────────────────────────────── */
export const createCampaign    = (payload)     => api.post('/campaigns', payload).then(r => r.data);
export const getCampaigns      = ()            => api.get('/campaigns').then(r => r.data);
export const getCampaignDetails = (campaignId) => api.get(`/campaigns/${campaignId}`).then(r => r.data);

/* ── Providers ──────────────────────────────────────── */
export const applyAsProvider      = (payload)       => api.post('/providers/apply', payload).then(r => r.data);
export const getProviders         = ()              => api.get('/providers').then(r => r.data);
export const updateProviderStatus = (id, payload)   => api.patch(`/providers/${id}`, payload).then(r => r.data);

/* ── Users ──────────────────────────────────────────── */
export const registerUser    = (payload)            => api.post('/register', payload).then(r => r.data);

/* ── Payments ───────────────────────────────────────── */
export const initializePayment = (payload)          => api.post('/payments/initialize', payload).then(r => r.data);
export const verifyPayment     = (reference)        => api.get(`/payments/verify?reference=${reference}`).then(r => r.data);

/* ── File Uploads ───────────────────────────────────── */
export const getUploadUrl = (payload) => api.post('/uploads/url', payload).then(r => r.data);

export const uploadFileToS3 = async (file) => {
  if (!file) throw new Error('No file provided');
  const { uploadUrl, fileUrl } = await getUploadUrl({ fileName: file.name, fileType: file.type });
  await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });
  return { fileName: file.name, fileType: file.type, fileSize: file.size, fileUrl };
};

export const uploadMultipleFiles = async (files = []) => {
  if (!files.length) return [];
  const results = [];
  for (const file of files) results.push(await uploadFileToS3(file));
  return results;
};

/* ── Health ─────────────────────────────────────────── */
export const healthCheck = () => api.get('/health').then(r => r.data);

export default api;