import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const NAV_ADMIN = [
  { section: 'Platform', items: [
    { to:'/dashboard',        icon:'⊞', label:'Admin Dashboard'    },
    { to:'/bookings',         icon:'◎', label:'All Bookings'       },
    { to:'/applications',     icon:'✓', label:'Applications'       },
    { to:'/analytics',        icon:'↗', label:'Analytics'          },
    { to:'/subscription',     icon:'◈', label:'Subscriptions'      },
  ]},
  { section: 'Media', items: [
    { to:'/media',            icon:'▦', label:'Media Inventory'    },
    { to:'/create-media',     icon:'+', label:'Add Media'          },
    { to:'/admin/inventory',  icon:'≡', label:'Inventory Manager'  },
    { to:'/campaigns',        icon:'◷', label:'Campaigns'          },
  ]},
  { section: 'Other', items: [
    { to:'/create-booking',   icon:'✦', label:'Create Campaign'    },
    { to:'/social-media',     icon:'♫', label:'Social & Music'     },
  ]},
];

const NAV_CLIENT = [
  { section: 'Campaigns', items: [
    { to:'/dashboard',            icon:'⊞', label:'Dashboard'           },
    { to:'/create-booking',       icon:'✦', label:'Create Campaign'     },
    { to:'/campaigns',            icon:'◷', label:'My Campaigns'        },
    { to:'/bookings',             icon:'◎', label:'My Bookings'         },
    { to:'/social-media',         icon:'♫', label:'Social & Music'      },
  ]},
  { section: 'Tools', items: [
    { to:'/media',                icon:'▦', label:'Media Inventory'     },
    { to:'/brief-generator',      icon:'✧', label:'Brief Generator'     },
    { to:'/proof-of-performance', icon:'✓', label:'Proof of Performance'},
    { to:'/analytics',            icon:'↗', label:'Analytics'           },
  ]},
];

const NAV_PROVIDER = [
  { section: 'Dashboard', items: [
    { to:'/provider',             icon:'⊞', label:'My Bookings'         },
    { to:'/inventory',            icon:'≡', label:'My Inventory'        },
    { to:'/proof-of-performance', icon:'✓', label:'Proof of Performance'},
  ]},
];

const NavSection = ({ section, items, onClick }) => (
  <div style={{ marginBottom: 6 }}>
    <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '10px 12px 4px' }}>
      {section}
    </p>
    {items.map(item => (
      <NavLink key={item.to} to={item.to}
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        onClick={onClick}
        style={{ marginBottom: 1 }}>
        <span style={{ fontSize: 12, width: 16, textAlign: 'center', flexShrink: 0, opacity: 0.7 }}>{item.icon}</span>
        {item.label}
      </NavLink>
    ))}
  </div>
);

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { isPremium, isPro, tier } = useSubscription();
  const navigate = useNavigate();
  const role = (user?.role || 'CLIENT').toUpperCase();

  const NAV = role === 'ADMIN' ? NAV_ADMIN : role === 'PROVIDER' ? NAV_PROVIDER : NAV_CLIENT;
  const close = () => setMobileOpen(false);

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 14px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
        <img src={LOGO} alt="BrandCasta" style={{ width: 26, height: 26, objectFit: 'contain' }}/>
        <div>
          <p style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 13.5, color: 'white', letterSpacing: '-0.2px' }}>BrandCasta</p>
          {role !== 'CLIENT' && (
            <span style={{ fontSize: 9, fontWeight: 600, color: role==='ADMIN'?'#a5b4fc':role==='PROVIDER'?'#5eead4':'#fcd34d', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              {role}
            </span>
          )}
        </div>
        {/* Mobile close */}
        <button onClick={close} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:18, display:'none' }} className="md:hidden">✕</button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
        {NAV.map(group => (
          <NavSection key={group.section} section={group.section} items={group.items} onClick={close}/>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ padding: '8px 10px 12px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>

        {/* Subscription badge / upgrade */}
        {role === 'CLIENT' && (
          isPremium || isPro ? (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: isPro ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)', border: `0.5px solid ${isPro ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}`, marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: isPro ? '#fcd34d' : '#a5b4fc' }}>{isPro ? '◈ Pro Plan' : '◈ Premium Plan'}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Active subscription</p>
            </div>
          ) : (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.07)', border: '0.5px solid rgba(99,102,241,0.18)', marginBottom: 8, textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 6, lineHeight: 1.5 }}>Unlock analytics & AI tools</p>
              <Link to="/subscription" onClick={close}
                style={{ display: 'block', padding: '6px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none', textAlign: 'center', fontFamily: 'Manrope,sans-serif' }}>
                Upgrade to Pro
              </Link>
            </div>
          )
        )}

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}
          onClick={async () => { await logout(); navigate('/'); close(); }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', flexShrink: 0 }}>
            {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Sign out</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar-bg" style={{ width: 210, height: '100vh', position: 'sticky', top: 0, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={close}/>
          <aside style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, background: '#09091a', borderRight: '0.5px solid rgba(255,255,255,0.08)', zIndex: 201, display: 'flex', flexDirection: 'column' }}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}