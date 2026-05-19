import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingBlock, ErrorBlock, StatCard } from '../components/UI';
import { getAnalytics } from '../services/api';

const fmt      = (n) => n == null ? '—' : typeof n === 'number' ? n.toLocaleString() : n;
const fmtMoney = (n) => n == null ? '—' : `₦${Number(n).toLocaleString('en-NG')}`;

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const res = await getAnalytics();
      if (typeof res === 'string' && res.includes('<!doctype html>'))
        throw new Error('Analytics endpoint returned HTML instead of JSON.');
      setData(res);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <Layout
      title="Dashboard"
      subtitle="Unified media intelligence and campaign performance"
      actions={
        <button onClick={fetchData} className="btn-secondary" style={{ fontSize:12 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
          Refresh
        </button>
      }
    >
      {loading && <LoadingBlock message="Fetching analytics…"/>}
      {error   && <ErrorBlock message={error} onRetry={fetchData}/>}

      {!loading && !error && data && (
        <div className="space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total Bookings"   value={fmt(data.totalBookings)}      sub="All campaigns created"    color="purple"/>
            <StatCard label="Revenue"          value={fmtMoney(data.totalRevenue)}  sub="Gross marketplace value"  color="teal"/>
            <StatCard label="Commission"       value={fmtMoney(data.totalCommission)} sub="Platform earnings"      color="amber"/>
          </div>

          {/* Secondary stats */}
          {(data.pendingBookings != null || data.activeBookings != null || data.completedBookings != null) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Pending"   value={fmt(data.pendingBookings)}   sub="Awaiting action"  color="amber"/>
              <StatCard label="Active"    value={fmt(data.activeBookings)}    sub="In flight"        color="purple"/>
              <StatCard label="Completed" value={fmt(data.completedBookings)} sub="Delivered"        color="green"/>
            </div>
          )}

          {/* Spend banner */}
          <div style={{ borderRadius: 'var(--radius-lg)', padding: '22px 28px', background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'rgba(165,180,252,0.7)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>Total Campaign Spend</p>
              <p style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:36, color:'white', letterSpacing:'-1px', lineHeight:1 }}>
                {fmtMoney(data.totalRevenue)}
              </p>
            </div>
            <div style={{ padding:'8px 16px', borderRadius:20, background:'rgba(99,102,241,0.2)', color:'#a5b4fc', fontSize:12, fontWeight:600, border:'1px solid rgba(99,102,241,0.3)' }}>
              Campaign Ops Platform
            </div>
          </div>

          {/* Hero */}
          <div className="page-card" style={{ padding: '28px 32px' }}>
            <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--accent-light)', fontWeight:700, marginBottom:12 }}>
              Campaign Operations
            </p>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:30, fontWeight:700, color:'white', letterSpacing:'-0.6px', lineHeight:1.15, maxWidth:560 }}>
              Media intelligence built for modern campaign execution.
            </h2>
            <p style={{ marginTop:14, fontSize:13, lineHeight:1.8, color:'var(--text-secondary)', maxWidth:580 }}>
              Manage inventory, bookings, campaign operations, and analytics across television, radio, podcasts, creators, outdoor advertising, and digital media.
            </p>
          </div>

          {/* All analytics as grid */}
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Platform Overview</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data)
                .filter(([, val]) => typeof val !== 'object' && !String(val).includes('<!doctype html>'))
                .map(([key, val]) => (
                  <div key={key} className="page-card" style={{ padding: '16px 18px' }}>
                    <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', fontWeight:700 }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p style={{ marginTop:10, fontSize:22, fontWeight:700, fontFamily:'Syne,sans-serif', color:'var(--text-primary)', letterSpacing:'-0.3px' }}>
                      {typeof val === 'number' ? val.toLocaleString() : String(val)}
                    </p>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
}