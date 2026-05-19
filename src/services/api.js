import axios from 'axios';
import { auth } from '../lib/firebase';

/* =========================================================
API CONFIG
========================================================= */

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

/* =========================================================
REQUEST INTERCEPTOR — attach Firebase token automatically
========================================================= */

api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    // getIdToken(true) refreshes if expired; false uses cache
    const token = await currentUser.getIdToken(false);
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/* =========================================================
RESPONSE INTERCEPTOR
========================================================= */

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

/* =========================================================
ANALYTICS
========================================================= */

export const getAnalytics = () => api.get('/analytics').then((r) => r.data);

/* =========================================================
MEDIA
========================================================= */

export const getMedia    = ()        => api.get('/media').then((r) => r.data);
export const createMedia = (payload) => api.post('/media', payload).then((r) => r.data);

/* =========================================================
BOOKINGS
========================================================= */

export const getBookings    = ()                    => api.get('/bookings').then((r) => r.data);
export const createBooking  = (payload)             => api.post('/bookings', payload).then((r) => r.data);
export const updateBooking  = (bookingId, payload)  => api.patch(`/bookings/${bookingId}`, payload).then((r) => r.data);

/* =========================================================
CAMPAIGNS
========================================================= */

export const createCampaign    = (payload)    => api.post('/campaigns', payload).then((r) => r.data);
export const getCampaigns      = ()           => api.get('/campaigns').then((r) => r.data);
export const getCampaignDetails = (campaignId) => api.get(`/campaigns/${campaignId}`).then((r) => r.data);

/* =========================================================
DELIVERY PROOFS
========================================================= */

export const uploadDeliveryProof = (payload)    => api.post('/bookings/proof', payload).then((r) => r.data);
export const approveDelivery     = (bookingId)  => api.post('/bookings/approve-delivery', { bookingId }).then((r) => r.data);
export const markProviderPaid    = (bookingId)  => api.post('/bookings/mark-paid', { bookingId }).then((r) => r.data);

/* =========================================================
FILE UPLOADS
========================================================= */

export const getUploadUrl = (payload) => api.post('/uploads/url', payload).then((r) => r.data);

export const uploadFileToS3 = async (file) => {
  if (!file) throw new Error('No file provided');

  // 1. Get signed URL
  const { uploadUrl, fileUrl } = await getUploadUrl({
    fileName: file.name,
    fileType: file.type,
  });

  // 2. Upload directly to S3 (no auth header — S3 signed URL)
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  });

  return { fileName: file.name, fileType: file.type, fileSize: file.size, fileUrl };
};

export const uploadMultipleFiles = async (files = []) => {
  if (!files.length) return [];
  const results = [];
  for (const file of files) {
    results.push(await uploadFileToS3(file));
  }
  return results;
};

/* =========================================================
HELPERS
========================================================= */

export const healthCheck = () => api.get('/health').then((r) => r.data);

export default api;
