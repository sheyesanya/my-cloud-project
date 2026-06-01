import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';

const NAV_CLIENT = [
  { section:'Campaigns', items:[
    { to:'/dashboard',        label:'Dashboard',          icon:'⊞' },
    { to:'/create-booking',   label:'New Campaign',       icon:'＋' },
    { to:'/campaigns',        label:'My Campaigns',       icon:'◫' },
    { to:'/bookings',         label:'My Bookings',        icon:'☰' },
    { to:'/social-marketing', label:'Social & Music',     icon:'♪' },
  ]},
  { section:'Tools', items:[
    { to:'/media',            label:'Media Inventory',    icon:'◉' },
    { to:'/brief-generator',  label:'Brief Generator',   icon:'✦' },
    { to:'/analytics',        label:'Analytics',         icon:'↗' },
    { to:'/assistant',        label:'AI Assistant',      icon:'◈' },
    { to:'/proof-of-performance', label:'Proof of Perf.', icon:'✓' },
  ]},
  { section:'Account', items:[
    { to:'/subscription',     label:'Plans & Pricing',   icon:'◎' },
  ]},
];

const NAV_PROVIDER = [
  { section:'Provider', items:[
    { to:'/provider',         label:'My Bookings',        icon:'⊞' },
    { to:'/inventory',        label:'My Inventory',       icon:'◫' },
    { to:'/proof-of-performance', label:'Proof of Perf.', icon:'✓' },
  ]},
];

const NAV_ADMIN = [
  { section:'Platform', items:[
    { to:'/dashboard',        label:'Admin Dashboard',    icon:'⊞' },
    { to:'/applications',     label:'Applications',       icon:'◫' },
    { to:'/admin/inventory',  label:'Inventory Manager',  icon:'☰' },
  ]},
  { section:'Finance', items:[
    { to:'/analytics',        label:'Analytics',          icon:'↗' },
  ]},
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { isPremium, isPro } = useSubscription();
  const navigate = useNavigate();
  const role = (user?.role || 'CLIENT').toUpperCase();
  const nav = role === 'ADMIN' ? NAV_ADMIN : role === 'PROVIDER' ? NAV_PROVIDER : NAV_CLIENT;
  const close = () => setMobileOpen(false);
  const homeRoute = role === 'PROVIDER' ? '/provider' : '/dashboard';

  const content = (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Logo */}
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <Link to={homeRoute} onClick={close} style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
          <img src={LOGO} alt="BrandCasta"
            style={{ width:28, height:28, objectFit:'contain', borderRadius:6, background:'#635bff', padding:2 }}
            onError={e=>{ e.target.style.display='none'; }}
          />
          <div style={{ display:'flex' }}>
            <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:15, color:'var(--text)' }}>Brand</span>
            <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:15, color:'#4d50d6' }}>Casta</span>
          </div>
        </Link>
        <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:4 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'block', flexShrink:0 }}/>
          <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--text3)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{role}</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px 10px', scrollbarWidth:'none' }}>
        {nav.map(group => (
          <div key={group.section} style={{ marginBottom:20 }}>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:600, color:'var(--text4)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 8px', marginBottom:4 }}>
              {group.section}
            </p>
            {group.items.map(item => (
              <NavLink key={item.to} to={item.to} onClick={close}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                <span style={{ fontSize:13, width:18, textAlign:'center', flexShrink:0, opacity:0.7 }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Upgrade banner — free users */}
      {!isPremium && !isPro && role === 'CLIENT' && (
        <div style={{ margin:'0 10px 10px', padding:'12px 14px', background:'linear-gradient(135deg,rgba(99,91,255,0.06),rgba(124,58,237,0.06))', border:'1px solid var(--accent-border)', borderRadius:8 }}>
          <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:12, color:'var(--text)', marginBottom:3 }}>Upgrade to Pro</p>
          <p style={{ fontSize:11, color:'var(--text3)', marginBottom:10, lineHeight:1.5 }}>Unlock AI tools, analytics and unlimited campaigns.</p>
          <Link to="/subscription" style={{ display:'block', textAlign:'center', padding:'7px', background:'var(--accent)', color:'white', borderRadius:5, fontSize:12, fontWeight:600, textDecoration:'none' }}>
            View Plans
          </Link>
        </div>
      )}

      {/* User / logout */}
      <div style={{ borderTop:'1px solid var(--border)', padding:'12px 14px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white', flexShrink:0 }}>
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'User'}</p>
            <p style={{ fontSize:11, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={()=>{ logout(); navigate('/'); }} title="Sign out"
            style={{ background:'none', border:'none', color:'var(--text4)', cursor:'pointer', fontSize:14, padding:4, transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--text4)'}>
            ⇥
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="desktop-sidebar" style={{ width:216, height:'100vh', position:'sticky', top:0, flexShrink:0, background:'white', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:300 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(10,37,64,0.4)', backdropFilter:'blur(4px)' }} onClick={close}/>
          <aside style={{ position:'absolute', left:0, top:0, bottom:0, width:240, background:'white', borderRight:'1px solid var(--border)', zIndex:301, display:'flex', flexDirection:'column', overflowY:'auto', boxShadow:'var(--shadow-lg)' }}>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}