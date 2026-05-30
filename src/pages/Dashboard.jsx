import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { getAnalytics, getBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt     = (n) => n == null ? '—' : `₦${Number(n).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short'}); } catch { return d||'—'; }};

const STATUS_META = {
  COMPLETED:                     { label:'Completed',        color:'#4ade80' },
  PAID:                          { label:'Live',             color:'#5eead4' },
  IN_PROGRESS:                   { label:'In Progress',      color:'#d8b4fe' },
  PENDING_DELIVERY_REVIEW:       { label:'Proof Review',     color:'var(--amber)' },
  PENDING_PROVIDER_CONFIRMATION: { label:'Awaiting Provider',color:'var(--amber)' },
  PAYMENT_PENDING:               { label:'Invoice Sent',     color:'#a5b4fc' },
  REJECTED:                      { label:'Declined',         color:'#fca5a5' },
};

const CAT_COLOR = {
  TELEVISION:'var(--amber)', RADIO_AUDIO:'#5eead4', OUT_OF_HOME:'#fb923c',
  PODCASTS:'#d8b4fe', INFLUENCERS:'#f472b6', SOCIAL_MEDIA:'#60a5fa',
  LIVE_STREAMING:'#4ade80', MUSIC_PROMOTION:'#fcd34d', PRINT_MEDIA:'#94a3b8',
};

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0, transition:{ duration:0.45, ease:[0.22,1,0.36,1] } } };

export default function Dashboard() {
  const { user }                  = useAuth();
  const [data, setData]           = useState(null);
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [analytics, bks] = await Promise.all([getAnalytics(), getBookings()]);
      setData(analytics);
      const all = Array.isArray(bks) ? bks : bks?.bookings ?? [];
      setBookings(all.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6));
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };
  const name = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const STATS = data ? [
    { label:'Total Spend',    value:fmt(data.totalRevenue),      sub:`${data.totalBookings||0} bookings`   },
    { label:'Active',         value:data.activeBookings||0,      sub:'In flight',   color:'#5eead4'        },
    { label:'Completed',      value:data.completedBookings||0,   sub:'Delivered',   color:'#4ade80'        },
    { label:'Needs Attention',value:data.pendingBookings||0,     sub:'Pending',     color:'var(--amber)'   },
  ] : [];

  return (
    <>
      <PageTitle title="Dashboard"/>
      <Layout
        title={`${greeting()}, ${name}`}
        subtitle="Campaign Overview"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <Link to="/create-booking" className="btn-primary" style={{ textDecoration:'none', fontSize:11, padding:'8px 18px' }}>+ New Campaign</Link>
            <button onClick={load} className="btn-secondary" style={{ fontSize:11, padding:'8px 14px' }}>↻</button>
          </div>
        }
      >
        {loading && <div style={{ display:'flex', gap:10, color:'var(--text3)', padding:'40px 0', alignItems:'center' }}><Spinner size={14}/>Loading…</div>}

        {!loading && data && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

            {/* Stats */}
            <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
              {STATS.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color:s.color||'var(--text)', fontSize:22 }}>{s.value}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </motion.div>

            {/* Two col */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

              {/* Recent bookings */}
              <motion.div variants={fadeUp} className="page-card" style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, color:'var(--text)' }}>Recent Bookings</p>
                  <Link to="/bookings" style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>View all →</Link>
                </div>
                {bookings.length === 0 ? (
                  <p style={{ fontSize:12, color:'var(--text3)', padding:'12px 0' }}>No bookings yet. <Link to="/create-booking" style={{ color:'var(--amber)', textDecoration:'none' }}>Start your first campaign →</Link></p>
                ) : bookings.map((b, i) => {
                  const sm = STATUS_META[b.status] || { label: b.status, color:'var(--text3)' };
                  const catColor = CAT_COLOR[(b.category||'').toUpperCase()] || 'var(--amber)';
                  return (
                    <motion.div key={b.bookingId}
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05, duration:0.35 }}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border2)', borderLeft:'2px solid transparent', paddingLeft:8, marginLeft:-8, transition:'border-color 0.15s', cursor:'default' }}
                      onMouseEnter={e => e.currentTarget.style.borderLeftColor='var(--amber)'}
                      onMouseLeave={e => e.currentTarget.style.borderLeftColor='transparent'}>
                      <div style={{ width:6, height:6, background:catColor, flexShrink:0 }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.target||b.brandName||'—'}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:2 }}>{fmtDate(b.date)} · {(b.market||'').replaceAll('_',' ')}</p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:12, color:'var(--amber)' }}>{fmt(b.finalPrice)}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:sm.color, marginTop:2 }}>{sm.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Quick actions */}
              <motion.div variants={fadeUp} className="space-y-3">
                {[
                  { to:'/create-booking',  label:'Create Campaign',        sub:'Book TV, radio, OOH and more',           icon:'✦' },
                  { to:'/media',           label:'Browse Media Inventory', sub:'184+ verified Nigerian providers',         icon:'▦' },
                  { to:'/analytics',       label:'View Analytics',         sub:'Spend breakdown and performance',          icon:'↗' },
                  { to:'/brief-generator', label:'AI Brief Generator',     sub:'Generate a campaign brief with AI',        icon:'✧' },
                  { to:'/assistant',       label:'Campaign Assistant',     sub:'Ask our AI media strategist anything',     icon:'◈' },
                ].map(a => (
                  <Link key={a.to} to={a.to}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg2)', border:'1px solid var(--border)', textDecoration:'none', transition:'all 0.15s', borderLeft:'2px solid transparent' }}
                    onMouseEnter={e => e.currentTarget.style.borderLeftColor='var(--amber)'}
                    onMouseLeave={e => e.currentTarget.style.borderLeftColor='transparent'}>
                    <div style={{ width:30, height:30, background:'var(--amber-dim)', border:'1px solid var(--amber-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--amber)', flexShrink:0, fontFamily:'Manrope,sans-serif' }}>
                      {a.icon}
                    </div>
                    <div>
                      <p style={{ fontSize:12, fontWeight:600, color:'var(--text)', fontFamily:'Manrope,sans-serif' }}>{a.label}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:2 }}>{a.sub}</p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Spend banner */}
            <motion.div variants={fadeUp}
              style={{ padding:'22px 28px', background:'var(--bg2)', border:'1px solid var(--border)', borderLeft:'3px solid var(--amber)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>Total Campaign Spend</div>
                <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:34, color:'var(--text)', letterSpacing:'-1px', lineHeight:1 }}>{fmt(data.totalRevenue)}</div>
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--text3)', marginTop:4 }}>Across {data.totalBookings||0} bookings on BrandCasta</div>
              </div>
              <Link to="/create-booking" className="btn-primary" style={{ textDecoration:'none', fontSize:11 }}>Book a Campaign →</Link>
            </motion.div>

          </motion.div>
        )}
      </Layout>
    </>
  );
}