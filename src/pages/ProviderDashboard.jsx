import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d||'—'; }};
const timeAgo = (d) => { if(!d) return '—'; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60) return 'just now'; if(s<3600) return `${Math.floor(s/60)}m ago`; if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

const STATUS_META = {
  PENDING_PROVIDER_CONFIRMATION: { label:'Needs Response',    color:'var(--amber)', bg:'var(--amber-dim)',        dot:'var(--amber)',  urgent:true  },
  PAYMENT_PENDING:               { label:'Awaiting Payment',  color:'#a5b4fc',       bg:'rgba(99,102,241,0.08)', dot:'#a5b4fc',      urgent:false },
  PAID:                          { label:'Live — Upload Proof',color:'#5eead4',      bg:'rgba(94,234,212,0.08)', dot:'#5eead4',      urgent:false },
  IN_PROGRESS:                   { label:'In Progress',       color:'#d8b4fe',       bg:'rgba(168,85,247,0.08)',  dot:'#d8b4fe',      urgent:false },
  PENDING_DELIVERY_REVIEW:       { label:'Proof Submitted',   color:'#a5b4fc',       bg:'rgba(99,102,241,0.08)', dot:'#a5b4fc',      urgent:false },
  COMPLETED:                     { label:'Completed',         color:'#4ade80',       bg:'rgba(74,222,128,0.08)', dot:'#4ade80',      urgent:false },
  REJECTED:                      { label:'Declined',          color:'#fca5a5',       bg:'rgba(239,68,68,0.08)',  dot:'#fca5a5',      urgent:false },
};

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.05 } } };
const fadeUp  = { hidden:{ opacity:0, y:10 }, show:{ opacity:1, y:0, transition:{ duration:0.35, ease:[0.22,1,0.36,1] } } };

