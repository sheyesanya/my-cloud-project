import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard',      label: 'Dashboard'       },
  { to: '/media',          label: 'Media Inventory' },
  { to: '/create-media',   label: 'Add Media'       },
  { to: '/create-booking', label: 'Create Campaign' },
  { to: '/campaigns',      label: 'Campaigns'       },
  { to: '/bookings',       label: 'Bookings'        },
  { to: '/analytics',      label: 'Analytics'       },
];

const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779213802/Brandcasta_White_Logo_ojefvp.png';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'A';

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-56 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={WHITE_LOGO}
              alt="BrandCasta"
              style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }}
            />
            <div>
              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.1 }}>BrandCasta</p>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3 }}>Campaign Ops</p>
            </div>
            <button className="lg:hidden ml-auto text-slate-400 text-lg" onClick={() => setMobileOpen(false)}>x</button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 10 }}>
            Workspace
          </p>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#a855f7)', opacity: 0.6 }} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white' }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>{user?.name || 'Admin'}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}