import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  COMPLETED:'#4ade80', PAID:'#5eead4', IN_PROGRESS:'#d8b4fe',
  PENDING_DELIVERY_REVIEW:'var(--amber)', PENDING_PROVIDER_CONFIRMATION:'var(--amber)',
  PAYMENT_PENDING:'#a5b4fc', REJECTED:'#fca5a5',
};

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.05 } } };
const fadeUp  = { hidden:{ opacity:0, y:10 }, show:{ opacity:1, y:0, transition:{ duration:0.35, ease:[0.22,1,0.36,1] } } };

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
  const [showBM, setShowBM]           = useState(false);
  const [bForm, setBForm]             = useState({ brand_name:'', contactEmail:'', mediaId:'', inventory_group:'', inventory_option:'', market:'', date:'', runs:1, campaignBrief:'' });
  const [bSub, setBSub]               = useState(false);

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
      const h = await authHeader();
      const [bR,mR,pR] = await Promise.all([
        axios.get(`${API}/bookings`,{headers:h}),
        axios.get(`${API}/media`,{headers:h}),
        axios.get(`${API}/providers`,{headers:h}),
      ]);
      setBookings(Array.isArray(bR.data)?bR.data:bR.data?.bookings??[]);
      setMedia(Array.isArray(mR.data)?mR.data:mR.data?.media??[]);
      setProviders(Array.isArray(pR.data)?pR.data:pR.data?.providers??[]);
      try{ const sR=await axios.get(`${API}/subscription/all`,{headers:h}); setSubs(Array.isArray(sR.data)?sR.data:[]); }catch{ setSubs([]); }
      try{ const pyR=await axios.get(`${API}/admin/payouts`,{headers:h}); setPayouts(Array.isArray(pyR.data)?pyR.data:[]); }catch{ setPayouts([]); }
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ loadAll(); },[]);

  const releasePayout = async (bookingId, providerName) => {
    if (!window.confirm(`Release payout for ${providerName}?`)) return;
    setReleasing(r=>({...r,[bookingId]:true}));
    try {
      const h = await authHeader();
      await axios.post(`${API}/admin/payouts/release`,{bookingId},{headers:h});
      showToast('success',`Payout released for ${providerName}`);
      await loadAll();
    } catch(e){ showToast('error',e.response?.data?.error||e.message); }
    finally{ setReleasing(r=>{const n={...r};delete n[bookingId];return n;}); }
  };

  const submitAdminBooking = async () => {
    if (!bForm.brand_name||!bForm.contactEmail||!bForm.mediaId||!bForm.date){ showToast('error','Fill in all required fields'); return; }
    setBSub(true);
    try {
      const h = await authHeader();
      await axios.post(`${API}/campaigns`,{
        brand_name:bForm.brand_name,contactEmail:bForm.contactEmail,campaignBrief:bForm.campaignBrief,
        items:[{mediaId:bForm.mediaId,mediaName:selMedia?.name,category:selMedia?.category||'',inventory_group:bForm.inventory_group,inventory_option:bForm.inventory_option,groupLabel:selGroup?.label||bForm.inventory_group,optionLabel:selOpt?.label||bForm.inventory_option,market:bForm.market,date:bForm.date,runs:Math.max(1,Number(bForm.runs)||1),price:totalPrice,unitPrice}],
      },{headers:h});
      showToast('success','Booking created');
      setShowBM(false);
      setBForm({brand_name:'',contactEmail:'',mediaId:'',inventory_group:'',inventory_option:'',market:'',date:'',runs:1,campaignBrief:''});
      await loadAll();
    } catch(e){ showToast('error',e.response?.data?.error||e.message); }
    finally{ setBSub(false); }
  };

  const totalRevenue    = bookings.reduce((s,b)=>s+(Number(b.finalPrice)||0),0);
  const totalCommission = bookings.reduce((s,b)=>s+(Number(b.platformCommission)||Number(b.finalPrice||0)*0.15),0);
  const activeSubs      = subscriptions.filter(s=>s.status==='ACTIVE').length;
  const pendingApps     = providers.filter(p=>p.status==='PENDING').length;

  const TABS = [
    {key:'overview',      label:'Overview'},
    {key:'bookings',      label:`Bookings (${bookings.length})`},
    {key:'providers',     label:`Providers (${providers.length})`},
    {key:'subscriptions', label:`Subs (${activeSubs})`},
    {key:'media',         label:`Media (${media.length})`},
    {key:'payouts',       label:`Payouts (${payouts.length})`},
  ];

  const inp = { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', padding:'7px 0', fontSize:12, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none', marginBottom:10, borderRadius:0 };
  const sel = { ...inp, background:'#0e0e16', cursor:'pointer' };

  if (loading) return (
    <Layout title="Admin Dashboard" subtitle="Platform Operations">
      <PageTitle title="Admin Dashboard"/>
      <div style={{ display:'flex',gap:10,color:'var(--text3)',padding:'40px 0',alignItems:'center' }}><Spinner size={14}/>Loading…</div>
    </Layout>
  );

  return (
    <>
      <PageTitle title="Admin Dashboard"/>
      <Layout title="Admin Dashboard" subtitle="Platform Operations"
        actions={
          <div style={{ display:'flex',gap:8 }}>
            <button onClick={()=>setShowBM(true)} className="btn-primary" style={{ fontSize:10,padding:'7px 16px' }}>+ Create Booking</button>
            <button onClick={loadAll} className="btn-secondary" style={{ fontSize:10,padding:'7px 12px' }}>↻</button>
          </div>
        }
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Create Booking Modal */}
        {showBM && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
            <div style={{ background:'#0e0e16',border:'1px solid var(--amber-border)',padding:24,width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto' }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:18 }}>
                <div>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:4 }}>Admin Action</div>
                  <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:14,color:'var(--text)' }}>Create Booking</p>
                </div>
                <button onClick={()=>setShowBM(false)} style={{ background:'none',border:'none',color:'var(--text3)',fontSize:18,cursor:'pointer' }}>✕</button>
              </div>
              {[['Brand Name *','brand_name','text','Indomie Nigeria'],['Client Email *','contactEmail','email','client@co.com'],['Date *','date','date',''],['Runs','runs','number','1']].map(([label,key,type,ph])=>(
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input type={type} placeholder={ph} value={bForm[key]} style={inp} onChange={e=>setBForm(f=>({...f,[key]:e.target.value}))}/>
                </div>
              ))}
              <label className="form-label">Media Organisation *</label>
              <select value={bForm.mediaId} style={sel} onChange={e=>setBForm(f=>({...f,mediaId:e.target.value,inventory_group:'',inventory_option:'',market:''}))}>
                <option value="">Select media…</option>
                {[...media].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(m=><option key={m.mediaId} value={m.mediaId}>{m.name}</option>)}
              </select>
              {bForm.mediaId&&Object.keys(selInv).length>0&&<>
                <label className="form-label">Group</label>
                <select value={bForm.inventory_group} style={sel} onChange={e=>setBForm(f=>({...f,inventory_group:e.target.value,inventory_option:'',market:''}))}>
                  <option value="">Select group…</option>
                  {Object.entries(selInv).map(([k,g])=><option key={k} value={k}>{g.label}</option>)}
                </select>
              </>}
              {bForm.inventory_group&&<>
                <label className="form-label">Option</label>
                <select value={bForm.inventory_option} style={sel} onChange={e=>setBForm(f=>({...f,inventory_option:e.target.value,market:''}))}>
                  <option value="">Select option…</option>
                  {Object.entries(selOpts).map(([k,o])=><option key={k} value={k}>{o.label}</option>)}
                </select>
              </>}
              {bForm.inventory_option&&selMarkets.length>0&&<>
                <label className="form-label">Market</label>
                <select value={bForm.market} style={sel} onChange={e=>setBForm(f=>({...f,market:e.target.value}))}>
                  <option value="">Select market…</option>
                  {selMarkets.map(m=><option key={m} value={m}>{m.replaceAll('_',' ')} — ₦{Number(selOpt.markets[m].price).toLocaleString()}</option>)}
                </select>
              </>}
              {totalPrice>0&&<div style={{ padding:'10px 14px',background:'var(--amber-dim)',border:'1px solid var(--amber-border)',marginBottom:12 }}>
                <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:2 }}>Total</div>
                <div style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:20,color:'var(--amber)' }}>{fmt(totalPrice)}</div>
              </div>}
              <label className="form-label">Campaign Brief</label>
              <textarea rows={2} value={bForm.campaignBrief} placeholder="Campaign goals…" style={{ ...inp,resize:'none',fontFamily:'Inter,sans-serif',marginBottom:14 }} onChange={e=>setBForm(f=>({...f,campaignBrief:e.target.value}))}/>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>setShowBM(false)} className="btn-secondary" style={{ flex:1,fontSize:10 }}>Cancel</button>
                <button onClick={submitAdminBooking} disabled={bSub} className="btn-primary" style={{ flex:2,justifyContent:'center',fontSize:10 }}>
                  {bSub?<><Spinner size={11}/>Creating…</>:'Create Booking →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex',gap:0,borderBottom:'1px solid var(--border)',marginBottom:20,overflowX:'auto' }}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              style={{ padding:'8px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',whiteSpace:'nowrap',
                color:activeTab===t.key?'var(--amber)':'var(--text3)',
                borderBottom:activeTab===t.key?'2px solid var(--amber)':'2px solid transparent',
                marginBottom:-1,transition:'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" key={activeTab}>

          {/* OVERVIEW */}
          {activeTab==='overview'&&(
            <motion.div variants={fadeUp} className="space-y-4">
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10 }}>
                {[
                  {label:'Total GMV',       value:fmt(totalRevenue),    color:'var(--amber)', sub:`${bookings.length} bookings`},
                  {label:'Commission',      value:fmt(totalCommission), color:'#fcd34d',      sub:'15% platform fee'},
                  {label:'Active Subs',     value:activeSubs,            color:'#5eead4',      sub:'Premium + Pro'},
                  {label:'Pending Apps',    value:pendingApps,           color:'var(--amber)', sub:'Needs review'},
                  {label:'Media Orgs',      value:media.length,          color:'#d8b4fe',      sub:'Total providers'},
                  {label:'Pending Action',  value:bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length, color:'var(--amber)', sub:'Awaiting provider'},
                ].map(s=>(
                  <motion.div key={s.label} variants={fadeUp} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color:s.color,fontSize:20 }}>{s.value}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </motion.div>
                ))}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                <div className="page-card" style={{ padding:'16px 18px' }}>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12 }}>Recent Bookings</div>
                  {[...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(b=>(
                    <div key={b.bookingId} style={{ display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border2)',borderLeft:'2px solid transparent',paddingLeft:8,marginLeft:-8,transition:'border-color 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.borderLeftColor='var(--amber)'}
                      onMouseLeave={e=>e.currentTarget.style.borderLeftColor='transparent'}>
                      <div>
                        <p style={{ fontSize:12,fontWeight:500,color:'var(--text)' }}>{b.brandName||b.contactEmail}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginTop:1 }}>{b.target} · {fmtDate(b.createdAt)}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:12,color:'var(--amber)' }}>{fmt(b.finalPrice)}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:STATUS_COLOR[b.status]||'var(--text3)',marginTop:1 }}>{(b.status||'').replaceAll('_',' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="page-card" style={{ padding:'16px 18px' }}>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
                    <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',letterSpacing:'0.14em',textTransform:'uppercase' }}>Pending Applications</div>
                    <Link to="/applications" style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',textDecoration:'none',letterSpacing:'0.06em' }}>Manage →</Link>
                  </div>
                  {providers.filter(p=>p.status==='PENDING').slice(0,5).map(p=>(
                    <div key={p.applicationId||p.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border2)' }}>
                      <div>
                        <p style={{ fontSize:12,fontWeight:500,color:'var(--text)' }}>{p.orgName||'—'}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginTop:1 }}>{p.contactEmail} · {fmtDate(p.createdAt)}</p>
                      </div>
                      <Link to="/applications" style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'3px 8px',background:'var(--amber-dim)',color:'var(--amber)',border:'1px solid var(--amber-border)',textDecoration:'none',letterSpacing:'0.06em' }}>Review</Link>
                    </div>
                  ))}
                  {providers.filter(p=>p.status==='PENDING').length===0&&<p style={{ fontSize:11,color:'var(--text3)' }}>No pending applications</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* BOOKINGS */}
          {activeTab==='bookings'&&(
            <motion.div variants={fadeUp}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10,marginBottom:16 }}>
                {[['GMV',fmt(totalRevenue),'var(--amber)'],['Commission',fmt(totalCommission),'#fcd34d'],['Active',bookings.filter(b=>['PAID','IN_PROGRESS'].includes(b.status)).length,'#5eead4'],['Completed',bookings.filter(b=>b.status==='COMPLETED').length,'#4ade80']].map(([l,v,c])=>(
                  <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c,fontSize:19 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ overflowX:'auto' }}>
                <table className="data-table">
                  <thead><tr>{['Brand','Media','Market','Date','Value','Commission','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(b=>(
                      <tr key={b.bookingId}>
                        <td style={{ color:'var(--text)',fontWeight:500 }}>{b.brandName||b.contactEmail}</td>
                        <td>{b.target||'—'}</td>
                        <td style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10 }}>{(b.market||'—').replaceAll('_',' ')}</td>
                        <td style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap' }}>{fmtDate(b.date)}</td>
                        <td style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,color:'var(--amber)' }}>{fmt(b.finalPrice)}</td>
                        <td style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#fcd34d' }}>{fmt(b.platformCommission||b.finalPrice*0.15)}</td>
                        <td><span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 7px',color:STATUS_COLOR[b.status]||'var(--text3)',background:'rgba(255,255,255,0.04)',letterSpacing:'0.06em',whiteSpace:'nowrap' }}>{(b.status||'').replaceAll('_',' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* PROVIDERS */}
          {activeTab==='providers'&&(
            <motion.div variants={fadeUp}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10,marginBottom:16 }}>
                {[['Total',providers.length,'var(--amber)'],['Pending',pendingApps,'#fcd34d'],['Approved',providers.filter(p=>p.status==='APPROVED').length,'#4ade80'],['Rejected',providers.filter(p=>p.status==='REJECTED').length,'#fca5a5']].map(([l,v,c])=>(
                  <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c,fontSize:19 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:10 }}>
                <Link to="/applications" className="btn-primary" style={{ fontSize:10,padding:'7px 16px',textDecoration:'none' }}>Manage Applications →</Link>
              </div>
              <table className="data-table">
                <thead><tr>{['Organisation','Category','Contact','Applied','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...providers].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(p=>(
                    <tr key={p.applicationId||p.id}>
                      <td style={{ color:'var(--text)',fontWeight:500 }}>{p.orgName||'—'}</td>
                      <td style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10 }}>{(p.category||'—').replaceAll('_',' ')}</td>
                      <td>{p.contactEmail||'—'}</td>
                      <td style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap' }}>{fmtDate(p.createdAt)}</td>
                      <td><span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 7px',letterSpacing:'0.06em',background:p.status==='APPROVED'?'rgba(74,222,128,0.08)':p.status==='REJECTED'?'rgba(239,68,68,0.08)':'var(--amber-dim)',color:p.status==='APPROVED'?'#4ade80':p.status==='REJECTED'?'#fca5a5':'var(--amber)' }}>{p.status||'PENDING'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* SUBSCRIPTIONS */}
          {activeTab==='subscriptions'&&(
            <motion.div variants={fadeUp}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10,marginBottom:16 }}>
                {[['Active',activeSubs,'var(--amber)'],['MRR',fmt(subscriptions.filter(s=>s.status==='ACTIVE').reduce((t,s)=>t+(Number(s.amount)||0),0)),'#4ade80'],['Premium',subscriptions.filter(s=>s.tier==='PREMIUM'&&s.status==='ACTIVE').length,'#a5b4fc'],['Pro',subscriptions.filter(s=>s.tier==='PRO'&&s.status==='ACTIVE').length,'#fcd34d']].map(([l,v,c])=>(
                  <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c,fontSize:19 }}>{v}</div></div>
                ))}
              </div>
              {subscriptions.length===0?<p style={{ color:'var(--text3)',fontSize:12 }}>No subscription data yet.</p>:(
                <table className="data-table">
                  <thead><tr>{['User','Plan','Amount','Activated','Expires','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {subscriptions.map((s,i)=>(
                      <tr key={i}>
                        <td>{s.userId||'—'}</td>
                        <td><span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 7px',background:s.tier==='PRO'?'rgba(94,234,212,0.08)':'var(--amber-dim)',color:s.tier==='PRO'?'#5eead4':'var(--amber)',letterSpacing:'0.06em' }}>{s.tier}</span></td>
                        <td style={{ fontFamily:'Manrope,sans-serif',fontWeight:600,color:'var(--amber)' }}>{fmt(s.amount)}</td>
                        <td style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap' }}>{fmtDate(s.activatedAt)}</td>
                        <td style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap' }}>{fmtDate(s.expiresAt)}</td>
                        <td><span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 7px',background:s.status==='ACTIVE'?'rgba(74,222,128,0.08)':'rgba(239,68,68,0.08)',color:s.status==='ACTIVE'?'#4ade80':'#fca5a5',letterSpacing:'0.06em' }}>{s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          )}

          {/* MEDIA */}
          {activeTab==='media'&&(
            <motion.div variants={fadeUp}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8 }}>
                <div style={{ display:'flex',gap:10 }}>
                  {[['Total',media.length,'var(--amber)'],['With Inventory',media.filter(m=>{const i=typeof m.inventory==='string'?JSON.parse(m.inventory||'{}'):(m.inventory||{});return Object.keys(i).length>0;}).length,'#4ade80']].map(([l,v,c])=>(
                    <div key={l} className="stat-card" style={{ padding:'10px 14px',minWidth:100 }}><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c,fontSize:18 }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ display:'flex',gap:8 }}>
                  <Link to="/create-media" className="btn-primary" style={{ fontSize:10,padding:'7px 14px',textDecoration:'none' }}>+ Add Media</Link>
                  <Link to="/admin/inventory" className="btn-secondary" style={{ fontSize:10,padding:'7px 14px',textDecoration:'none' }}>Inventory Manager</Link>
                </div>
              </div>
              <table className="data-table">
                <thead><tr>{['Name','Category','Contact','Inventory'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...media].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(m=>{
                    const inv=typeof m.inventory==='string'?JSON.parse(m.inventory||'{}'):(m.inventory||{});
                    return(
                      <tr key={m.mediaId}>
                        <td style={{ color:'var(--text)',fontWeight:500 }}>{m.name}</td>
                        <td style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10 }}>{(m.category||'—').replaceAll('_',' ')}</td>
                        <td>{m.contactEmail||'—'}</td>
                        <td><span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 7px',background:Object.keys(inv).length>0?'rgba(74,222,128,0.08)':'var(--amber-dim)',color:Object.keys(inv).length>0?'#4ade80':'var(--amber)',letterSpacing:'0.06em' }}>{Object.keys(inv).length>0?`${Object.keys(inv).length} groups`:'No inventory'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* PAYOUTS */}
          {activeTab==='payouts'&&(
            <motion.div variants={fadeUp}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10,marginBottom:16 }}>
                {[['Providers',payouts.length,'var(--amber)'],['Total',fmt(payouts.reduce((s,p)=>s+p.totalPayout,0)),'#4ade80'],['Pending',fmt(payouts.reduce((s,p)=>s+p.pendingPayout,0)),'#fcd34d'],['Released',fmt(payouts.reduce((s,p)=>s+p.releasedPayout,0)),'#4ade80']].map(([l,v,c])=>(
                  <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-value" style={{ color:c,fontSize:19 }}>{v}</div></div>
                ))}
              </div>
              {payouts.length===0?<p style={{ color:'var(--text3)',fontSize:12 }}>No completed campaigns yet.</p>:payouts.map((provider,pi)=>(
                <div key={pi} style={{ marginBottom:12,border:'1px solid var(--border)' }}>
                  <div style={{ padding:'12px 16px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <div>
                      <p style={{ fontWeight:600,fontSize:12,color:'var(--text)' }}>{provider.providerName}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginTop:1 }}>{provider.providerEmail}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:14,color:'#4ade80' }}>{fmt(provider.totalPayout)}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginTop:1 }}>
                        <span style={{ color:'var(--amber)' }}>{fmt(provider.pendingPayout)} pending</span>
                        {provider.releasedPayout>0&&<span style={{ color:'#4ade80',marginLeft:8 }}>{fmt(provider.releasedPayout)} released</span>}
                      </p>
                    </div>
                  </div>
                  {provider.bookings.map(b=>(
                    <div key={b.bookingId} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid var(--border2)' }}>
                      <div>
                        <p style={{ fontSize:11,fontWeight:500,color:'var(--text)' }}>{b.brandName||b.contactEmail}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginTop:1 }}>{b.target} · {fmtDate(b.date)}</p>
                      </div>
                      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:12,color:'#4ade80' }}>{fmt(b.mediaPayout)}</p>
                          <span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'1px 6px',background:b.payoutStatus==='RELEASED'?'rgba(74,222,128,0.08)':'var(--amber-dim)',color:b.payoutStatus==='RELEASED'?'#4ade80':'var(--amber)',letterSpacing:'0.06em' }}>
                            {b.payoutStatus==='RELEASED'?'Released':'Pending'}
                          </span>
                        </div>
                        {b.payoutStatus!=='RELEASED'&&(
                          <button onClick={()=>releasePayout(b.bookingId,provider.providerName)} disabled={!!releasing[b.bookingId]}
                            style={{ padding:'5px 12px',background:'#4ade80',color:'#0a0a0f',border:'none',fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',gap:4,letterSpacing:'0.04em' }}>
                            {releasing[b.bookingId]?<><Spinner size={9}/>…</>:'Release'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          )}

        </motion.div>
      </Layout>
    </>
  );
}