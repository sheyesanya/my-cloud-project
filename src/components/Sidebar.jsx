import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const NAV_ADMIN = [
  { to:'/dashboard',        label:'Admin Dashboard'       },
  { to:'/media',            label:'Media Inventory'       },
  { to:'/create-media',     label:'Add Media'             },
  { to:'/create-booking',   label:'Create Campaign'       },
  { to:'/campaigns',        label:'Campaigns'             },
  { to:'/bookings',         label:'Bookings'              },
  { to:'/applications',     label:'Provider Applications' },
  { to:'/admin/inventory',  label:'Inventory Manager'     },
  { to:'/analytics',        label:'Analytics'             },
  { to:'/social-media',     label:'Social-Media & Music'  },
  { to:'/subscription',     label:'Subscriptions'         },
];

const NAV_CLIENT = [
  { to:'/dashboard',            label:'Dashboard'                    },
  { to:'/media',                label:'Media Inventory'              },
  { to:'/create-booking',       label:'Create Campaign'              },
  { to:'/campaigns',            label:'My Campaigns'                 },
  { to:'/social-media',         label:'Social-Media & Music Marketing'},
  { to:'/bookings',             label:'My Bookings'                  },
  { to:'/brief-generator',      label:'Brief Generator'              },
  { to:'/proof-of-performance', label:'Proof of Performance'         },
  { to:'/analytics',            label:'Analytics'                    },
];

const NAV_PROVIDER = [
  { to:'/provider',             label:'My Bookings'          },
  { to:'/inventory',            label:'My Inventory'         },
  { to:'/proof-of-performance', label:'Proof of Performance' },
];

// Providers don't see subscription upgrade cards

const ROLE_META = {
  ADMIN:    { label:'Admin',          color:'#fcd34d' },
  CLIENT:   { label:'Brand',          color:'#a5b4fc' },
  PROVIDER: { label:'Media Provider', color:'#5eead4' },
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth();
  const subCtx      = useSubscription();
  const isPremium   = subCtx?.isPremium    ?? false;
  const tier        = subCtx?.tier         ?? 'FREE';
  const subscription = subCtx?.subscription ?? null;
  const subDaysLeft = subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt) - new Date()) / (1000*60*60*24)))
    : 0;

  const role     = (user?.role || 'CLIENT').toUpperCase();
  const meta     = ROLE_META[role] || ROLE_META.CLIENT;
  const NAV      = role === 'ADMIN' ? NAV_ADMIN : role === 'PROVIDER' ? NAV_PROVIDER : NAV_CLIENT;
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'A';

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-56 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background:'var(--bg-surface)', borderRight:'1px solid var(--border)' }}
      >
        {/* Logo */}
        <div style={{ padding:'22px 18px 18px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:36, height:36, objectFit:'contain', flexShrink:0 }}/>
            <div>
              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'white', letterSpacing:'-0.3px', lineHeight:1.1 }}>BrandCasta</p>
              <p style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginTop:3 }}>Campaign Ops</p>
            </div>
            <button className="lg:hidden ml-auto text-slate-400 text-lg" onClick={() => setMobileOpen(false)}>✕</button>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:`${meta.color}18`, color:meta.color, border:`1px solid ${meta.color}35` }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:meta.color }}/>
            {meta.label}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
          <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', padding:'0 10px', marginBottom:10 }}>
            Workspace
          </p>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span style={{ width:6, height:6, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#6366f1,#a855f7)', opacity:0.6 }}/>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Subscription badge */}
        {isPremium && role !== 'PROVIDER' && (
          <div style={{ margin:'0 12px 8px', padding:'10px 14px', borderRadius:10, background: tier==='PRO' ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)', border: tier==='PRO' ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:10, fontWeight:800, color: tier==='PRO' ? '#fcd34d' : '#a5b4fc', textTransform:'uppercase', letterSpacing:'0.08em' }}>{tier}</span>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{subDaysLeft}d left</span>
            </div>
            <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${Math.min(100,(subDaysLeft/(tier==='PRO'?31:15))*100)}%`, background: tier==='PRO' ? '#f59e0b' : 'linear-gradient(90deg,#6366f1,#a855f7)', borderRadius:2, transition:'width 0.3s' }}/>
            </div>
          </div>
        )}
        {!isPremium && role !== 'PROVIDER' && (
          <div style={{ margin:'0 12px 8px', display:'flex', flexDirection:'column', gap:6 }}>
            <Link
              to="/subscription?plan=PREMIUM"
              onClick={() => setMobileOpen(false)}
              style={{ padding:'9px 12px', borderRadius:10, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}
            >
              <div style={{ flex:1 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#a5b4fc', marginBottom:1 }}>Premium</p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>₦25,000 / 15 days</p>
              </div>
              <span style={{ fontSize:10, color:'#a5b4fc', fontWeight:700 }}>→</span>
            </Link>
            <Link
              to="/subscription?plan=PRO"
              onClick={() => setMobileOpen(false)}
              style={{ padding:'9px 12px', borderRadius:10, background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}
            >
              <div style={{ flex:1 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#fcd34d', marginBottom:1 }}>Pro</p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>₦45,000 / 31 days</p>
              </div>
              <span style={{ fontSize:10, color:'#fcd34d', fontWeight:700 }}>→</span>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'white' }}>
              {initials}
            </div>
            <div style={{ overflow:'hidden' }}>
              <p style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.75)', lineHeight:1.2 }}>{user?.name || 'User'}</p>
              <p style={{ fontSize:10, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, fontSize:12, fontWeight:500, background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.15)', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}