export default function ProviderDashboard() {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [acting, setActing]         = useState({});
  const [expanded, setExpanded]     = useState(null);
  const [moreInfoNotes, setMIN]     = useState({});
  const [proofUrl, setProofUrl]     = useState({});
  const [proofNotes, setProofNotes] = useState({});
  const [filter, setFilter]         = useState('ALL');

  const showToast = (type, msg) => { setToast({type,message:msg}); setTimeout(()=>setToast(null),3500); };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const h = await authHeader();
      const res = await axios.get(`${API}/bookings`,{headers:h});
      const all = Array.isArray(res.data)?res.data:res.data?.bookings??[];
      setBookings(all.sort((a,b)=>{
        const ap=a.status==='PENDING_PROVIDER_CONFIRMATION'?0:1;
        const bp=b.status==='PENDING_PROVIDER_CONFIRMATION'?0:1;
        return ap-bp||new Date(b.createdAt)-new Date(a.createdAt);
      }));
    } catch(e){ showToast('error',e.message); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchBookings(); },[]);

  const approve = async (bookingId) => {
    setActing(a=>({...a,[bookingId]:'approve'}));
    try {
      const h = await authHeader();
      await axios.post(`${API}/bookings/${bookingId}/approve`,{},{headers:h});
      showToast('success','✅ Approved — client notified to pay');
      await fetchBookings();
    } catch(e){ showToast('error',e.response?.data?.error||e.message); }
    finally{ setActing(a=>{const n={...a};delete n[bookingId];return n;}); }
  };

  const reject = async (bookingId) => {
    if (!window.confirm('Decline this booking?')) return;
    setActing(a=>({...a,[bookingId]:'reject'}));
    try {
      const h = await authHeader();
      await axios.post(`${API}/bookings/${bookingId}/reject`,{},{headers:h});
      showToast('success','Booking declined');
      await fetchBookings();
    } catch(e){ showToast('error',e.response?.data?.error||e.message); }
    finally{ setActing(a=>{const n={...a};delete n[bookingId];return n;}); }
  };

  const requestMoreInfo = (booking) => {
    const notes = moreInfoNotes[booking.bookingId]||'';
    const subject = `Re: Booking ${(booking.bookingId||'').slice(0,8).toUpperCase()} — More Information Needed`;
    const body = notes ? `Hello,\n\nRegarding your booking:\n\n${notes}\n\nKind regards` : `Hello,\n\nBefore confirming, we need:\n\n1. \n2. \n\nKind regards`;
    window.open(`mailto:${booking.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const submitProof = async (bookingId) => {
    if (!proofUrl[bookingId]){ showToast('error','Enter a proof URL first'); return; }
    setActing(a=>({...a,[bookingId]:'proof'}));
    try {
      const h = await authHeader();
      await axios.post(`${API}/bookings/proof`,{bookingId,fileUrl:proofUrl[bookingId],notes:proofNotes[bookingId]||'',uploadedBy:'provider'},{headers:h});
      showToast('success','Proof submitted');
      setProofUrl(p=>{const n={...p};delete n[bookingId];return n;});
      await fetchBookings();
    } catch(e){ showToast('error',e.message); }
    finally{ setActing(a=>{const n={...a};delete n[bookingId];return n;}); }
  };

  const pending           = bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length;
  const active            = bookings.filter(b=>['PAID','IN_PROGRESS'].includes(b.status)).length;
  const completed         = bookings.filter(b=>b.status==='COMPLETED').length;
  const revenue           = bookings.filter(b=>b.status==='COMPLETED').reduce((s,b)=>s+(b.mediaPayout||0),0);
  const released          = bookings.filter(b=>b.status==='COMPLETED'&&b.payoutStatus==='RELEASED').reduce((s,b)=>s+(b.mediaPayout||0),0);
  const awaitingRelease   = bookings.filter(b=>b.status==='COMPLETED'&&b.payoutStatus!=='RELEASED').reduce((s,b)=>s+(b.mediaPayout||0),0);

  const FILTERS = [
    {key:'ALL',                           label:'All',           count:bookings.length},
    {key:'PENDING_PROVIDER_CONFIRMATION', label:'Needs Response',count:pending,urgent:true},
    {key:'PAID',                          label:'Live',          count:active},
    {key:'PENDING_DELIVERY_REVIEW',       label:'Under Review',  count:bookings.filter(b=>b.status==='PENDING_DELIVERY_REVIEW').length},
    {key:'COMPLETED',                     label:'Completed',     count:completed},
  ];

  const filtered = filter==='ALL'?bookings:bookings.filter(b=>b.status===filter);
  const inp = { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', padding:'7px 0', fontSize:11, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none', marginBottom:8, borderRadius:0 };

  return (
    <>
      <PageTitle title="Provider Dashboard"/>
      <Layout title="My Bookings" subtitle="Provider Dashboard"
        actions={<button onClick={fetchBookings} className="btn-secondary" style={{ fontSize:10 }}>↻ Refresh</button>}
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginBottom:18 }}>
          {[
            {label:'Needs Action',    value:pending,             color:'var(--amber)', urgent:pending>0},
            {label:'Active',          value:active,              color:'#5eead4'},
            {label:'Completed',       value:completed,           color:'#4ade80'},
            {label:'Total Earned',    value:fmt(revenue),        color:'var(--amber)'},
            {label:'Awaiting Release',value:fmt(awaitingRelease),color:'#fcd34d'},
            {label:'Released',        value:fmt(released),       color:'#4ade80'},
          ].map(s=>(
            <div key={s.label} className="stat-card" style={{ borderTop:s.urgent?`2px solid var(--amber)`:'2px solid transparent' }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color:s.color,fontSize:17 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display:'flex',gap:8,marginBottom:18 }}>
          <Link to="/inventory" className="btn-secondary" style={{ fontSize:10,textDecoration:'none' }}>My Inventory</Link>
          <Link to="/proof-of-performance" className="btn-secondary" style={{ fontSize:10,textDecoration:'none' }}>Proof of Performance</Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex',gap:0,borderBottom:'1px solid var(--border)',marginBottom:16 }}>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)}
              style={{ padding:'7px 14px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',whiteSpace:'nowrap',
                color:filter===f.key?f.urgent?'var(--amber)':'var(--amber)':'var(--text3)',
                borderBottom:filter===f.key?'2px solid var(--amber)':'2px solid transparent',
                marginBottom:-1,transition:'all 0.15s' }}>
              {f.label}{f.count>0&&<span style={{ marginLeft:4,opacity:0.6 }}>({f.count})</span>}
            </button>
          ))}
        </div>

        {loading && <div style={{ display:'flex',gap:10,color:'var(--text3)',padding:'20px 0',alignItems:'center' }}><Spinner size={14}/>Loading…</div>}

        {!loading && filtered.length===0 && (
          <div style={{ textAlign:'center',padding:'48px',border:'1px solid var(--border)',borderStyle:'dashed' }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--text3)',letterSpacing:'0.1em',textTransform:'uppercase' }}>No bookings here</p>
            <p style={{ fontSize:12,color:'var(--text3)',marginTop:6 }}>When clients book your inventory, they will appear here.</p>
          </div>
        )}

        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
          {filtered.map(booking => {
            const status  = (booking.status||'').toUpperCase();
            const meta    = STATUS_META[status]||STATUS_META.PENDING_PROVIDER_CONFIRMATION;
            const bid     = booking.bookingId;
            const isOpen  = expanded===bid;
            const isPending  = status==='PENDING_PROVIDER_CONFIRMATION';
            const needsProof = ['PAID','IN_PROGRESS'].includes(status);

            return (
              <motion.div key={bid} variants={fadeUp}
                style={{ border:'1px solid var(--border)',borderLeft:`2px solid ${meta.urgent?'var(--amber)':'transparent'}`,overflow:'hidden',transition:'border-color 0.15s' }}>

                {/* Row header */}
                <div onClick={()=>setExpanded(isOpen?null:bid)}
                  style={{ padding:'12px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ width:7,height:7,background:meta.dot,flexShrink:0,boxShadow:meta.urgent?`0 0 6px ${meta.dot}`:undefined }}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:2 }}>
                      <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:'var(--text)' }}>{booking.brandName||'—'}</p>
                      <span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'1px 7px',background:meta.bg,color:meta.color,letterSpacing:'0.06em',whiteSpace:'nowrap' }}>{meta.label}</span>
                    </div>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {booking.target} · {(booking.inventoryOption||'').replaceAll('_',' ')} · {booking.market}{booking.runs>1?` · ×${booking.runs}`:''}{booking.date?` · ${fmtDate(booking.date)}`:''}
                    </p>
                  </div>
                  <div style={{ textAlign:'right',flexShrink:0 }}>
                    <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,color:'#4ade80' }}>{fmt(booking.mediaPayout)}</p>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginTop:1 }}>{timeAgo(booking.createdAt)}</p>
                  </div>
                  <span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--text3)',flexShrink:0,transition:'transform 0.2s',display:'inline-block',transform:isOpen?'rotate(180deg)':'none' }}>⌄</span>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}
                      transition={{ duration:0.3,ease:[0.22,1,0.36,1] }}
                      style={{ overflow:'hidden',borderTop:'1px solid var(--border)' }}>
                      <div style={{ padding:'14px 16px' }}>
                        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12 }}>
                          {[['Campaign Value',fmt(booking.finalPrice)],['Your Payout',fmt(booking.mediaPayout)],['Client',booking.contactEmail||'—'],['Category',(booking.category||'—').replaceAll('_',' ')],['Date',fmtDate(booking.date)],['Ref',(booking.bookingId||'').slice(0,8).toUpperCase()]].map(([l,v])=>(
                            <div key={l} style={{ padding:'8px 10px',background:'var(--bg3)',border:'1px solid var(--border2)' }}>
                              <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2 }}>{l}</div>
                              <div style={{ fontSize:11,fontWeight:500,color:'var(--text)',wordBreak:'break-all' }}>{v}</div>
                            </div>
                          ))}
                        </div>

                        {booking.campaignBrief && (
                          <div style={{ padding:'10px 12px',background:'var(--amber-dim)',borderLeft:'2px solid var(--amber)',marginBottom:12 }}>
                            <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>Campaign Brief</div>
                            <p style={{ fontSize:11,color:'var(--text2)',lineHeight:1.7 }}>{booking.campaignBrief}</p>
                          </div>
                        )}

                        {isPending && (
                          <div style={{ padding:'14px',background:'var(--bg3)',border:'1px solid var(--amber-border)' }}>
                            <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 }}>Respond to Booking</div>
                            <p style={{ fontSize:11,color:'var(--text3)',marginBottom:10,lineHeight:1.6 }}>Payout of <span style={{ color:'#4ade80' }}>{fmt(booking.mediaPayout)}</span> released after delivery approval.</p>
                            <input style={{ ...inp,marginBottom:10 }} placeholder="Questions for 'Get More Info' (optional)…" value={moreInfoNotes[bid]||''} onChange={e=>setMIN(p=>({...p,[bid]:e.target.value}))}/>
                            <div style={{ display:'flex',gap:8 }}>
                              <button onClick={()=>approve(bid)} disabled={!!acting[bid]}
                                style={{ flex:1,padding:'8px',background:'#4ade80',color:'#0a0a0f',border:'none',fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5,letterSpacing:'0.04em' }}>
                                {acting[bid]==='approve'?<><Spinner size={10}/>…</>:'✓ Approve'}
                              </button>
                              <button onClick={()=>requestMoreInfo(booking)}
                                style={{ flex:1,padding:'8px',background:'var(--amber-dim)',color:'var(--amber)',border:'1px solid var(--amber-border)',fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5 }}>
                                💬 More Info
                              </button>
                              <button onClick={()=>reject(bid)} disabled={!!acting[bid]}
                                style={{ flex:1,padding:'8px',background:'rgba(239,68,68,0.08)',color:'#fca5a5',border:'1px solid rgba(239,68,68,0.18)',fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5 }}>
                                {acting[bid]==='reject'?<><Spinner size={10}/>…</>:'✕ Decline'}
                              </button>
                            </div>
                          </div>
                        )}

                        {needsProof && (
                          <div style={{ padding:'13px',background:'var(--bg3)',border:'1px solid rgba(168,85,247,0.2)' }}>
                            <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#d8b4fe',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8 }}>Upload Delivery Proof</div>
                            <input type="url" placeholder="https://… proof link or screenshot URL" value={proofUrl[bid]||''} onChange={e=>setProofUrl(p=>({...p,[bid]:e.target.value}))} style={inp}/>
                            <input placeholder="Notes (optional)" value={proofNotes[bid]||''} onChange={e=>setProofNotes(p=>({...p,[bid]:e.target.value}))} style={{ ...inp,marginBottom:10 }}/>
                            <button onClick={()=>submitProof(bid)} disabled={!!acting[bid]} className="btn-primary" style={{ fontSize:10 }}>
                              {acting[bid]==='proof'?<><Spinner size={10}/>Uploading…</>:'Submit Proof →'}
                            </button>
                          </div>
                        )}

                        {status==='PENDING_DELIVERY_REVIEW' && (
                          <div style={{ padding:'10px 12px',background:'var(--amber-dim)',borderLeft:'2px solid var(--amber)' }}>
                            <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--amber)' }}>Proof submitted — awaiting client approval</p>
                            <p style={{ fontSize:11,color:'var(--text3)',marginTop:3 }}>Payout of {fmt(booking.mediaPayout)} released once approved.</p>
                          </div>
                        )}

                        {status==='COMPLETED' && (
                          <div style={{ padding:'10px 12px',background:'rgba(74,222,128,0.06)',borderLeft:'2px solid #4ade80' }}>
                            <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#4ade80' }}>Campaign completed</p>
                            <p style={{ fontSize:11,color:'var(--text3)',marginTop:3 }}>
                              {booking.payoutStatus==='RELEASED'?`Payout of ${fmt(booking.mediaPayout)} released`:`Payout of ${fmt(booking.mediaPayout)} pending release`}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </Layout>
    </>
  );
}