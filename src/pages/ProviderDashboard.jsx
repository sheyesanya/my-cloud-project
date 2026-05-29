import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
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
  PENDING_PROVIDER_CONFIRMATION: { label:'Needs Response',   color:'#fcd34d', bg:'rgba(245,158,11,0.1)',  dot:'#f59e0b' },
  PAYMENT_PENDING:               { label:'Awaiting Payment', color:'#a5b4fc', bg:'var(--accent-soft)',    dot:'#6366f1' },
  PAID:                          { label:'Live — Upload Proof',color:'#5eead4',bg:'rgba(20,184,166,0.1)', dot:'#14b8a6' },
  IN_PROGRESS:                   { label:'In Progress',      color:'#d8b4fe', bg:'rgba(168,85,247,0.1)', dot:'#a855f7' },
  PENDING_DELIVERY_REVIEW:       { label:'Proof Submitted',  color:'#a5b4fc', bg:'var(--accent-soft)',    dot:'#6366f1' },
  COMPLETED:                     { label:'Completed',        color:'#86efac', bg:'rgba(34,197,94,0.1)',   dot:'#22c55e' },
  REJECTED:                      { label:'Declined',         color:'#fca5a5', bg:'rgba(239,68,68,0.1)',   dot:'#ef4444' },
};

