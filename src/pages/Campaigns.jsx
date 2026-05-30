import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { getCampaigns } from '../services/api';

const fmt     = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d||'—'; }};

const STATUS = {
  COMPLETED:   { label:'Completed',   color:'#4ade80', bg:'rgba(74,222,128,0.08)',   border:'rgba(74,222,128,0.2)'   },
  PAID:        { label:'Live',        color:'#5eead4', bg:'rgba(94,234,212,0.08)',   border:'rgba(94,234,212,0.2)'   },
  IN_PROGRESS: { label:'In Progress', color:'#d8b4fe', bg:'rgba(168,85,247,0.08)',  border:'rgba(168,85,247,0.2)'  },
  REJECTED:    { label:'Declined',    color:'#fca5a5', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.18)'   },
};
const getStatus = (s='') => STATUS[s.toUpperCase()] || { label:s, color:'var(--amber)', bg:'var(--amber-dim)', border:'var(--amber-border)' };

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.06 } } };
const fadeUp  = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.22,1,0.36,1] } } };

export default function Campaigns() {
  const navigate                      = useNavigate();
  const [campaigns, setCampaigns]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('ALL');
  const [search, setSearch]           = useState('');

  useEffect(() => {
    getCampaigns()
      .then(r => setCampaigns(Array.isArray(r)?r:r.campaigns??[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSpend = campaigns.reduce((s,c)=>s+(c.totalPrice||0),0);
  const active     = campaigns.filter(c=>['APPROVED','PAID','IN_PROGRESS'].includes((c.status||'').toUpperCase())).length;
  const completed  = campaigns.filter(c=>(c.status||'').toUpperCase()==='COMPLETED').length;

  const FILTERS = [
    { key:'ALL',       label:'All',       count:campaigns.length },
    { key:'PENDING',   label:'Pending',   count:campaigns.filter(c=>(c.status||'').toUpperCase().includes('PENDING')).length },
    { key:'PAID',      label:'Live',      count:active },
    { key:'COMPLETED', label:'Completed', count:completed },
    { key:'REJECTED',  label:'Declined',  count:campaigns.filter(c=>(c.status||'').toUpperCase()==='REJECTED').length },
  ];

  const filtered = campaigns
    .filter(c => filter==='ALL' || (c.status||'').toUpperCase().includes(filter))
    .filter(c => !search || c.brandName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageTitle title="My Campaigns"/>
      <Layout title="My Campaigns" subtitle="Campaign Operations"
        actions={<Link to="/create-booking" className="btn-primary" style={{ textDecoration:'none', fontSize:11, padding:'8px 18px' }}>+ New Campaign</Link>}
      >
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:20 }}>
          {[
            { label:'Total Spend', value:fmt(totalSpend),  color:'var(--amber)' },
            { label:'Active',      value:active,            color:'#5eead4'     },
            { label:'Completed',   value:completed,         color:'#4ade80'     },
            { label:'Total',       value:campaigns.length,  color:'var(--text)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color:s.color, fontSize:20 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:16 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding:'8px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'IBM Plex Mono,monospace', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:filter===f.key?'var(--amber)':'var(--text3)', borderBottom:filter===f.key?'2px solid var(--amber)':'2px solid transparent', marginBottom:-1, transition:'all 0.15s' }}>
              {f.label}{f.count>0&&<span style={{ marginLeft:5, opacity:0.6 }}>({f.count})</span>}
            </button>
          ))}
        </div>

        <div style={{ marginBottom:16, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, paddingBottom:8, maxWidth:360 }}>
          <input type="text" placeholder="Search campaigns…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ flex:1, background:'none', border:'none', fontSize:12, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none' }}/>
          {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14 }}>✕</button>}
        </div>

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text3)', padding:'20px 0', alignItems:'center' }}><Spinner size={14}/>Loading…</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text3)', fontSize:12 }}>
            No campaigns yet. <Link to="/create-booking" style={{ color:'var(--amber)', textDecoration:'none' }}>Create your first →</Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
            {filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(c => {
              const bks   = c.bookings||[];
              const total = c.totalPrice||bks.reduce((s,b)=>s+(b.finalPrice||0),0);
              const sm    = getStatus(c.status);
              return (
                <motion.div key={c.campaignId||c.id} variants={fadeUp}
                  onClick={() => navigate(`/campaigns/${c.campaignId||c.id}`)}
                  style={{ padding:'14px 18px', background:'var(--bg2)', border:'1px solid var(--border)', borderLeft:'2px solid transparent', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}
                  onMouseEnter={e => e.currentTarget.style.borderLeftColor='var(--amber)'}
                  onMouseLeave={e => e.currentTarget.style.borderLeftColor='transparent'}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'var(--text)' }}>{c.brandName||'Campaign'}</p>
                      <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, padding:'2px 7px', background:sm.bg, color:sm.color, border:`1px solid ${sm.border}`, letterSpacing:'0.06em' }}>{sm.label}</span>
                    </div>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)' }}>
                      {bks.length} booking{bks.length!==1?'s':''} · Created {fmtDate(c.createdAt)}
                      {c.campaignBrief&&` · ${c.campaignBrief.slice(0,60)}${c.campaignBrief.length>60?'…':''}`}
                    </p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'var(--amber)' }}>{fmt(total)}</p>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:2 }}>View details →</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Layout>
    </>
  );
}