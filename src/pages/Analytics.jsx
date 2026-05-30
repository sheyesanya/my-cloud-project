import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { getAnalytics } from '../services/api';
import { useSubscription } from '../context/SubscriptionContext';
import { Link } from 'react-router-dom';

const fmt     = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short'}); }catch{ return d||'—'; }};

const CAT_COLOR = {
  TELEVISION:'var(--amber)', RADIO_AUDIO:'#5eead4', OUT_OF_HOME:'#fb923c',
  PODCASTS:'#d8b4fe', INFLUENCERS:'#f472b6', SOCIAL_MEDIA:'#60a5fa',
  LIVE_STREAMING:'#4ade80', MUSIC_PROMOTION:'#fcd34d', PRINT_MEDIA:'#94a3b8',
};

function CountUp({ target, duration=1400 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let v = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
          v = Math.min(v + step, target);
          setCount(Math.floor(v));
          if (v >= target) clearInterval(t);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString('en-NG')}</span>;
}

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ duration:0.45, ease:[0.22,1,0.36,1] } } };

export default function Analytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('all');
  const { isPremium, isPro }  = useSubscription();

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Analytics" subtitle="Campaign Performance">
      <PageTitle title="Analytics"/>
      <div style={{ display:'flex', gap:10, color:'var(--text3)', padding:'40px 0', alignItems:'center' }}><Spinner size={14}/>Loading…</div>
    </Layout>
  );

  if (!isPremium && !isPro) return (
    <Layout title="Analytics" subtitle="Campaign Performance">
      <PageTitle title="Analytics"/>
      <div style={{ textAlign:'center', padding:'64px 24px', maxWidth:480, margin:'0 auto' }}>
        <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>Premium Feature</div>
        <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:24, color:'var(--text)', marginBottom:12, letterSpacing:'-0.5px' }}>Unlock Campaign Analytics</h2>
        <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.75, marginBottom:24 }}>Detailed spend analysis, category breakdowns and campaign performance metrics require a Premium or Pro subscription.</p>
        <Link to="/subscription" className="btn-primary" style={{ textDecoration:'none' }}>View Plans →</Link>
      </div>
    </Layout>
  );

  const catData = data?.categoryBreakdown || {};
  const topProviders = data?.topProviders || [];
  const maxCat = Math.max(...Object.values(catData).map(v=>Number(v)||0), 1);

  return (
    <>
      <PageTitle title="Analytics"/>
      <Layout title="Analytics" subtitle="Campaign Performance"
        actions={
          <div style={{ display:'flex', gap:0, border:'1px solid var(--border)' }}>
            {[['all','All Time'],['month','This Month'],['week','This Week']].map(([key,label]) => (
              <button key={key} onClick={()=>setPeriod(key)}
                style={{ padding:'7px 14px', background:period===key?'var(--amber)':'none', color:period===key?'#0a0a0f':'var(--text3)', border:'none', cursor:'pointer', fontFamily:'IBM Plex Mono,monospace', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
        }
      >
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

          {/* KPI Row */}
          <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
            {[
              { label:'Total Spend',     value:data?.totalRevenue||0,     prefix:'₦', color:'var(--amber)' },
              { label:'Total Bookings',  value:data?.totalBookings||0,    prefix:'',  color:'var(--text)'  },
              { label:'Active',          value:data?.activeBookings||0,   prefix:'',  color:'#5eead4'      },
              { label:'Completed',       value:data?.completedBookings||0,prefix:'',  color:'#4ade80'      },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color:s.color, fontSize:22 }}>
                  {s.prefix}<CountUp target={s.value}/>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Category breakdown */}
          {Object.keys(catData).length > 0 && (
            <motion.div variants={fadeUp} className="page-card" style={{ padding:'20px 22px' }}>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16 }}>Spend by Category</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {Object.entries(catData)
                  .sort(([,a],[,b])=>Number(b)-Number(a))
                  .map(([cat,amount]) => {
                    const pct = (Number(amount)/maxCat)*100;
                    const color = CAT_COLOR[cat] || 'var(--amber)';
                    return (
                      <div key={cat} style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', width:80, textAlign:'right', flexShrink:0, letterSpacing:'0.04em' }}>
                          {cat.replaceAll('_',' ')}
                        </div>
                        <div style={{ flex:1, height:5, background:'rgba(255,255,255,0.05)', position:'relative' }}>
                          <motion.div
                            initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1, ease:[0.22,1,0.36,1], delay:0.2 }}
                            style={{ height:'100%', background:color, position:'absolute', top:0, left:0 }}/>
                        </div>
                        <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', width:70, textAlign:'right', flexShrink:0 }}>
                          {fmt(amount)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* Top providers */}
          {topProviders.length > 0 && (
            <motion.div variants={fadeUp} className="page-card" style={{ padding:'20px 22px' }}>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16 }}>Top Providers by Spend</div>
              <table className="data-table">
                <thead><tr><th>#</th><th>Provider</th><th>Category</th><th>Bookings</th><th>Total Spend</th></tr></thead>
                <tbody>
                  {topProviders.slice(0,8).map((p,i) => (
                    <tr key={p.name||i}>
                      <td style={{ fontFamily:'IBM Plex Mono,monospace', color:'var(--text3)', fontSize:10 }}>{i+1}</td>
                      <td style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, color:'var(--text)' }}>{p.name||'—'}</td>
                      <td><span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:CAT_COLOR[(p.category||'').toUpperCase()]||'var(--amber)' }}>{(p.category||'—').replaceAll('_',' ')}</span></td>
                      <td style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10 }}>{p.bookingCount||0}</td>
                      <td style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, color:'var(--amber)' }}>{fmt(p.totalSpend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Timeline */}
          {data?.recentBookings?.length > 0 && (
            <motion.div variants={fadeUp} className="page-card" style={{ padding:'20px 22px' }}>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16 }}>Recent Campaign Activity</div>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {data.recentBookings.slice(0,6).map((b,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:'1px solid var(--border2)' }}>
                    <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', width:44, flexShrink:0 }}>{fmtDate(b.createdAt)}</div>
                    <div style={{ width:6, height:6, background:CAT_COLOR[(b.category||'').toUpperCase()]||'var(--amber)', flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:12, fontWeight:500, color:'var(--text)' }}>{b.target||b.brandName||'—'}</p>
                    </div>
                    <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:12, color:'var(--amber)' }}>{fmt(b.finalPrice)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </motion.div>
      </Layout>
    </>
  );
}