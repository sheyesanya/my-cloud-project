import { useEffect, useState } from 'react';
import PageTitle from '../components/PageTitle';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fmt     = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); } catch { return '—'; }};

const STATUS_COLOR = {
  COMPLETED:               '#86efac',
  PAID:                    '#5eead4',
  IN_PROGRESS:             '#d8b4fe',
  PENDING_DELIVERY_REVIEW: '#fcd34d',
  PENDING_PROVIDER_CONFIRMATION: '#fcd34d',
  PAYMENT_PENDING:         '#a5b4fc',
  REJECTED:                '#fca5a5',
};

export default function AdminDashboard() {
  const [bookings, setBookings]         = useState([]);
  const [media, setMedia]               = useState([]);
  const [providers, setProviders]       = useState([]);
  const [subscriptions, setSubs]        = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('overview');
  const [toast, setToast]               = useState(null);
  const [showBookingModal, setShowBM]   = useState(false);
  const [bForm, setBForm]               = useState({ brand_name:'', contactEmail:'', mediaId:'', inventory_group:'', inventory_option:'', market:'', date:'', runs:1, campaignBrief:'' });
  const [bSubmitting, setBSub]          = useState(false);

  const showToast = (type, msg) => { setToast({type,message:msg}); setTimeout(()=>setToast(null),3500); };

  const parseInv = (raw) => { if(!raw) return {}; if(typeof raw==='string') { try{return JSON.parse(raw);}catch{return{};} } return raw; };
  const selMedia   = media.find(m => m.mediaId === bForm.mediaId);
  const selInv     = parseInv(selMedia?.inventory);
  const selGroup   = selInv[bForm.inventory_group];
  const selOpts    = selGroup?.options || {};
  const selOpt     = selOpts[bForm.inventory_option];
  const selMarkets = selOpt ? Object.keys(selOpt.markets||{}) : [];
  const unitPrice  = selOpt?.markets?.[bForm.market]?.price || 0;
  const totalPrice = unitPrice * Math.max(1, Number(bForm.runs)||1);

  const submitAdminBooking = async () => {
    if (!bForm.brand_name || !bForm.contactEmail || !bForm.mediaId || !bForm.date) {
      showToast('error', 'Please fill in all required fields'); return;
    }
    setBSub(true);
    try {
      const headers = await authHeader();
      headers['Content-Type'] = 'application/json';
      await axios.post(`${API}/campaigns`, {
        brand_name:    bForm.brand_name,
        contactEmail:  bForm.contactEmail,
        campaignBrief: bForm.campaignBrief,
        items: [{
          mediaId:          bForm.mediaId,
          mediaName:        selMedia?.name,
          category:         selMedia?.category || '',
          inventory_group:  bForm.inventory_group,
          inventory_option: bForm.inventory_option,
          groupLabel:       selGroup?.label || bForm.inventory_group,
          optionLabel:      selOpt?.label   || bForm.inventory_option,
          market:           bForm.market,
          date:             bForm.date,
          runs:             Math.max(1, Number(bForm.runs)||1),
          price:            totalPrice,
          unitPrice,
        }],
      }, { headers });
      showToast('success', 'Booking created successfully');
      setShowBM(false);
      setBForm({ brand_name:'', contactEmail:'', mediaId:'', inventory_group:'', inventory_option:'', market:'', date:'', runs:1, campaignBrief:'' });
      await loadAll();
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setBSub(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const headers = await authHeader();
      const [bRes, mRes, pRes] = await Promise.all([
        axios.get(`${API}/bookings`,  { headers }),
        axios.get(`${API}/media`,     { headers }),
        axios.get(`${API}/providers`, { headers }),
      ]);
      setBookings(Array.isArray(bRes.data) ? bRes.data : bRes.data?.bookings ?? []);
      setMedia(Array.isArray(mRes.data) ? mRes.data : mRes.data?.media ?? []);
      setProviders(Array.isArray(pRes.data) ? pRes.data : pRes.data?.providers ?? []);

      // Try subscriptions
      try {
        const sRes = await axios.get(`${API}/subscription/all`, { headers });
        setSubs(Array.isArray(sRes.data) ? sRes.data : sRes.data?.subscriptions ?? []);
      } catch { setSubs([]); }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Computed stats
  const totalRevenue    = bookings.reduce((s,b) => s+(Number(b.finalPrice)||0), 0);
  const totalCommission = bookings.reduce((s,b) => s+(Number(b.platformCommission)||Number(b.finalPrice||0)*0.15), 0);
  const totalPayout     = bookings.reduce((s,b) => s+(Number(b.mediaPayout)||0), 0);
  const activeBookings  = bookings.filter(b => ['PAID','IN_PROGRESS'].includes(b.status)).length;
  const pendingAction   = bookings.filter(b => b.status==='PENDING_PROVIDER_CONFIRMATION').length;
  const completedCount  = bookings.filter(b => b.status==='COMPLETED').length;
  const pendingApps     = providers.filter(p => p.status==='PENDING').length;
  const approvedProviders = providers.filter(p => p.status==='APPROVED').length;
  const activeSubs      = subscriptions.filter(s => s.status==='ACTIVE').length;
  const subRevenue      = subscriptions.filter(s => s.status==='ACTIVE').reduce((t,s) => t+(Number(s.amount)||0), 0);

  // Recent activity
  const recentBookings = [...bookings].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8);
  const pendingProviders = providers.filter(p => p.status==='PENDING').slice(0,5);

  const TABS = [
    { key:'overview',      label:'Overview'          },
    { key:'bookings',      label:`Bookings (${bookings.length})`  },
    { key:'providers',     label:`Providers (${providers.length})` },
    { key:'subscriptions', label:`Subscriptions (${activeSubs})`  },
    { key:'media',         label:`Media (${media.length})`        },
  ];

  if (loading) return <Layout title="Admin Dashboard">
      <PageTitle title="Admin Dashboard" description="Full platform overview — bookings, providers, subscriptions and revenue."/><div style={{ padding:40, display:'flex', gap:10, color:'var(--text-muted)' }}><Spinner size={16}/>Loading…</div></Layout>;

  return (
    <Layout title="Admin Dashboard" subtitle="Full platform overview — bookings, providers, subscriptions and revenue"
      actions={
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setShowBM(true)} className="btn-primary" style={{ fontSize:12 }}>+ Create Booking</button>
          <button onClick={loadAll} className="btn-secondary" style={{ fontSize:12 }}>↻ Refresh</button>
        </div>
      }>
      {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

      {/* ── ADMIN CREATE BOOKING MODAL ── */}
      {showBookingModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:28, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, color:'white' }}>Create Booking (Admin)</p>
              <button onClick={() => setShowBM(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                ['Brand Name *',    'brand_name',    'text',  'Indomie Nigeria'],
                ['Client Email *',  'contactEmail',  'email', 'client@company.com'],
                ['Campaign Date *', 'date',          'date',  ''],
                ['Number of Runs',  'runs',          'number','1'],
              ].map(([label, key, type, ph]) => (
                <div key={key}>
                  <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>{label}</p>
                  <input type={type} placeholder={ph} value={bForm[key]}
                    onChange={e => setBForm(f=>({...f,[key]:e.target.value,[key==='mediaId'?'inventory_group':key==='inventory_group'?'inventory_option':key==='inventory_option'?'market':'']: key!=='date'&&key!=='runs'?'':f[key==='date'?'date':'runs']}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:9, fontSize:13, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white' }}/>
                </div>
              ))}

              {/* Media org picker */}
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Media Organisation *</p>
                <select value={bForm.mediaId} onChange={e => setBForm(f=>({...f, mediaId:e.target.value, inventory_group:'', inventory_option:'', market:''}))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:9, fontSize:13, outline:'none', background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', color:'white' }}>
                  <option value="">Select media organisation...</option>
                  {[...media].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(m => (
                    <option key={m.mediaId} value={m.mediaId}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Inventory group */}
              {bForm.mediaId && Object.keys(selInv).length > 0 && (
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Inventory Group</p>
                  <select value={bForm.inventory_group} onChange={e => setBForm(f=>({...f, inventory_group:e.target.value, inventory_option:'', market:''}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:9, fontSize:13, outline:'none', background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', color:'white' }}>
                    <option value="">Select group...</option>
                    {Object.entries(selInv).map(([k,g]) => <option key={k} value={k}>{g.label}</option>)}
                  </select>
                </div>
              )}

              {/* Inventory option */}
              {bForm.inventory_group && (
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Option</p>
                  <select value={bForm.inventory_option} onChange={e => setBForm(f=>({...f, inventory_option:e.target.value, market:''}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:9, fontSize:13, outline:'none', background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', color:'white' }}>
                    <option value="">Select option...</option>
                    {Object.entries(selOpts).map(([k,o]) => <option key={k} value={k}>{o.label}</option>)}
                  </select>
                </div>
              )}

              {/* Market */}
              {bForm.inventory_option && selMarkets.length > 0 && (
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Market</p>
                  <select value={bForm.market} onChange={e => setBForm(f=>({...f, market:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:9, fontSize:13, outline:'none', background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', color:'white' }}>
                    <option value="">Select market...</option>
                    {selMarkets.map(m => <option key={m} value={m}>{m.replaceAll('_',' ')} — ₦{Number(selOpt.markets[m].price).toLocaleString()}</option>)}
                  </select>
                </div>
              )}

              {/* Price preview */}
              {totalPrice > 0 && (
                <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.18)' }}>
                  <p style={{ fontSize:11, color:'var(--text-muted)' }}>Total</p>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:22, color:'#a5b4fc' }}>₦{totalPrice.toLocaleString()}</p>
                </div>
              )}

              {/* Campaign brief */}
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Campaign Brief</p>
                <textarea rows={3} placeholder="Campaign goals, target audience, KPIs..." value={bForm.campaignBrief}
                  onChange={e => setBForm(f=>({...f, campaignBrief:e.target.value}))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:9, fontSize:13, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', resize:'vertical', fontFamily:'Manrope,sans-serif' }}/>
              </div>

              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button onClick={() => setShowBM(false)} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
                <button onClick={submitAdminBooking} disabled={bSubmitting} className="btn-primary" style={{ flex:2, justifyContent:'center' }}>
                  {bSubmitting ? <><Spinner size={13}/> Creating…</> : 'Create Booking →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', fontFamily:'Manrope,sans-serif', transition:'all 0.15s',
              background: activeTab===t.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              color:       activeTab===t.key ? '#a5b4fc' : 'var(--text-muted)',
              outline:     activeTab===t.key ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.07)',
            }}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* KPI grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
            {[
              { label:'Total GMV',          value:fmt(totalRevenue),    color:'#a5b4fc', sub:`${bookings.length} bookings total`     },
              { label:'Platform Commission',value:fmt(totalCommission), color:'#fcd34d', sub:'15% of all bookings'                   },
              { label:'Provider Payouts',   value:fmt(totalPayout),     color:'#86efac', sub:`${completedCount} completed campaigns` },
              { label:'Subscription MRR',   value:fmt(subRevenue),      color:'#f472b6', sub:`${activeSubs} active subscribers`     },
            ].map(s => (
              <div key={s.label} style={{ padding:'18px 20px', borderRadius:13, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>{s.label}</p>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:24, color:s.color, letterSpacing:'-0.5px' }}>{s.value}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Secondary stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10 }}>
            {[
              { label:'Needs Action',      value:pendingAction,     color:'#fcd34d' },
              { label:'Active Campaigns',  value:activeBookings,    color:'#5eead4' },
              { label:'Completed',         value:completedCount,    color:'#86efac' },
              { label:'Pending Apps',      value:pendingApps,       color:'#fcd34d', link:'/applications' },
              { label:'Approved Providers',value:approvedProviders, color:'#a5b4fc' },
              { label:'Media Orgs',        value:media.length,      color:'#d8b4fe', link:'/media'        },
            ].map(s => (
              <div key={s.label} style={{ padding:'12px 14px', borderRadius:11, background:'rgba(255,255,255,0.03)', border:`1px solid ${s.value>0&&(s.label==='Needs Action'||s.label==='Pending Apps')?'rgba(245,158,11,0.2)':'rgba(255,255,255,0.07)'}` }}>
                <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{s.label}</p>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:20, color:s.color }}>{s.value}</p>
                {s.link && <Link to={s.link} style={{ fontSize:10, color:'#a5b4fc', textDecoration:'none', fontWeight:600 }}>View →</Link>}
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>

            {/* Recent bookings */}
            <div style={{ padding:'18px 20px', borderRadius:13, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'white' }}>Recent Bookings</p>
                <button onClick={() => setActiveTab('bookings')} style={{ fontSize:11, color:'#a5b4fc', background:'none', border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>View all →</button>
              </div>
              {recentBookings.map(b => (
                <div key={b.bookingId} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'white' }}>{b.brandName||b.contactEmail}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)' }}>{b.target} · {fmtDate(b.createdAt)}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'#a5b4fc' }}>{fmt(b.finalPrice)}</p>
                    <span style={{ fontSize:9, fontWeight:700, color:STATUS_COLOR[b.status]||'var(--text-muted)' }}>{b.status?.replaceAll('_',' ')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending provider applications */}
            <div style={{ padding:'18px 20px', borderRadius:13, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'white' }}>
                  Pending Applications
                  {pendingApps>0 && <span style={{ marginLeft:8, padding:'2px 8px', borderRadius:20, background:'rgba(245,158,11,0.15)', color:'#fcd34d', fontSize:10, fontWeight:800 }}>{pendingApps}</span>}
                </p>
                <Link to="/applications" style={{ fontSize:11, color:'#a5b4fc', textDecoration:'none', fontWeight:600 }}>Manage →</Link>
              </div>
              {pendingProviders.length === 0 ? (
                <p style={{ fontSize:13, color:'var(--text-muted)', padding:'12px 0' }}>No pending applications</p>
              ) : pendingProviders.map(p => (
                <div key={p.providerId||p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:'white' }}>{p.orgName||p.name||'—'}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)' }}>{p.contactEmail} · {fmtDate(p.createdAt)}</p>
                  </div>
                  <Link to="/applications" style={{ fontSize:11, padding:'4px 10px', borderRadius:7, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', color:'#fcd34d', textDecoration:'none', fontWeight:600 }}>Review</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BOOKINGS TAB ── */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10, marginBottom:18 }}>
            {[
              ['Total GMV',    fmt(totalRevenue),    '#a5b4fc'],
              ['Commission',   fmt(totalCommission), '#fcd34d'],
              ['Active',       activeBookings,       '#5eead4'],
              ['Completed',    completedCount,       '#86efac'],
            ].map(([l,v,c]) => (
              <div key={l} style={{ padding:'12px 16px', borderRadius:11, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{l}</p>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:20, color:c }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Brand','Media','Option','Market','Date','Value','Commission','Status'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...bookings].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).map(b => (
                  <tr key={b.bookingId} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'10px 12px', color:'white', fontWeight:600 }}>{b.brandName||b.contactEmail}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{b.target||'—'}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{(b.inventoryOption||'—').replaceAll('_',' ')}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{(b.market||'—').replaceAll('_',' ')}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{fmtDate(b.date)}</td>
                    <td style={{ padding:'10px 12px', color:'#a5b4fc', fontWeight:700 }}>{fmt(b.finalPrice)}</td>
                    <td style={{ padding:'10px 12px', color:'#fcd34d', fontWeight:700 }}>{fmt(b.platformCommission||b.finalPrice*0.15)}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ padding:'3px 8px', borderRadius:20, fontSize:9, fontWeight:700, background:'rgba(255,255,255,0.06)', color:STATUS_COLOR[b.status]||'var(--text-muted)', whiteSpace:'nowrap' }}>
                        {b.status?.replaceAll('_',' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PROVIDERS TAB ── */}
      {activeTab === 'providers' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10, marginBottom:18 }}>
            {[
              ['Total Applications', providers.length,      '#a5b4fc'],
              ['Pending Review',     pendingApps,           '#fcd34d'],
              ['Approved',           approvedProviders,     '#86efac'],
              ['Rejected',           providers.filter(p=>p.status==='REJECTED').length, '#fca5a5'],
            ].map(([l,v,c]) => (
              <div key={l} style={{ padding:'12px 16px', borderRadius:11, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{l}</p>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:20, color:c }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
            <Link to="/applications" style={{ padding:'8px 18px', borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontWeight:700, fontSize:12, textDecoration:'none' }}>
              Manage Applications →
            </Link>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Organisation','Category','Contact','Applied','Status','Action'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...providers].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).map(p => (
                  <tr key={p.providerId||p.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'10px 12px', color:'white', fontWeight:600 }}>{p.orgName||p.name||'—'}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{(p.category||'—').replaceAll('_',' ')}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{p.contactEmail||'—'}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{fmtDate(p.createdAt)}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ padding:'3px 8px', borderRadius:20, fontSize:9, fontWeight:700,
                        background: p.status==='APPROVED'?'rgba(34,197,94,0.1)':p.status==='REJECTED'?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)',
                        color:      p.status==='APPROVED'?'#86efac':p.status==='REJECTED'?'#fca5a5':'#fcd34d',
                      }}>{p.status||'PENDING'}</span>
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      <Link to="/applications" style={{ fontSize:11, color:'#a5b4fc', textDecoration:'none', fontWeight:600 }}>Review →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === 'subscriptions' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10, marginBottom:18 }}>
            {[
              ['Active Subscribers', activeSubs,    '#a5b4fc'],
              ['MRR',    fmt(subRevenue), '#86efac'],
              ['Premium', subscriptions.filter(s=>s.tier==='PREMIUM'&&s.status==='ACTIVE').length, '#a5b4fc'],
              ['Pro',     subscriptions.filter(s=>s.tier==='PRO'&&s.status==='ACTIVE').length,     '#fcd34d'],
            ].map(([l,v,c]) => (
              <div key={l} style={{ padding:'12px 16px', borderRadius:11, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>{l}</p>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:20, color:c }}>{v}</p>
              </div>
            ))}
          </div>
          {subscriptions.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No subscription data available yet.</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['User','Plan','Amount','Activated','Expires','Status'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s,i) => (
                  <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'10px 12px', color:'white' }}>{s.userId||'—'}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ padding:'3px 8px', borderRadius:20, fontSize:9, fontWeight:700, background: s.tier==='PRO'?'rgba(245,158,11,0.1)':'rgba(99,102,241,0.1)', color: s.tier==='PRO'?'#fcd34d':'#a5b4fc' }}>{s.tier}</span>
                    </td>
                    <td style={{ padding:'10px 12px', color:'#a5b4fc', fontWeight:700 }}>{fmt(s.amount)}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{fmtDate(s.activatedAt)}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{fmtDate(s.expiresAt)}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ padding:'3px 8px', borderRadius:20, fontSize:9, fontWeight:700,
                        background: s.status==='ACTIVE'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',
                        color:      s.status==='ACTIVE'?'#86efac':'#fca5a5',
                      }}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── MEDIA TAB ── */}
      {activeTab === 'media' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, flex:1 }}>
              {[
                ['Total Orgs',     media.length,                                                    '#a5b4fc'],
                ['With Inventory', media.filter(m=>m.inventory&&JSON.stringify(m.inventory)!=='{}').length, '#86efac'],
                ['Categories',     new Set(media.map(m=>m.category)).size,                         '#fcd34d'],
              ].map(([l,v,c]) => (
                <div key={l} style={{ padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                  <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{l}</p>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:18, color:c }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <Link to="/create-media" style={{ padding:'8px 16px', borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontWeight:700, fontSize:12, textDecoration:'none' }}>+ Add Media</Link>
              <Link to="/admin/inventory" style={{ padding:'8px 16px', borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', fontWeight:700, fontSize:12, textDecoration:'none' }}>Inventory Manager</Link>
            </div>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Name','Category','Contact','Reach','Inventory'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...media].sort((a,b) => (a.name||'').localeCompare(b.name||'')).map(m => {
                const inv = typeof m.inventory==='string' ? (() => { try { return JSON.parse(m.inventory); } catch { return {}; }})() : (m.inventory||{});
                const hasInv = Object.keys(inv).length > 0;
                return (
                  <tr key={m.mediaId} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding:'10px 12px', color:'white', fontWeight:600 }}>{m.name}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{(m.category||'—').replaceAll('_',' ')}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{m.contactEmail||'—'}</td>
                    <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{m.monthlyReach||'—'}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ padding:'3px 8px', borderRadius:20, fontSize:9, fontWeight:700,
                        background: hasInv?'rgba(34,197,94,0.1)':'rgba(245,158,11,0.1)',
                        color:      hasInv?'#86efac':'#fcd34d',
                      }}>{hasInv ? `${Object.keys(inv).length} groups` : 'No inventory'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}