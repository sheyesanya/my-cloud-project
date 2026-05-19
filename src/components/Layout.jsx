import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, title, subtitle, actions }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Header */}
        <header
          className="sticky top-0 z-30 px-6 lg:px-8 py-4 flex items-center justify-between gap-4"
          style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <div>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 22, color: 'white', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.5 }}>{subtitle}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 px-6 lg:px-8 py-6 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}