import { useEffect, useState } from 'react';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { getBookings } from '../services/api';
import { Link } from 'react-router-dom';

const fmt     = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d||'—'; }};

const STATUS = {
  PENDING_PROVIDER_CONFIRMATION: { label:'Awaiting Provider', color:'#fcd34d', bg:'rgba(245,158,11,0.1)' },
  PAYMENT_PENDING:               { label:'Invoice Sent',      color:'#a5b4fc', bg:'rgba(99,102,241,0.1)' },
  PAID:                          { label:'Live',              color:'#5eead4', bg:'rgba(20,184,166,0.1)' },
  IN_PROGRESS:                   { label:'In Progress',       color:'#d8b4fe', bg:'rgba(168,85,247,0.1)' },
  PENDING_DELIVERY_REVIEW:       { label:'Proof Review',      color:'#fcd34d', bg:'rgba(245,158,11,0.1)' },
  COMPLETED:                     { label:'Completed',         color:'#86efac', bg:'rgba(34,197,94,0.1)'  },
  REJECTED:                      { label:'Declined',          color:'#fca5a5', bg:'rgba(239,68,68,0.1)'  },
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    getBookings()
      .then(r => setBookings(Array.isArray(r)?r:r.bookings??r.data??[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const FILTERS = [
    { key:'ALL',                           label:'All',             count: bookings.length },
    { key:'PENDING_PROVIDER_CONFIRMATION', label:'Awaiting',        count: bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length },
    { key:'PAID',                          label:'Live',            count: bookings.filter(b=>b.status==='PAID').length },
    { key:'PENDING_DELIVERY_REVIEW',       label:'Proof Review',    count: bookings.filter(b=>b.status==='PENDING_DELIVERY_REVIEW').length },
    { key:'COMPLETED',                     label:'Completed',       count: bookings.filter(b=>b.status==='COMPLETED').length },
    { key:'REJECTED',                      label:'Declined',        count: bookings.filter(b=>b.status==='REJECTED').length },
  ];

  const filtered = bookings.filter(b => {
    const matchFilter = filter==='ALL'||b.status===filter;
    const matchSearch = !search||b.target?.toLowerCase().includes(search.toLowerCase())||b.brandName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter&&matchSearch;
  });

  const totalSpend    = bookings.reduce((s,b)=>s+(b.finalPrice||0),0);
  const activeCount   = bookings.filter(b=>['PAID','IN_PROGRESS'].includes(b.status)).length;
  const completedCount= bookings.filter(b=>b.status==='COMPLETED').length;
  const pendingCount  = bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length;

  return (
    <>
      <PageTitle title="My Bookings" description="All your media booking records and statuses."/>
      <Layout title="My Bookings" subtitle="All booking records and statuses"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <Link to="/create-booking" className="btn-primary" style={{ fontSize:12, padding:'7px 14px', textDecoration:'none' }}>+ New Campaign</Link>
          </div>
        }
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:18 }}>
          {[
            { label:'Total Spend',   value:fmt(totalSpend),  color:'#a5b4fc' },
            { label:'Active',        value:activeCount,       color:'#5eead4' },
            { label:'Completed',     value:completedCount,   color:'#86efac' },
            { label:'Needs Action',  value:pendingCount,     color:'#fcd34d' },
          ].map(s=>(
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color:s.color, fontSize:20 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)}
              style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                background:filter===f.key?'var(--accent-soft)':'rgba(255,255,255,0.04)',
                color:filter===f.key?'var(--accent-light)':'var(--text-muted)',
                outline:filter===f.key?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
              }}>
              {f.label}{f.count>0&&<span style={{ marginLeft:4, opacity:0.65 }}>({f.count})</span>}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Search by brand or media…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:'100%', maxWidth:360, padding:'7px 12px', borderRadius:8, fontSize:12, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', marginBottom:14, fontFamily:'Inter,sans-serif' }}/>

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text-muted)', padding:'20px 0' }}><Spinner size={14}/>Loading…</div>}

        {!loading && filtered.length===0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)', fontSize:13 }}>
            No bookings found. <Link to="/create-booking" style={{ color:'var(--accent-light)', textDecoration:'none' }}>Create your first campaign →</Link>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length>0 && (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Brand','Media','Option','Market','Date','Runs','Value','Status'].map(h=>(
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(b=>{
                  const s = STATUS[b.status]||{label:b.status,color:'var(--text-muted)',bg:'rgba(255,255,255,0.05)'};
                  return (
                    <tr key={b.bookingId}>
                      <td style={{ color:'white', fontWeight:500 }}>{b.brandName||b.contactEmail||'—'}</td>
                      <td>{b.target||'—'}</td>
                      <td>{(b.inventoryOption||'—').replaceAll('_',' ')}</td>
                      <td>{(b.market||'—').replaceAll('_',' ')}</td>
                      <td style={{ whiteSpace:'nowrap' }}>{fmtDate(b.date)}</td>
                      <td>{b.runs||1}</td>
                      <td style={{ color:'var(--accent-light)', fontWeight:500, whiteSpace:'nowrap' }}>{fmt(b.finalPrice)}</td>
                      <td>
                        <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Layout>
    </>
  );
}