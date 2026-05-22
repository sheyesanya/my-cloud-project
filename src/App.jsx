import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }     from './context/AuthContext';
import ProtectedRoute       from './components/ProtectedRoute';
import RoleRoute            from './components/RoleRoute';

// Public
import Login                from './pages/Login';
import RegisterClient       from './pages/RegisterClient';
import RegisterProvider     from './pages/RegisterProvider';
import Terms               from './pages/Terms';
import Privacy             from './pages/Privacy';

// Shared
import Dashboard            from './pages/Dashboard';
import Media                from './pages/Media';
import Bookings             from './pages/Bookings';
import CreateBooking        from './pages/CreateBooking';
import CreateMedia          from './pages/CreateMedia';
import Campaigns            from './pages/Campaigns';
import CampaignDetails      from './pages/CampaignDetails';
import Analytics            from './pages/Analytics';

// Admin only
import AdminApplications    from './pages/AdminApplications';
import ProviderInventory   from './pages/ProviderInventory';
import BriefGenerator      from './pages/BriefGenerator';
import Subscription        from './pages/Subscription';
import PremiumGate         from './components/PremiumGate';
import { SubscriptionProvider } from './context/SubscriptionContext';
import ProofOfPerformance  from './pages/ProofOfPerformance';

// Provider only
import ProviderDashboard    from './pages/ProviderDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
        <Routes>
          <Route path="/"                    element={<Navigate to="/dashboard" replace />} />

          {/* Public */}
          <Route path="/login"               element={<Login />} />
          <Route path="/register"            element={<Navigate to="/register/client" replace />} />
          <Route path="/register/client"     element={<RegisterClient />} />
          <Route path="/register/provider"   element={<RegisterProvider />} />
          <Route path="/terms"               element={<Terms />} />
          <Route path="/privacy"             element={<Privacy />} />

          {/* Protected — all logged-in users */}
          <Route path="/dashboard"           element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/media"               element={<ProtectedRoute><Media /></ProtectedRoute>} />
          <Route path="/bookings"            element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/campaigns"           element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/:campaignId" element={<ProtectedRoute><CampaignDetails /></ProtectedRoute>} />
          <Route path="/create-booking"      element={<ProtectedRoute><CreateBooking /></ProtectedRoute>} />
          <Route path="/analytics"           element={<ProtectedRoute><PremiumGate requiredTier="PREMIUM"><Analytics /></PremiumGate></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/create-media"        element={<RoleRoute role="ADMIN"><CreateMedia /></RoleRoute>} />
          <Route path="/applications"        element={<RoleRoute role="ADMIN"><AdminApplications /></RoleRoute>} />
          <Route path="/admin/inventory"     element={<RoleRoute role="ADMIN"><ProviderInventory /></RoleRoute>} />
          <Route path="/inventory"           element={<RoleRoute role={['ADMIN','PROVIDER']}><ProviderInventory /></RoleRoute>} />

          {/* Provider (+ admin can view) */}
          <Route path="/provider"            element={<RoleRoute role={['ADMIN','PROVIDER']}><ProviderDashboard /></RoleRoute>} />

          <Route path="/subscription"        element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/brief-generator"     element={<ProtectedRoute><PremiumGate requiredTier="PRO"><BriefGenerator /></PremiumGate></ProtectedRoute>} />
          <Route path="/proof-of-performance" element={<ProtectedRoute><PremiumGate requiredTier="PREMIUM"><ProofOfPerformance /></PremiumGate></ProtectedRoute>} />
          <Route path="*"                    element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}