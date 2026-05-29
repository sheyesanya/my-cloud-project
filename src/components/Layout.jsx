import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ padding: '14px 24px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,7,14,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger */}
            <button onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, padding: 0, display: 'none', lineHeight: 1 }}
              className="md:hidden" aria-label="Open menu">☰</button>
            <div>
              {title && <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.3px', margin: 0 }}>{title}</h1>}
              {subtitle && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, marginTop: 1 }}>{subtitle}</p>}
            </div>
          </div>
          {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{actions}</div>}
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '22px 24px', maxWidth: 1200 }} className="page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}