export default function ProviderDashboard() {
  const { user }                    = useAuth();
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
      const headers = await authHeader();
      const res = await axios.get(`${API}/bookings`, {headers});
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
      const headers = await authHeader();
      await axios.post(`${API}/bookings/${bookingId}/approve`, {}, {headers});
      showToast('success','✅ Approved — client notified to pay');
      await fetchBookings();
    } catch(e){ showToast('error', e.response?.data?.error||e.message); }
    finally{ setActing(a=>{const n={...a};delete n[bookingId];return n;}); }
  };

  const reject = async (bookingId) => {
    if(!window.confirm('Decline this booking?')) return;
    setActing(a=>({...a,[bookingId]:'reject'}));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/${bookingId}/reject`, {}, {headers});
      showToast('success','Booking declined');
      await fetchBookings();
    } catch(e){ showToast('error', e.response?.data?.error||e.message); }
    finally{ setActing(a=>{const n={...a};delete n[bookingId];return n;}); }
  };

  const requestMoreInfo = (booking) => {
    const notes = moreInfoNotes[booking.bookingId]||'';
    const subject = `Re: Booking ${booking.bookingId?.slice(0,8).toUpperCase()} — More Information Needed`;
    const body = notes
      ? `Hello,\n\nRegarding your booking:\n\n${notes}\n\nPlease reply.\n\nKind regards`
      : `Hello,\n\nThank you for your booking. Before we confirm, please provide:\n\n1. \n2. \n3. \n\nKind regards`;
    window.open(`mailto:${booking.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const submitProof = async (bookingId) => {
    if(!proofUrl[bookingId]){ showToast('error','Enter a proof URL first'); return; }
    setActing(a=>({...a,[bookingId]:'proof'}));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/proof`, {bookingId, fileUrl:proofUrl[bookingId], notes:proofNotes[bookingId]||'', uploadedBy:'provider'}, {headers});
      showToast('success','Proof submitted');
      setProofUrl(p=>{const n={...p};delete n[bookingId];return n;});
      await fetchBookings();
    } catch(e){ showToast('error',e.message); }
    finally{ setActing(a=>{const n={...a};delete n[bookingId];return n;}); }
  };

  const pending       = bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length;
  const active        = bookings.filter(b=>['PAID','IN_PROGRESS'].includes(b.status)).length;
  const completed     = bookings.filter(b=>b.status==='COMPLETED').length;
  const revenue       = bookings.filter(b=>b.status==='COMPLETED').reduce((s,b)=>s+(b.mediaPayout||0),0);
  const released      = bookings.filter(b=>b.status==='COMPLETED'&&b.payoutStatus==='RELEASED').reduce((s,b)=>s+(b.mediaPayout||0),0);
  const awaitingRelease = bookings.filter(b=>b.status==='COMPLETED'&&b.payoutStatus!=='RELEASED').reduce((s,b)=>s+(b.mediaPayout||0),0);

  const FILTERS = [
    { key:'ALL',                           label:'All',           count:bookings.length },
    { key:'PENDING_PROVIDER_CONFIRMATION', label:'Needs Response',count:pending, urgent:true },
    { key:'PAID',                          label:'Live',          count:active },
    { key:'PENDING_DELIVERY_REVIEW',       label:'Under Review',  count:bookings.filter(b=>b.status==='PENDING_DELIVERY_REVIEW').length },
    { key:'COMPLETED',                     label:'Completed',     count:completed },
  ];

  const filtered = filter==='ALL'?bookings:bookings.filter(b=>b.status===filter);

  const inp = { width:'100%', padding:'8px 11px', borderRadius:8, fontSize:11, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', fontFamily:'Inter,sans-serif' };

  return (
    <>
      <PageTitle title="Provider Dashboard" description="Manage booking requests, approve campaigns and upload delivery proofs."/>
      <Layout title="My Bookings" subtitle="Manage requests, approve and upload delivery proofs"
        actions={<button onClick={fetchBookings} className="btn-secondary" style={{ fontSize:12 }}>↻ Refresh</button>}
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginBottom:18 }}>
          {[
            { label:'Needs Action',    value:pending,             color:'#fcd34d', urgent:pending>0 },
            { label:'Active',          value:active,              color:'#5eead4' },
            { label:'Completed',       value:completed,           color:'#86efac' },
            { label:'Total Earned',    value:fmt(revenue),        color:'var(--accent-light)' },
            { label:'Awaiting Release',value:fmt(awaitingRelease),color:'#fcd34d' },
            { label:'Released',        value:fmt(released),       color:'#86efac' },
          ].map(s=>(
            <div key={s.label} className="stat-card" style={{ position:'relative', ...(s.urgent?{borderColor:'rgba(245,158,11,0.25)',background:'rgba(245,158,11,0.04)'}:{}) }}>
              {s.urgent&&<div style={{ position:'absolute', top:10, right:10, width:6, height:6, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 6px #f59e0b' }}/>}
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color:s.color, fontSize:18 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display:'flex', gap:8, marginBottom:18 }}>
          <Link to="/inventory" className="btn-secondary" style={{ fontSize:12, textDecoration:'none' }}>📦 Manage Inventory</Link>
          <Link to="/proof-of-performance" className="btn-secondary" style={{ fontSize:12, textDecoration:'none' }}>📋 Proof of Performance</Link>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)}
              style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                background:filter===f.key?(f.urgent?'rgba(245,158,11,0.12)':'var(--accent-soft)'):'rgba(255,255,255,0.04)',
                color:filter===f.key?(f.urgent?'#fcd34d':'var(--accent-light)'):'var(--text-muted)',
                outline:filter===f.key?`0.5px solid ${f.urgent?'rgba(245,158,11,0.3)':'var(--accent-border)'}` :'0.5px solid var(--border)',
              }}>
              {f.label}{f.count>0&&<span style={{ marginLeft:4, opacity:0.65 }}>({f.count})</span>}
            </button>
          ))}
        </div>

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text-muted)', padding:'20px 0' }}><Spinner size={14}/>Loading…</div>}

        {!loading && filtered.length===0 && (
          <div style={{ textAlign:'center', padding:'40px', borderRadius:10, background:'var(--bg-card)', border:'0.5px dashed var(--border)' }}>
            <p style={{ fontWeight:500, color:'white', marginBottom:4, fontSize:13 }}>No bookings here</p>
            <p style={{ fontSize:12, color:'var(--text-muted)' }}>When clients book your inventory, they'll appear here.</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(booking=>{
            const status  = (booking.status||'').toUpperCase();
            const meta    = STATUS_META[status]||STATUS_META.PENDING_PROVIDER_CONFIRMATION;
            const bid     = booking.bookingId;
            const isOpen  = expanded===bid;
            const isPending  = status==='PENDING_PROVIDER_CONFIRMATION';
            const needsProof = ['PAID','IN_PROGRESS'].includes(status);

            return (
              <div key={bid} style={{ borderRadius:10, background:isPending?'rgba(245,158,11,0.03)':'var(--bg-card)', border:isPending?'0.5px solid rgba(245,158,11,0.2)':'0.5px solid var(--border)', overflow:'hidden' }}>

                {/* Row */}
                <div onClick={()=>setExpanded(isOpen?null:bid)} style={{ padding:'13px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:meta.dot, flexShrink:0, ...(isPending?{boxShadow:`0 0 6px ${meta.dot}`}:{}) }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                      <p style={{ fontWeight:500, fontSize:13, color:'white' }}>{booking.brandName||'—'}</p>
                      <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:meta.bg, color:meta.color, whiteSpace:'nowrap' }}>{meta.label}</span>
                    </div>
                    <p style={{ fontSize:10, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {booking.target} · {(booking.inventoryOption||'').replaceAll('_',' ')} · {booking.market}
                      {booking.runs>1&&` · ×${booking.runs}`}
                      {booking.date&&` · ${fmtDate(booking.date)}`}
                    </p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, color:'#86efac' }}>{fmt(booking.mediaPayout)}</p>
                    <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{timeAgo(booking.createdAt)}</p>
                  </div>
                  <span style={{ color:'var(--text-muted)', fontSize:12, flexShrink:0, transform:isOpen?'rotate(180deg)':'none', display:'inline-block', transition:'0.2s' }}>⌄</span>
                </div>

                {/* Expanded */}
                {isOpen&&(
                  <div style={{ padding:'0 16px 16px', borderTop:'0.5px solid var(--border)' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'14px 0' }}>
                      {[['Campaign Value',fmt(booking.finalPrice)],['Your Payout',fmt(booking.mediaPayout)],['Client',booking.contactEmail||'—'],['Category',(booking.category||'—').replaceAll('_',' ')],['Date',fmtDate(booking.date)],['Ref',(booking.bookingId||'').slice(0,8).toUpperCase()]].map(([l,v])=>(
                        <div key={l} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.025)', border:'0.5px solid var(--border)' }}>
                          <p style={{ fontSize:9, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>{l}</p>
                          <p style={{ fontSize:11, fontWeight:500, color:'white', wordBreak:'break-all' }}>{v}</p>
                        </div>
                      ))}
                    </div>

                    {booking.campaignBrief&&(
                      <div style={{ padding:'10px 12px', borderRadius:8, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)', marginBottom:12 }}>
                        <p style={{ fontSize:9, fontWeight:600, color:'var(--accent-light)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Campaign Brief</p>
                        <p style={{ fontSize:11, color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>{booking.campaignBrief}</p>
                      </div>
                    )}

                    {/* Pending actions */}
                    {isPending&&(
                      <div style={{ padding:'14px', borderRadius:9, background:'rgba(245,158,11,0.05)', border:'0.5px solid rgba(245,158,11,0.18)' }}>
                        <p style={{ fontSize:11, fontWeight:600, color:'#fcd34d', marginBottom:3 }}>Respond to this booking</p>
                        <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:10, lineHeight:1.6 }}>
                          Your payout of <strong style={{color:'#86efac'}}>{fmt(booking.mediaPayout)}</strong> released after delivery approval.
                        </p>
                        <textarea value={moreInfoNotes[bid]||''} onChange={e=>setMIN(p=>({...p,[bid]:e.target.value}))}
                          placeholder="Optional: type your questions for 'Get More Info'…" rows={2}
                          style={{ ...inp, resize:'none', marginBottom:10, fontSize:11 }}/>
                        <div style={{ display:'flex', gap:7 }}>
                          <button onClick={()=>approve(bid)} disabled={!!acting[bid]}
                            style={{ flex:1, padding:'8px', borderRadius:8, fontWeight:600, fontSize:11, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            {acting[bid]==='approve'?<><Spinner size={11}/>…</>:'✓ Approve'}
                          </button>
                          <button onClick={()=>requestMoreInfo(booking)}
                            style={{ flex:1, padding:'8px', borderRadius:8, fontWeight:600, fontSize:11, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'0.5px solid var(--accent-border)', background:'var(--accent-soft)', color:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            💬 More Info
                          </button>
                          <button onClick={()=>reject(bid)} disabled={!!acting[bid]}
                            style={{ flex:1, padding:'8px', borderRadius:8, fontWeight:600, fontSize:11, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'0.5px solid rgba(239,68,68,0.22)', background:'rgba(239,68,68,0.07)', color:'#fca5a5', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            {acting[bid]==='reject'?<><Spinner size={11}/>…</>:'✕ Decline'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload proof */}
                    {needsProof&&(
                      <div style={{ padding:'13px', borderRadius:9, background:'rgba(168,85,247,0.06)', border:'0.5px solid rgba(168,85,247,0.16)' }}>
                        <p style={{ fontSize:11, fontWeight:600, color:'#d8b4fe', marginBottom:8 }}>Upload Delivery Proof</p>
                        <input type="url" placeholder="https://… proof link or screenshot URL" value={proofUrl[bid]||''}
                          onChange={e=>setProofUrl(p=>({...p,[bid]:e.target.value}))}
                          style={{ ...inp, marginBottom:6 }}/>
                        <textarea placeholder="Notes (optional)" rows={2} value={proofNotes[bid]||''}
                          onChange={e=>setProofNotes(p=>({...p,[bid]:e.target.value}))}
                          style={{ ...inp, resize:'vertical', marginBottom:10 }}/>
                        <button onClick={()=>submitProof(bid)} disabled={!!acting[bid]} className="btn-primary" style={{ fontSize:11, padding:'7px 16px' }}>
                          {acting[bid]==='proof'?<><Spinner size={11}/>Uploading…</>:'Submit Proof →'}
                        </button>
                      </div>
                    )}

                    {status==='PENDING_DELIVERY_REVIEW'&&(
                      <div style={{ padding:'10px 12px', borderRadius:8, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)' }}>
                        <p style={{ fontSize:11, color:'var(--accent-light)', fontWeight:500 }}>✓ Proof submitted — awaiting client approval</p>
                        <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Payout of {fmt(booking.mediaPayout)} released once approved.</p>
                      </div>
                    )}

                    {status==='COMPLETED'&&(
                      <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(34,197,94,0.06)', border:'0.5px solid rgba(34,197,94,0.16)' }}>
                        <p style={{ fontSize:11, color:'#86efac', fontWeight:500 }}>✅ Campaign completed</p>
                        <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>
                          {booking.payoutStatus==='RELEASED'?`Payout of ${fmt(booking.mediaPayout)} released`:`Payout of ${fmt(booking.mediaPayout)} pending release`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Layout>
    </>
  );
}