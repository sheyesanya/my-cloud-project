import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { getAnalytics, getBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt  = (n) => n == null ? '—' : typeof n === 'number' ? n.toLocaleString() : n;
const fmtM = (n) => n == null ? '—' : `₦${Number(n).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short'}); } catch { return d||'—'; }};

const STATUS_COLOR = {
  COMPLETED: '#86efac', PAID: '#5eead4', IN_PROGRESS: '#d8b4fe',
  PENDING_DELIVERY_REVIEW: '#fcd34d', PENDING_PROVIDER_CONFIRMATION: '#fcd34d',
  PAYMENT_PENDING: '#a5b4fc', REJECTED: '#fca5a5',
};
const STATUS_LABEL = {
  COMPLETED: 'Completed', PAID: 'Live', IN_PROGRESS: 'In Progress',
  PENDING_DELIVERY_REVIEW: 'Proof Review', PENDING_PROVIDER_CONFIRMATION: 'Awaiting Provider',
  PAYMENT_PENDING: 'Invoice Sent', REJECTED: 'Declined',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]         = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [analytics, bks] = await Promise.all([getAnalytics(), getBookings()]);
      setData(analytics);
      const all = Array.isArray(bks) ? bks : bks?.bookings ?? [];
      setBookings(all.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5));
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const name = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <>
      <PageTitle title="Dashboard" description="Manage your media campaigns across Nigeria."/>
      <Layout
        title={`${greeting()}, ${name}`}
        subtitle="Here's your campaign overview"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <Link to="/create-booking" className="btn-primary" style={{ fontSize:12, padding:'7px 14px', textDecoration:'none' }}>+ New Campaign</Link>
            <button onClick={load} className="btn-secondary" style={{ fontSize:12, padding:'7px 12px' }}>↻</button>
          </div>
        }
      >
        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'40px 0', color:'var(--text-muted)' }}>
            <Spinner size={16}/> Loading your dashboard…
          </div>
        )}

        {!loading && data && (
          <div className="space-y-5">

            {/* KPI row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
              {[
                { label:'Total Spend',     value:fmtM(data.totalRevenue),      color:'#a5b4fc', sub:`${data.totalBookings||0} campaigns` },
                { label:'Active',          value:fmt(data.activeBookings||0),  color:'#5eead4', sub:'In flight'           },
                { label:'Completed',       value:fmt(data.completedBookings||0),color:'#86efac',sub:'Delivered'           },
                { label:'Pending Action',  value:fmt(data.pendingBookings||0), color:'#fcd34d', sub:'Needs attention'     },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color:s.color, fontSize:20 }}>{s.value}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Two col */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

              {/* Recent bookings */}
              <div className="page-card" style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white' }}>Recent Bookings</p>
                  <Link to="/bookings" style={{ fontSize:11, color:'var(--accent-light)', textDecoration:'none' }}>View all →</Link>
                </div>
                {bookings.length === 0 ? (
                  <p style={{ fontSize:12, color:'var(--text-muted)', padding:'12px 0' }}>No bookings yet. <Link to="/create-booking" style={{ color:'var(--accent-light)', textDecoration:'none' }}>Create your first campaign →</Link></p>
                ) : bookings.map(b => (
                  <div key={b.bookingId} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:'0.5px solid var(--border)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'white', flexShrink:0 }}>
                        {(b.target||b.brandName||'?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize:12, fontWeight:500, color:'white' }}>{b.target||b.brandName||'—'}</p>
                        <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{fmtDate(b.date)} · {(b.market||'').replaceAll('_',' ')}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontSize:12, fontWeight:500, color:'var(--accent-light)' }}>{fmtM(b.finalPrice)}</p>
                      <span style={{ fontSize:9, fontWeight:600, color: STATUS_COLOR[b.status]||'var(--text-muted)' }}>
                        {STATUS_LABEL[b.status]||b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spend by category + quick actions */}
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div className="page-card" style={{ padding:'16px 18px', flex:1 }}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white', marginBottom:14 }}>Quick Actions</p>
                  {[
                    { to:'/create-booking', label:'Create Campaign',       sub:'Book TV, radio, OOH and more',    icon:'✦' },
                    { to:'/media',          label:'Browse Media',           sub:'184+ verified providers',         icon:'▦' },
                    { to:'/analytics',      label:'View Analytics',         sub:'Performance and spend breakdown',  icon:'↗' },
                    { to:'/brief-generator',label:'Generate Brief',         sub:'AI-powered campaign brief',        icon:'✧' },
                  ].map(a => (
                    <Link key={a.to} to={a.to} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, marginBottom:4, background:'rgba(255,255,255,0.02)', border:'0.5px solid var(--border)', textDecoration:'none', transition:'all 0.15s' }}>
                      <span style={{ width:28, height:28, borderRadius:8, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--accent-light)', flexShrink:0 }}>{a.icon}</span>
                      <div>
                        <p style={{ fontSize:12, fontWeight:500, color:'white' }}>{a.label}</p>
                        <p style={{ fontSize:10, color:'var(--text-muted)' }}>{a.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero banner */}
            <div style={{ padding:'22px 26px', borderRadius:10, background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.06))', border:'0.5px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div>
                <p style={{ fontSize:10, fontWeight:600, color:'var(--accent-light)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Total Campaign Spend</p>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:32, color:'white', letterSpacing:'-0.8px', lineHeight:1 }}>{fmtM(data.totalRevenue)}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Across {data.totalBookings||0} bookings on BrandCasta</p>
              </div>
              <Link to="/create-booking" className="btn-primary" style={{ textDecoration:'none', fontSize:13, padding:'10px 20px' }}>
                Book a Campaign →
              </Link>
            </div>

          </div>
        )}
      </Layout>
    </>
  );
}