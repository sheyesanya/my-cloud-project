import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' } : {};
};

const fmt     = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return '—'; }};

const STATUS_COLOR = {
  COMPLETED:'#86efac', PAID:'#5eead4', IN_PROGRESS:'#d8b4fe',
  PENDING_DELIVERY_REVIEW:'#fcd34d', PENDING_PROVIDER_CONFIRMATION:'#fcd34d',
  PAYMENT_PENDING:'#a5b4fc', REJECTED:'#fca5a5',
};

export default function AdminDashboard() {
  const [bookings, setBookings]       = useState([]);
  const [media, setMedia]             = useState([]);
  const [providers, setProviders]     = useState([]);
  const [subscriptions, setSubs]      = useState([]);
  const [payouts, setPayouts]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');
  const [toast, setToast]             = useState(null);
  const [releasing, setReleasing]     = useState({});
  const [showBookingModal, setShowBM] = useState(false);
  const [bForm, setBForm]             = useState({ brand_name:'', contactEmail:'', mediaId:'', inventory_group:'', inventory_option:'', market:'', date:'', runs:1, campaignBrief:'' });
  const [bSubmitting, setBSub]        = useState(false);

  const showToast = (type, msg) => { setToast({type,message:msg}); setTimeout(()=>setToast(null),3500); };

  const parseInv = (raw) => { if(!raw) return {}; if(typeof raw==='string'){try{return JSON.parse(raw);}catch{return{};}} return raw; };
  const selMedia   = media.find(m=>m.mediaId===bForm.mediaId);
  const selInv     = parseInv(selMedia?.inventory);
  const selGroup   = selInv[bForm.inventory_group];
  const selOpts    = selGroup?.options||{};
  const selOpt     = selOpts[bForm.inventory_option];
  const selMarkets = selOpt?Object.keys(selOpt.markets||{}):[];
  const unitPrice  = selOpt?.markets?.[bForm.market]?.price||0;
  const totalPrice = unitPrice*Math.max(1,Number(bForm.runs)||1);

  const loadAll = async () => {
    setLoading(true);
    try {
      const headers = await authHeader();
      const [bRes,mRes,pRes] = await Promise.all([
        axios.get(`${API}/bookings`,  {headers}),
        axios.get(`${API}/media`,     {headers}),
        axios.get(`${API}/providers`, {headers}),
      ]);
      setBookings(Array.isArray(bRes.data)?bRes.data:bRes.data?.bookings??[]);
      setMedia(Array.isArray(mRes.data)?mRes.data:mRes.data?.media??[]);
      setProviders(Array.isArray(pRes.data)?pRes.data:pRes.data?.providers??[]);
      try{ const sRes=await axios.get(`${API}/subscription/all`,{headers}); setSubs(Array.isArray(sRes.data)?sRes.data:[]); }catch{ setSubs([]); }
      try{ const pyRes=await axios.get(`${API}/admin/payouts`,{headers}); setPayouts(Array.isArray(pyRes.data)?pyRes.data:[]); }catch{ setPayouts([]); }
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ loadAll(); },[]);

  const releasePayout = async (bookingId, providerName) => {
    if(!window.confirm(`Release payout for ${providerName}?`)) return;
    setReleasing(r=>({...r,[bookingId]:true}));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/admin/payouts/release`, {bookingId}, {headers});
      showToast('success', `Payout released for ${providerName}`);
      await loadAll();
    } catch(e){ showToast('error', e.response?.data?.error||e.message); }
    finally{ setReleasing(r=>{const n={...r};delete n[bookingId];return n;}); }
  };

  const submitAdminBooking = async () => {
    if(!bForm.brand_name||!bForm.contactEmail||!bForm.mediaId||!bForm.date){ showToast('error','Fill in all required fields'); return; }
    setBSub(true);
    try {
      const headers = await authHeader();
      await axios.post(`${API}/campaigns`, {
        brand_name:bForm.brand_name, contactEmail:bForm.contactEmail, campaignBrief:bForm.campaignBrief,
        items:[{ mediaId:bForm.mediaId, mediaName:selMedia?.name, category:selMedia?.category||'', inventory_group:bForm.inventory_group, inventory_option:bForm.inventory_option, groupLabel:selGroup?.label||bForm.inventory_group, optionLabel:selOpt?.label||bForm.inventory_option, market:bForm.market, date:bForm.date, runs:Math.max(1,Number(bForm.runs)||1), price:totalPrice, unitPrice }],
      }, {headers});
      showToast('success','Booking created');
      setShowBM(false);
      setBForm({brand_name:'',contactEmail:'',mediaId:'',inventory_group:'',inventory_option:'',market:'',date:'',runs:1,campaignBrief:''});
      await loadAll();
    } catch(e){ showToast('error', e.response?.data?.error||e.message); }
    finally{ setBSub(false); }
  };

  // Stats
  const totalRevenue    = bookings.reduce((s,b)=>s+(Number(b.finalPrice)||0),0);
  const totalCommission = bookings.reduce((s,b)=>s+(Number(b.platformCommission)||Number(b.finalPrice||0)*0.15),0);
  const activeSubs      = subscriptions.filter(s=>s.status==='ACTIVE').length;
  const subRevenue      = subscriptions.filter(s=>s.status==='ACTIVE').reduce((t,s)=>t+(Number(s.amount)||0),0);
  const pendingApps     = providers.filter(p=>p.status==='PENDING').length;
  const pendingAction   = bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length;

  const TABS = [
    { key:'overview',      label:'Overview'                    },
    { key:'bookings',      label:`Bookings (${bookings.length})`},
    { key:'providers',     label:`Providers (${providers.length})`},
    { key:'subscriptions', label:`Subscriptions (${activeSubs})`},
    { key:'media',         label:`Media (${media.length})`     },
    { key:'payouts',       label:`Payouts (${payouts.length})` },
  ];

  const inp = { width:'100%', padding:'8px 11px', borderRadius:8, fontSize:12, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', fontFamily:'Inter,sans-serif', marginBottom:8 };

  if(loading) return (
    <Layout title="Admin Dashboard">
      <PageTitle title="Admin Dashboard" description="Full platform overview."/>
      <div style={{ display:'flex', gap:10, color:'var(--text-muted)', padding:'40px 0' }}><Spinner size={16}/>Loading…</div>
    </Layout>
  );

  return (
    <>
      <PageTitle title="Admin Dashboard" description="Full platform overview — bookings, providers, subscriptions and revenue."/>
      <Layout title="Admin Dashboard" subtitle="Full platform overview"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>setShowBM(true)} className="btn-primary" style={{ fontSize:12, padding:'7px 14px' }}>+ Create Booking</button>
            <button onClick={loadAll} className="btn-secondary" style={{ fontSize:12, padding:'7px 12px' }}>↻</button>
          </div>
        }
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Create Booking Modal */}
        {showBookingModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div style={{ background:'#0d0d18', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:12, padding:24, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color:'white' }}>Create Booking (Admin)</p>
                <button onClick={()=>setShowBM(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:18, cursor:'pointer', lineHeight:1 }}>✕</button>
              </div>
              <div>
                {[['Brand Name *','brand_name','text','Indomie Nigeria'],['Client Email *','contactEmail','email','client@company.com'],['Campaign Date *','date','date',''],['Runs','runs','number','1']].map(([label,key,type,ph])=>(
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <input type={type} placeholder={ph} value={bForm[key]} style={inp}
                      onChange={e=>setBForm(f=>({...f,[key]:e.target.value}))}/>
                  </div>
                ))}
                <label className="form-label">Media Organisation *</label>
                <select value={bForm.mediaId} style={{ ...inp, background:'#0d0d18' }}
                  onChange={e=>setBForm(f=>({...f,mediaId:e.target.value,inventory_group:'',inventory_option:'',market:''}))}>
                  <option value="">Select media…</option>
                  {[...media].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(m=>(
                    <option key={m.mediaId} value={m.mediaId}>{m.name}</option>
                  ))}
                </select>
                {bForm.mediaId&&Object.keys(selInv).length>0&&(
                  <>
                    <label className="form-label">Inventory Group</label>
                    <select value={bForm.inventory_group} style={{ ...inp, background:'#0d0d18' }}
                      onChange={e=>setBForm(f=>({...f,inventory_group:e.target.value,inventory_option:'',market:''}))}>
                      <option value="">Select group…</option>
                      {Object.entries(selInv).map(([k,g])=><option key={k} value={k}>{g.label}</option>)}
                    </select>
                  </>
                )}
                {bForm.inventory_group&&(
                  <>
                    <label className="form-label">Option</label>
                    <select value={bForm.inventory_option} style={{ ...inp, background:'#0d0d18' }}
                      onChange={e=>setBForm(f=>({...f,inventory_option:e.target.value,market:''}))}>
                      <option value="">Select option…</option>
                      {Object.entries(selOpts).map(([k,o])=><option key={k} value={k}>{o.label}</option>)}
                    </select>
                  </>
                )}
                {bForm.inventory_option&&selMarkets.length>0&&(
                  <>
                    <label className="form-label">Market</label>
                    <select value={bForm.market} style={{ ...inp, background:'#0d0d18' }}
                      onChange={e=>setBForm(f=>({...f,market:e.target.value}))}>
                      <option value="">Select market…</option>
                      {selMarkets.map(m=><option key={m} value={m}>{m.replaceAll('_',' ')} — ₦{Number(selOpt.markets[m].price).toLocaleString()}</option>)}
                    </select>
                  </>
                )}
                {totalPrice>0&&(
                  <div style={{ padding:'10px 14px', borderRadius:9, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)', marginBottom:10 }}>
                    <p style={{ fontSize:10, color:'var(--text-muted)' }}>Total</p>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:20, color:'var(--accent-light)' }}>{fmt(totalPrice)}</p>
                  </div>
                )}
                <label className="form-label">Campaign Brief</label>
                <textarea rows={2} value={bForm.campaignBrief} placeholder="Campaign goals…" style={{ ...inp, resize:'none', fontFamily:'Inter,sans-serif' }}
                  onChange={e=>setBForm(f=>({...f,campaignBrief:e.target.value}))}/>
                <div style={{ display:'flex', gap:8, marginTop:6 }}>
                  <button onClick={()=>setShowBM(false)} className="btn-secondary" style={{ flex:1, fontSize:12 }}>Cancel</button>
                  <button onClick={submitAdminBooking} disabled={bSubmitting} className="btn-primary" style={{ flex:2, justifyContent:'center', fontSize:12 }}>
                    {bSubmitting?<><Spinner size={12}/>Creating…</>:'Create Booking →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:20 }}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              style={{ padding:'5px 14px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                background:activeTab===t.key?'var(--accent-soft)':'rgba(255,255,255,0.04)',
                color:activeTab===t.key?'var(--accent-light)':'var(--text-muted)',
                outline:activeTab===t.key?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
              }}>{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab==='overview'&&(
          <div className="space-y-5">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:10 }}>
              {[
                { label:'Total GMV',         value:fmt(totalRevenue),    color:'#a5b4fc', sub:`${bookings.length} bookings` },
                { label:'Commission',        value:fmt(totalCommission), color:'#fcd34d', sub:'15% platform fee'            },
                { label:'Subscription MRR',  value:fmt(subRevenue),      color:'#f472b6', sub:`${activeSubs} active subs`  },
                { label:'Pending Action',    value:pendingAction,         color:'#fcd34d', sub:'Provider confirmation'       },
                { label:'Pending Apps',      value:pendingApps,           color:'#fcd34d', sub:'Needs review'               },
                { label:'Media Orgs',        value:media.length,          color:'#d8b4fe', sub:'Total providers'            },
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color:s.color, fontSize:19 }}>{s.value}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="page-card" style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white' }}>Recent Bookings</p>
                  <button onClick={()=>setActiveTab('bookings')} style={{ fontSize:11, color:'var(--accent-light)', background:'none', border:'none', cursor:'pointer' }}>View all</button>
                </div>
                {[...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(b=>(
                  <div key={b.bookingId} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize:12, fontWeight:500, color:'white' }}>{b.brandName||b.contactEmail}</p>
                      <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{b.target} · {fmtDate(b.createdAt)}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontSize:12, fontWeight:500, color:'var(--accent-light)' }}>{fmt(b.finalPrice)}</p>
                      <span style={{ fontSize:9, color:STATUS_COLOR[b.status]||'var(--text-muted)' }}>{b.status?.replaceAll('_',' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="page-card" style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white' }}>
                    Pending Applications
                    {pendingApps>0&&<span style={{ marginLeft:7, padding:'1px 7px', borderRadius:20, background:'rgba(245,158,11,0.12)', color:'#fcd34d', fontSize:9 }}>{pendingApps}</span>}
                  </p>
                  <Link to="/applications" style={{ fontSize:11, color:'var(--accent-light)', textDecoration:'none' }}>Manage →</Link>
                </div>
                {providers.filter(p=>p.status==='PENDING').slice(0,5).map(p=>(
                  <div key={p.applicationId||p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'0.5px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize:12, fontWeight:500, color:'white' }}>{p.orgName||p.name||'—'}</p>
                      <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{p.contactEmail} · {fmtDate(p.createdAt)}</p>
                    </div>
                    <Link to="/applications" style={{ fontSize:10, padding:'3px 9px', borderRadius:7, background:'rgba(245,158,11,0.1)', color:'#fcd34d', textDecoration:'none', border:'0.5px solid rgba(245,158,11,0.2)' }}>Review</Link>
                  </div>
                ))}
                {providers.filter(p=>p.status==='PENDING').length===0&&<p style={{ fontSize:12, color:'var(--text-muted)', padding:'8px 0' }}>No pending applications</p>}
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab==='bookings'&&(
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:16 }}>
              {[['GMV',fmt(totalRevenue),'#a5b4fc'],['Commission',fmt(totalCommission),'#fcd34d'],['Active',bookings.filter(b=>['PAID','IN_PROGRESS'].includes(b.status)).length,'#5eead4'],['Completed',bookings.filter(b=>b.status==='COMPLETED').length,'#86efac']].map(([l,v,c])=>(
                <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c, fontSize:19 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead><tr>{['Brand','Media','Market','Date','Value','Commission','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(b=>(
                    <tr key={b.bookingId}>
                      <td style={{ color:'white', fontWeight:500 }}>{b.brandName||b.contactEmail}</td>
                      <td>{b.target||'—'}</td>
                      <td>{(b.market||'—').replaceAll('_',' ')}</td>
                      <td style={{ whiteSpace:'nowrap' }}>{fmtDate(b.date)}</td>
                      <td style={{ color:'var(--accent-light)', fontWeight:500 }}>{fmt(b.finalPrice)}</td>
                      <td style={{ color:'#fcd34d' }}>{fmt(b.platformCommission||b.finalPrice*0.15)}</td>
                      <td><span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:'rgba(255,255,255,0.06)', color:STATUS_COLOR[b.status]||'var(--text-muted)', whiteSpace:'nowrap' }}>{b.status?.replaceAll('_',' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROVIDERS */}
        {activeTab==='providers'&&(
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:16 }}>
              {[['Total',providers.length,'#a5b4fc'],['Pending',pendingApps,'#fcd34d'],['Approved',providers.filter(p=>p.status==='APPROVED').length,'#86efac'],['Rejected',providers.filter(p=>p.status==='REJECTED').length,'#fca5a5']].map(([l,v,c])=>(
                <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c, fontSize:19 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:10 }}>
              <Link to="/applications" className="btn-primary" style={{ fontSize:12, padding:'7px 14px', textDecoration:'none' }}>Manage Applications →</Link>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead><tr>{['Organisation','Category','Contact','Applied','Status','Action'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...providers].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(p=>(
                    <tr key={p.applicationId||p.id}>
                      <td style={{ color:'white', fontWeight:500 }}>{p.orgName||p.name||'—'}</td>
                      <td>{(p.category||'—').replaceAll('_',' ')}</td>
                      <td>{p.contactEmail||'—'}</td>
                      <td style={{ whiteSpace:'nowrap' }}>{fmtDate(p.createdAt)}</td>
                      <td><span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:p.status==='APPROVED'?'rgba(34,197,94,0.1)':p.status==='REJECTED'?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)', color:p.status==='APPROVED'?'#86efac':p.status==='REJECTED'?'#fca5a5':'#fcd34d' }}>{p.status||'PENDING'}</span></td>
                      <td><Link to="/applications" style={{ fontSize:10, color:'var(--accent-light)', textDecoration:'none' }}>Review →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBSCRIPTIONS */}
        {activeTab==='subscriptions'&&(
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:16 }}>
              {[['Active Subs',activeSubs,'#a5b4fc'],['MRR',fmt(subRevenue),'#86efac'],['Premium',subscriptions.filter(s=>s.tier==='PREMIUM'&&s.status==='ACTIVE').length,'#a5b4fc'],['Pro',subscriptions.filter(s=>s.tier==='PRO'&&s.status==='ACTIVE').length,'#fcd34d']].map(([l,v,c])=>(
                <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c, fontSize:19 }}>{v}</div></div>
              ))}
            </div>
            {subscriptions.length===0?<p style={{ color:'var(--text-muted)', fontSize:13, padding:'20px 0' }}>No subscription data yet.</p>:(
              <table className="data-table">
                <thead><tr>{['User','Plan','Amount','Activated','Expires','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {subscriptions.map((s,i)=>(
                    <tr key={i}>
                      <td style={{ color:'white' }}>{s.userId||'—'}</td>
                      <td><span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:s.tier==='PRO'?'rgba(245,158,11,0.1)':'var(--accent-soft)', color:s.tier==='PRO'?'#fcd34d':'var(--accent-light)' }}>{s.tier}</span></td>
                      <td style={{ color:'var(--accent-light)' }}>{fmt(s.amount)}</td>
                      <td style={{ whiteSpace:'nowrap' }}>{fmtDate(s.activatedAt)}</td>
                      <td style={{ whiteSpace:'nowrap' }}>{fmtDate(s.expiresAt)}</td>
                      <td><span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:s.status==='ACTIVE'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:s.status==='ACTIVE'?'#86efac':'#fca5a5' }}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MEDIA */}
        {activeTab==='media'&&(
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:9 }}>
                {[['Total Orgs',media.length,'#a5b4fc'],['With Inventory',media.filter(m=>{const i=typeof m.inventory==='string'?JSON.parse(m.inventory||'{}'):m.inventory||{};return Object.keys(i).length>0;}).length,'#86efac'],['Categories',new Set(media.map(m=>m.category)).size,'#fcd34d']].map(([l,v,c])=>(
                  <div key={l} className="stat-card" style={{ padding:'10px 12px' }}><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c, fontSize:17 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <Link to="/create-media" className="btn-primary" style={{ fontSize:12, padding:'7px 14px', textDecoration:'none' }}>+ Add Media</Link>
                <Link to="/admin/inventory" className="btn-secondary" style={{ fontSize:12, padding:'7px 14px', textDecoration:'none' }}>Inventory Manager</Link>
              </div>
            </div>
            <table className="data-table">
              <thead><tr>{['Name','Category','Contact','Inventory'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {[...media].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(m=>{
                  const inv=typeof m.inventory==='string'?JSON.parse(m.inventory||'{}'):(m.inventory||{});
                  const hasInv=Object.keys(inv).length>0;
                  return(
                    <tr key={m.mediaId}>
                      <td style={{ color:'white', fontWeight:500 }}>{m.name}</td>
                      <td>{(m.category||'—').replaceAll('_',' ')}</td>
                      <td>{m.contactEmail||'—'}</td>
                      <td><span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:hasInv?'rgba(34,197,94,0.1)':'rgba(245,158,11,0.08)', color:hasInv?'#86efac':'#fcd34d' }}>{hasInv?`${Object.keys(inv).length} groups`:'No inventory'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAYOUTS */}
        {activeTab==='payouts'&&(
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:16 }}>
              {[['Providers',payouts.length,'#a5b4fc'],['Total',fmt(payouts.reduce((s,p)=>s+p.totalPayout,0)),'#86efac'],['Pending',fmt(payouts.reduce((s,p)=>s+p.pendingPayout,0)),'#fcd34d'],['Released',fmt(payouts.reduce((s,p)=>s+p.releasedPayout,0)),'#86efac']].map(([l,v,c])=>(
                <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c, fontSize:19 }}>{v}</div></div>
              ))}
            </div>
            {payouts.length===0?<p style={{ color:'var(--text-muted)', fontSize:13 }}>No completed campaigns yet.</p>:payouts.map((provider,pi)=>(
              <div key={pi} style={{ marginBottom:14, borderRadius:10, background:'var(--bg-card)', border:'0.5px solid var(--border)', overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', background:'rgba(255,255,255,0.02)', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:500, fontSize:13, color:'white' }}>{provider.providerName}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{provider.providerEmail}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color:'#86efac' }}>{fmt(provider.totalPayout)}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)' }}>
                      <span style={{ color:'#fcd34d' }}>{fmt(provider.pendingPayout)} pending</span>
                      {provider.releasedPayout>0&&<span style={{ color:'#86efac', marginLeft:8 }}>{fmt(provider.releasedPayout)} released</span>}
                    </p>
                  </div>
                </div>
                {provider.bookings.map(b=>(
                  <div key={b.bookingId} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <p style={{ fontSize:12, fontWeight:500, color:'white' }}>{b.brandName||b.contactEmail}</p>
                      <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{b.target} · {fmtDate(b.date)}</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'#86efac' }}>{fmt(b.mediaPayout)}</p>
                        <span style={{ fontSize:9, fontWeight:600, padding:'2px 6px', borderRadius:20, background:b.payoutStatus==='RELEASED'?'rgba(34,197,94,0.1)':'rgba(245,158,11,0.1)', color:b.payoutStatus==='RELEASED'?'#86efac':'#fcd34d' }}>
                          {b.payoutStatus==='RELEASED'?'✓ Released':'Pending'}
                        </span>
                      </div>
                      {b.payoutStatus!=='RELEASED'&&(
                        <button onClick={()=>releasePayout(b.bookingId,provider.providerName)} disabled={!!releasing[b.bookingId]}
                          style={{ padding:'5px 12px', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', display:'flex', alignItems:'center', gap:4 }}>
                          {releasing[b.bookingId]?<><Spinner size={10}/>…</>:'💸 Release'}
                        </button>
                      )}
                      {b.payoutStatus==='RELEASED'&&<p style={{ fontSize:10, color:'var(--text-muted)' }}>{fmtDate(b.payoutReleasedAt)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  );
}