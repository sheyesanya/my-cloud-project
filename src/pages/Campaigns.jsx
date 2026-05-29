import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { getCampaigns } from '../services/api';

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

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('ALL');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    getCampaigns()
      .then(r => setCampaigns(Array.isArray(r)?r:r.campaigns??r.data??[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSpend  = campaigns.reduce((s,c)=>s+(c.totalPrice||0),0);
  const active      = campaigns.filter(c=>['APPROVED','PAID','IN_PROGRESS'].includes((c.status||'').toUpperCase())).length;
  const completed   = campaigns.filter(c=>(c.status||'').toUpperCase()==='COMPLETED').length;
  const pending     = campaigns.filter(c=>(c.status||'').toUpperCase().includes('PENDING')).length;

  const FILTERS = [
    { key:'ALL',       label:'All',        count:campaigns.length },
    { key:'PENDING',   label:'Pending',    count:pending          },
    { key:'PAID',      label:'Live',       count:active           },
    { key:'COMPLETED', label:'Completed',  count:completed        },
    { key:'REJECTED',  label:'Declined',   count:campaigns.filter(c=>(c.status||'').toUpperCase()==='REJECTED').length },
  ];

  const filtered = campaigns.filter(c => {
    const matchFilter = filter==='ALL'||(c.status||'').toUpperCase().includes(filter);
    const matchSearch = !search||c.brandName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter&&matchSearch;
  });

  return (
    <>
      <PageTitle title="My Campaigns" description="Monitor and manage all your media campaigns."/>
      <Layout title="My Campaigns" subtitle="Monitor and manage all campaigns"
        actions={<Link to="/create-booking" className="btn-primary" style={{ fontSize:12, padding:'7px 14px', textDecoration:'none' }}>+ New Campaign</Link>}
      >
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:18 }}>
          {[
            { label:'Total Spend', value:fmt(totalSpend), color:'#a5b4fc' },
            { label:'Active',      value:active,           color:'#5eead4' },
            { label:'Completed',   value:completed,        color:'#86efac' },
            { label:'Pending',     value:pending,          color:'#fcd34d' },
          ].map(s=>(
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color:s.color, fontSize:20 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
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
        <input type="text" placeholder="Search campaigns…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:'100%', maxWidth:360, padding:'7px 12px', borderRadius:8, fontSize:12, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', marginBottom:14, fontFamily:'Inter,sans-serif' }}/>

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text-muted)', padding:'20px 0' }}><Spinner size={14}/>Loading…</div>}

        {!loading && filtered.length===0 && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:12 }}>No campaigns yet.</p>
            <Link to="/create-booking" className="btn-primary" style={{ textDecoration:'none', fontSize:13 }}>Create your first campaign →</Link>
          </div>
        )}

        {/* Campaign cards */}
        {!loading && filtered.length>0 && (
          <div className="space-y-3">
            {filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(c=>{
              const bookings = c.bookings||[];
              const total    = c.totalPrice||bookings.reduce((s,b)=>s+(b.finalPrice||0),0);
              const s        = STATUS[(c.status||'').toUpperCase()]||{label:c.status,color:'var(--text-muted)',bg:'rgba(255,255,255,0.05)'};
              return (
                <div key={c.campaignId||c.id} className="page-card" style={{ padding:'14px 16px', cursor:'pointer' }}
                  onClick={()=>navigate(`/campaigns/${c.campaignId||c.id}`)}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <p style={{ fontWeight:500, fontSize:13, color:'white' }}>{c.brandName||'Campaign'}</p>
                        <span style={{ padding:'2px 8px', borderRadius:20, fontSize:9, fontWeight:600, background:s.bg, color:s.color }}>{s.label}</span>
                      </div>
                      <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                        {bookings.length} booking{bookings.length!==1?'s':''} · Created {fmtDate(c.createdAt)}
                        {c.campaignBrief && ` · ${c.campaignBrief.slice(0,60)}${c.campaignBrief.length>60?'…':''}`}
                      </p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'var(--accent-light)' }}>{fmt(total)}</p>
                      <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>View details →</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Layout>
    </>
  );
}