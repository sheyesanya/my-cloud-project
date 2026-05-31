import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Topbar */}
        <header style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(7,7,15,0.97)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50, gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)}
              style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:4, display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
              <span style={{ display:'block', width:20, height:2, background:'var(--text3)', borderRadius:1 }}/>
              <span style={{ display:'block', width:20, height:2, background:'var(--text3)', borderRadius:1 }}/>
              <span style={{ display:'block', width:20, height:2, background:'var(--text3)', borderRadius:1 }}/>
            </button>
            <div>
              {subtitle && (
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:2 }}>
                  {subtitle}
                </div>
              )}
              {title && (
                <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, color:'var(--text)', letterSpacing:'-0.3px', margin:0 }}>
                  {title}
                </h1>
              )}
            </div>
          </div>
          {actions && (
            <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, flexWrap:'wrap' }}>
              {actions}
            </div>
          )}
        </header>

        {/* Content */}
        <main style={{ flex:1, padding:'20px', overflowX:'hidden' }} className="page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}