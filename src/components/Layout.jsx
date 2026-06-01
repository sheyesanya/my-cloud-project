import { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

export default function Layout({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg2)' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, maxWidth:'100%' }}>

        {/* Topbar */}
        <header style={{
          height:56, padding:'0 24px',
          background:'white',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          position:'sticky', top:0, zIndex:50, gap:12,
          boxShadow:'0 1px 0 var(--border)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            {/* Hamburger */}
            <button onClick={()=>setMobileOpen(true)}
              style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:6, display:'flex', flexDirection:'column', gap:4, flexShrink:0, borderRadius:4 }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <span style={{ display:'block', width:16, height:2, background:'currentColor', borderRadius:1 }}/>
              <span style={{ display:'block', width:16, height:2, background:'currentColor', borderRadius:1 }}/>
              <span style={{ display:'block', width:16, height:2, background:'currentColor', borderRadius:1 }}/>
            </button>
            <div style={{ minWidth:0 }}>
              {subtitle && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:1 }}>{subtitle}</p>}
              {title    && <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, color:'var(--text)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</h1>}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            {actions}
            <NotificationBell/>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:24, overflowX:'hidden' }} className="page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}