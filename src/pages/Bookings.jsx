import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { getBookings } from '../services/api';

const fmt     = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d||'—'; }};

const STATUS = {
  PENDING_PROVIDER_CONFIRMATION: { label:'Awaiting Provider', color:'var(--amber)',  bg:'var(--amber-dim)',         border:'var(--amber-border)' },
  PAYMENT_PENDING:               { label:'Invoice Sent',      color:'#a5b4fc',       bg:'rgba(99,102,241,0.08)',   border:'rgba(99,102,241,0.2)' },
  PAID:                          { label:'Live',              color:'#5eead4',       bg:'rgba(94,234,212,0.08)',   border:'rgba(94,234,212,0.2)' },
  IN_PROGRESS:                   { label:'In Progress',       color:'#d8b4fe',       bg:'rgba(168,85,247,0.08)',   border:'rgba(168,85,247,0.2)' },
  PENDING_DELIVERY_REVIEW:       { label:'Proof Review',      color:'var(--amber)',  bg:'var(--amber-dim)',         border:'var(--amber-border)' },
  COMPLETED:                     { label:'Completed',         color:'#4ade80',       bg:'rgba(74,222,128,0.08)',   border:'rgba(74,222,128,0.2)' },
  REJECTED:                      { label:'Declined',          color:'#fca5a5',       bg:'rgba(239,68,68,0.08)',    border:'rgba(239,68,68,0.18)' },
};

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.04 } } };
const row     = { hidden:{ opacity:0, x:-8 }, show:{ opacity:1, x:0, transition:{ duration:0.35, ease:[0.22,1,0.36,1] } } };

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    getBookings()
      .then(r => setBookings(Array.isArray(r)?r:r.bookings??[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const FILTERS = [
    { key:'ALL',                           label:'All',          count:bookings.length },
    { key:'PENDING_PROVIDER_CONFIRMATION', label:'Awaiting',     count:bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length },
    { key:'PAID',                          label:'Live',         count:bookings.filter(b=>b.status==='PAID').length },
    { key:'PENDING_DELIVERY_REVIEW',       label:'Proof Review', count:bookings.filter(b=>b.status==='PENDING_DELIVERY_REVIEW').length },
    { key:'COMPLETED',                     label:'Completed',    count:bookings.filter(b=>b.status==='COMPLETED').length },
    { key:'REJECTED',                      label:'Declined',     count:bookings.filter(b=>b.status==='REJECTED').length },
  ];

  const filtered = bookings
    .filter(b => filter==='ALL' || b.status===filter)
    .filter(b => !search || b.target?.toLowerCase().includes(search.toLowerCase()) || b.brandName?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));

  const totalSpend = bookings.reduce((s,b)=>s+(b.finalPrice||0),0);

  return (
    <>
      <PageTitle title="My Bookings"/>
      <Layout title="My Bookings" subtitle="All Bookings"
        actions={<Link to="/create-booking" className="btn-primary" style={{ textDecoration:'none', fontSize:11, padding:'8px 18px' }}>+ New Campaign</Link>}
      >
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:20 }}>
          {[
            { label:'Total Spend',  value:fmt(totalSpend),                                                   color:'var(--amber)' },
            { label:'Live',         value:bookings.filter(b=>b.status==='PAID').length,                      color:'#5eead4'     },
            { label:'Completed',    value:bookings.filter(b=>b.status==='COMPLETED').length,                 color:'#4ade80'     },
            { label:'Needs Action', value:bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length, color:'var(--amber)' },
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
              style={{ padding:'8px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'IBM Plex Mono,monospace', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color: filter===f.key ? 'var(--amber)' : 'var(--text3)', borderBottom: filter===f.key ? '2px solid var(--amber)' : '2px solid transparent', marginBottom:-1, transition:'all 0.15s' }}>
              {f.label}{f.count > 0 && <span style={{ marginLeft:5, opacity:0.6 }}>({f.count})</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom:16, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, paddingBottom:8, maxWidth:360 }}>
          <input type="text" placeholder="Search bookings…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ flex:1, background:'none', border:'none', fontSize:12, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none' }}/>
          {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14 }}>✕</button>}
        </div>

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text3)', padding:'20px 0', alignItems:'center' }}><Spinner size={14}/>Loading…</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text3)', fontSize:12 }}>
            No bookings found. <Link to="/create-booking" style={{ color:'var(--amber)', textDecoration:'none' }}>Create your first campaign →</Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <motion.div variants={stagger} initial="hidden" animate="show" style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>{['Brand','Media','Option','Market','Date','Runs','Value','Status'].map(h=><th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const sm = STATUS[b.status] || { label:b.status, color:'var(--text3)', bg:'rgba(255,255,255,0.04)', border:'var(--border)' };
                  return (
                    <motion.tr key={b.bookingId} variants={row}>
                      <td style={{ color:'var(--text)', fontWeight:500 }}>{b.brandName||b.contactEmail||'—'}</td>
                      <td>{b.target||'—'}</td>
                      <td>{(b.inventoryOption||'—').replaceAll('_',' ')}</td>
                      <td style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10 }}>{(b.market||'—').replaceAll('_',' ')}</td>
                      <td style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, whiteSpace:'nowrap' }}>{fmtDate(b.date)}</td>
                      <td style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10 }}>{b.runs||1}</td>
                      <td style={{ color:'var(--amber)', fontFamily:'Manrope,sans-serif', fontWeight:700, whiteSpace:'nowrap' }}>{fmt(b.finalPrice)}</td>
                      <td>
                        <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, padding:'2px 8px', background:sm.bg, color:sm.color, border:`1px solid ${sm.border}`, letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
                          {sm.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </Layout>
    </>
  );
}