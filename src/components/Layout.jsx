import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#faf8ff'}}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <header style={{height:56,background:'white',borderBottom:'1px solid #e1e4f0',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:30,gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={()=>setMobileOpen(true)} style={{background:'none',border:'none',cursor:'pointer',color:'#464554',padding:4,display:'flex'}}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div>
              {subtitle && <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#4338ca',marginBottom:2}}>{subtitle}</div>}
              {title    && <h1 style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:16,color:'#131b2e',margin:0,letterSpacing:'-0.3px'}}>{title}</h1>}
            </div>
          </div>
          {actions && <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>{actions}</div>}
        </header>
        <main style={{flex:1,padding:24,overflowX:'hidden'}}>{children}</main>
      </div>
    </div>
  );
}