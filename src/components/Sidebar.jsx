import { NavLink, Link, useNavigate } from 'react-router-dom';
const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const NAV_ADMIN = [
  { section: 'Platform', items: [
    { to:'/dashboard',        label:'Admin Dashboard'     },
    { to:'/bookings',         label:'All Bookings'        },
    { to:'/applications',     label:'Applications'        },
    { to:'/analytics',        label:'Analytics'           },
    { to:'/subscription',     label:'Subscriptions'       },
  ]},
  { section: 'Media', items: [
    { to:'/media',            label:'Media Inventory'     },
    { to:'/create-media',     label:'Add Media'           },
    { to:'/admin/inventory',  label:'Inventory Manager'   },
    { to:'/campaigns',        label:'Campaigns'           },
  ]},
  { section: 'Tools', items: [
    { to:'/create-booking',   label:'Create Campaign'     },
    { to:'/social-media',     label:'Social & Music'      },
    { to:'/brief-generator',  label:'Brief Generator'     },
  ]},
];

const NAV_CLIENT = [
  { section: 'Campaigns', items: [
    { to:'/dashboard',            label:'Dashboard'           },
    { to:'/create-booking',       label:'New Campaign'        },
    { to:'/campaigns',            label:'My Campaigns'        },
    { to:'/bookings',             label:'My Bookings'         },
    { to:'/social-media',         label:'Social & Music'      },
  ]},
  { section: 'Tools', items: [
    { to:'/media',                label:'Media Inventory'     },
    { to:'/brief-generator',      label:'Brief Generator'     },
    { to:'/proof-of-performance', label:'Proof of Performance'},
    { to:'/analytics',            label:'Analytics'           },
    { to:'/assistant',            label:'Campaign Assistant'  },
  ]},
  { section: 'Account', items: [
    { to:'/subscription',         label:'Plans & Pricing'     },
  ]},
];

const NAV_PROVIDER = [
  { section: 'Dashboard', items: [
    { to:'/provider',             label:'My Bookings'         },
    { to:'/inventory',            label:'My Inventory'        },
    { to:'/proof-of-performance', label:'Proof of Performance'},
  ]},
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout }           = useAuth();
  const { isPremium, isPro }       = useSubscription();
  const navigate                   = useNavigate();
  const role                       = (user?.role || 'CLIENT').toUpperCase();
  const NAV                        = role === 'ADMIN' ? NAV_ADMIN : role === 'PROVIDER' ? NAV_PROVIDER : NAV_CLIENT;
  const close                      = () => setMobileOpen(false);
  const initial                    = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const displayName                = user?.name || user?.email?.split('@')[0] || 'User';

  const content = (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* Logo */}
      <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid var(--border)' }}>
        <Link to={role==='PROVIDER'?'/provider':role==='ADMIN'?'/dashboard':'/dashboard'} style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <img src={LOGO} alt="BrandCasta" style={{ width:24, height:24, objectFit:"contain" }}/>
          <div>
            <div style={{ display:'flex' }}>
              <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:14, color:'var(--text)', letterSpacing:'-0.2px' }}>Brand</span>
              <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:14, letterSpacing:'-0.2px', background:'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Casta</span>
            </div>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginTop:1 }}>{role}</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
        {NAV.map(group => (
          <div key={group.section} style={{ marginBottom:4 }}>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, fontWeight:500, color:'var(--text4)', textTransform:'uppercase', letterSpacing:'0.16em', padding:'10px 16px 4px' }}>
              {group.section}
            </div>
            {group.items.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                onClick={close}
                style={{ padding:'7px 16px', fontSize:12 }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:'currentColor', flexShrink:0, opacity:0.5 }}/>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ borderTop:'1px solid var(--border)', padding:'12px 14px' }}>

        {/* Upgrade card — clients only */}
        {role === 'CLIENT' && !isPremium && !isPro && (
          <div style={{ marginBottom:12, padding:'12px 14px', background:'var(--amber-dim)', border:'1px solid var(--amber-border)' }}>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>
              Upgrade to Pro
            </div>
            <p style={{ fontSize:11, color:'var(--text3)', lineHeight:1.5, marginBottom:10 }}>
              Unlock AI tools, analytics and campaign intelligence.
            </p>
            <Link to="/subscription" onClick={close}
              style={{ display:'block', textAlign:'center', padding:'7px', background:'var(--amber)', color:'#0a0a0f', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', transition:'background 0.2s' }}>
              View Plans →
            </Link>
          </div>
        )}

        {/* Active plan badge */}
        {role === 'CLIENT' && (isPremium || isPro) && (
          <div style={{ marginBottom:12, padding:'8px 12px', background:'var(--amber-dim)', border:'1px solid var(--amber-border)' }}>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase' }}>
              {isPro ? '◈ Pro Plan Active' : '◈ Premium Plan Active'}
            </div>
          </div>
        )}

        {/* User row */}
        <div style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', padding:'6px 0' }}
          onClick={async () => { await logout(); navigate('/'); close(); }}>
          <div style={{ width:26, height:26, background:'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#0a0a0f', flexShrink:0, fontFamily:'Manrope,sans-serif' }}>
            {initial}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayName}</div>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.06em' }}>Sign out</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside style={{ width:210, height:'100vh', position:'sticky', top:0, flexShrink:0, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)' }} onClick={close}/>
          <aside style={{ position:'absolute', left:0, top:0, bottom:0, width:220, background:'var(--bg2)', borderRight:'1px solid var(--border)', zIndex:201, display:'flex', flexDirection:'column' }}>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}