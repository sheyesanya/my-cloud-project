import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { NotificationProvider } from './context/NotificationContext';

import Login              from './pages/Login';
import Dashboard          from './pages/Dashboard';
import Bookings           from './pages/Bookings';
import Campaigns          from './pages/Campaigns';
import CreateBooking      from './pages/CreateBooking';
import Media              from './pages/Media';
import Analytics          from './pages/Analytics';
import BriefGenerator     from './pages/BriefGenerator';
import CampaignAssistant  from './pages/CampaignAssistant';
import ProofOfPerformance from './pages/ProofOfPerformance';
import Subscription       from './pages/Subscription';
import ProviderDashboard  from './pages/ProviderDashboard';
import AdminDashboard     from './pages/AdminDashboard';
import AdminApplications  from './pages/AdminApplications';
import RegisterProvider   from './pages/RegisterProvider';
import Waitlist           from './pages/Waitlist';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',fontFamily:'IBM Plex Mono,monospace',fontSize:12,color:'#464554'}}>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes((user.role||'CLIENT').toUpperCase())) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',fontFamily:'IBM Plex Mono,monospace',fontSize:12,color:'#464554'}}>Loading...</div>;

  return (
    <Routes>
      <Route path="/"                  element={user ? <Navigate to="/dashboard" replace/> : <Login/>}/>
      <Route path="/register/provider" element={<RegisterProvider/>}/>
      <Route path="/waitlist"          element={<Waitlist/>}/>

      {/* Client routes */}
      <Route path="/dashboard"  element={<Protected><Dashboard/></Protected>}/>
      <Route path="/bookings"   element={<Protected><Bookings/></Protected>}/>
      <Route path="/campaigns"  element={<Protected><Campaigns/></Protected>}/>
      <Route path="/create-booking" element={<Protected><CreateBooking/></Protected>}/>
      <Route path="/media"      element={<Protected><Media/></Protected>}/>
      <Route path="/analytics"  element={<Protected><Analytics/></Protected>}/>
      <Route path="/brief-generator" element={<Protected><BriefGenerator/></Protected>}/>
      <Route path="/assistant"  element={<Protected><CampaignAssistant/></Protected>}/>
      <Route path="/proof"      element={<Protected><ProofOfPerformance/></Protected>}/>
      <Route path="/subscription" element={<Protected><Subscription/></Protected>}/>

      {/* Provider routes */}
      <Route path="/provider"   element={<Protected roles={['PROVIDER','ADMIN']}><ProviderDashboard/></Protected>}/>

      {/* Admin routes */}
      <Route path="/admin"         element={<Protected roles={['ADMIN']}><AdminDashboard/></Protected>}/>
      <Route path="/applications"  element={<Protected roles={['ADMIN']}><AdminApplications/></Protected>}/>

      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <NotificationProvider>
            <AppRoutes/>
          </NotificationProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}