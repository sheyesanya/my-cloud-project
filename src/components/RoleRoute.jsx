import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './UI';

export default function RoleRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background:'var(--bg-base)' }}>
        <div className="flex items-center gap-3">
          <Spinner size={18}/>
          <p style={{ color:'var(--text-secondary)', fontWeight:600 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const allowed  = Array.isArray(role) ? role : [role];
  const userRole = (user.role || 'CLIENT').toUpperCase();

  if (!allowed.includes(userRole)) {
    const redirects = { ADMIN:'/dashboard', PROVIDER:'/provider', CLIENT:'/dashboard' };
    return <Navigate to={redirects[userRole] || '/dashboard'} replace />;
  }

  return children;
}