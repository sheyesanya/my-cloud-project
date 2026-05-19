import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Media          from './pages/Media';
import Bookings       from './pages/Bookings';
import CreateBooking  from './pages/CreateBooking';
import CreateMedia    from './pages/CreateMedia';
import Campaigns      from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import Analytics      from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/media"          element={<ProtectedRoute><Media /></ProtectedRoute>} />
          <Route path="/bookings"       element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/campaigns"      element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/:campaignId" element={<ProtectedRoute><CampaignDetails /></ProtectedRoute>} />
          <Route path="/create-booking" element={<ProtectedRoute><CreateBooking /></ProtectedRoute>} />
          <Route path="/create-media"   element={<ProtectedRoute><CreateMedia /></ProtectedRoute>} />
          <Route path="/analytics"      element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
