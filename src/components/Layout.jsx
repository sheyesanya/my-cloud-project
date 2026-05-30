import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Topbar */}
        <header style={{ padding:'14px 28px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(10,10,15,0.95)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50, gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Hamburger */}
            <button onClick={() => setMobileOpen(true)}
              style={{ background:'none', border:'none', color:'var(--text3)', fontSize:18, padding:0, lineHeight:1, display:'none' }}
              className="md:hidden">☰</button>
            <div>
              {subtitle && (
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:3 }}>
                  {subtitle}
                </div>
              )}
              {title && (
                <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:18, color:'var(--text)', letterSpacing:'-0.3px', margin:0 }}>
                  {title}
                </h1>
              )}
            </div>
          </div>
          {actions && (
            <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
              {actions}
            </div>
          )}
        </header>

        {/* Content */}
        <main style={{ flex:1, padding:'24px 28px' }} className="page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}