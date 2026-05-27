import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

const fmt     = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); } catch { return d||'—'; }};
const timeAgo = (d) => { if(!d) return '—'; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60) return 'just now'; if(s<3600) return `${Math.floor(s/60)}m ago`; if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

const STATUS_META = {
  PENDING_PROVIDER_CONFIRMATION: { label:'Needs Response', color:'#fcd34d', bg:'rgba(245,158,11,0.12)', dot:'#f59e0b' },
  PAYMENT_PENDING:               { label:'Awaiting Payment', color:'#a5b4fc', bg:'rgba(99,102,241,0.1)',  dot:'#6366f1' },
  PAID:                          { label:'Live — Upload Proof', color:'#5eead4', bg:'rgba(20,184,166,0.1)', dot:'#14b8a6' },
  IN_PROGRESS:                   { label:'In Progress',    color:'#d8b4fe', bg:'rgba(168,85,247,0.1)', dot:'#a855f7' },
  PENDING_DELIVERY_REVIEW:       { label:'Proof Submitted',color:'#a5b4fc', bg:'rgba(99,102,241,0.1)', dot:'#6366f1' },
  COMPLETED:                     { label:'Completed',      color:'#86efac', bg:'rgba(34,197,94,0.1)',  dot:'#22c55e' },
  REJECTED:                      { label:'Declined',       color:'#fca5a5', bg:'rgba(239,68,68,0.1)',  dot:'#ef4444' },
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
      const res = await axios.get(`${API}/bookings`, { headers });
      const all  = Array.isArray(res.data) ? res.data : res.data?.bookings ?? [];
      const mine = all.filter(b => b.providerEmail===user?.email || b.mediaContactEmail===user?.email);
      setBookings(mine.sort((a,b) => {
        // Pending first, then by date desc
        const aPending = a.status==='PENDING_PROVIDER_CONFIRMATION' ? 0 : 1;
        const bPending = b.status==='PENDING_PROVIDER_CONFIRMATION' ? 0 : 1;
        return aPending - bPending || new Date(b.createdAt) - new Date(a.createdAt);
      }));
    } catch(e) { showToast('error', e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const approve = async (bookingId) => {
    setActing(a => ({ ...a, [bookingId]:'approve' }));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/${bookingId}/approve`, {}, { headers });
      showToast('success', '✅ Approved — client notified to pay');
      await fetchBookings();
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setActing(a => { const n={...a}; delete n[bookingId]; return n; }); }
  };

  const reject = async (bookingId) => {
    if (!window.confirm('Decline this booking?')) return;
    setActing(a => ({ ...a, [bookingId]:'reject' }));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/${bookingId}/reject`, {}, { headers });
      showToast('success', 'Booking declined');
      await fetchBookings();
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setActing(a => { const n={...a}; delete n[bookingId]; return n; }); }
  };

  const requestMoreInfo = (booking) => {
    const notes   = moreInfoNotes[booking.bookingId]||'';
    const subject = `Re: Booking ${booking.bookingId?.slice(0,8).toUpperCase()} — More Information Needed`;
    const body    = notes
      ? `Hello,\n\nRegarding your booking for ${booking.target||'our inventory'}:\n\n${notes}\n\nPlease reply at your earliest convenience.\n\nKind regards`
      : `Hello,\n\nThank you for your booking request. Before we confirm, we'd like a few more details:\n\n1. \n2. \n3. \n\nPlease reply at your earliest convenience.\n\nKind regards`;
    window.open(`mailto:${booking.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const submitProof = async (bookingId) => {
    if (!proofUrl[bookingId]) { showToast('error','Enter a proof URL first'); return; }
    setActing(a => ({ ...a, [bookingId]:'proof' }));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/proof`, { bookingId, fileUrl:proofUrl[bookingId], notes:proofNotes[bookingId]||'', uploadedBy:'provider' }, { headers });
      showToast('success','Proof submitted — awaiting client approval');
      setProofUrl(p=>{ const n={...p}; delete n[bookingId]; return n; });
      await fetchBookings();
    } catch(e) { showToast('error', e.message); }
    finally { setActing(a=>{ const n={...a}; delete n[bookingId]; return n; }); }
  };

  // Stats
  const pending   = bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length;
  const active    = bookings.filter(b=>['PAID','IN_PROGRESS'].includes(b.status)).length;
  const completed = bookings.filter(b=>b.status==='COMPLETED').length;
  const revenue   = bookings.filter(b=>b.status==='COMPLETED').reduce((s,b)=>s+(b.mediaPayout||0),0);
  const pending_payout = bookings.filter(b=>['PAID','IN_PROGRESS','PENDING_DELIVERY_REVIEW'].includes(b.status)).reduce((s,b)=>s+(b.mediaPayout||0),0);
  const totalBookings  = bookings.length;

  const FILTERS = [
    { key:'ALL',                           label:'All',             count: totalBookings },
    { key:'PENDING_PROVIDER_CONFIRMATION', label:'Needs Response',  count: pending,   urgent: true },
    { key:'PAID',                          label:'Live',            count: active    },
    { key:'PENDING_DELIVERY_REVIEW',       label:'Under Review',    count: bookings.filter(b=>b.status==='PENDING_DELIVERY_REVIEW').length },
    { key:'COMPLETED',                     label:'Completed',       count: completed },
  ];

  const filtered = filter==='ALL' ? bookings : bookings.filter(b=>b.status===filter);
  const initials = user?.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : user?.email?.[0]?.toUpperCase()||'P';

  return (
    <div style={{ minHeight:'100vh', background:'#07070e', fontFamily:'Manrope,sans-serif', color:'white' }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

      {/* ── TOP NAV ── */}
      <nav style={{ background:'rgba(10,10,18,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src="https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png" alt="BrandCasta" style={{ width:28, height:28, objectFit:'contain' }}/>
          <span style={{ fontWeight:800, fontSize:15, letterSpacing:'-0.3px' }}>BrandCasta</span>
          <span style={{ padding:'2px 8px', borderRadius:6, background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.2)', color:'#5eead4', fontSize:10, fontWeight:700, marginLeft:4 }}>PROVIDER</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Link to="/inventory" style={{ padding:'7px 14px', borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
            Manage Inventory
          </Link>
          <Link to="/proof-of-performance" style={{ padding:'7px 14px', borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
            Proof of Performance
          </Link>
          <button onClick={fetchBookings} style={{ padding:'7px 12px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
            ↻
          </button>
          <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#14b8a6,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>
            {initials}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:24, letterSpacing:'-0.5px', marginBottom:4 }}>
            Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, {user?.name?.split(' ')[0] || 'Provider'}
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>
            {pending > 0 ? `You have ${pending} booking${pending>1?'s':''} waiting for your response.` : 'Your media dashboard — all bookings in one place.'}
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:28 }}>
          {[
            { label:'Needs Response', value:pending,   color:'#fcd34d', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.18)', urgent:pending>0 },
            { label:'Live Campaigns', value:active,    color:'#5eead4', bg:'rgba(20,184,166,0.07)', border:'rgba(20,184,166,0.15)' },
            { label:'Completed',      value:completed, color:'#86efac', bg:'rgba(34,197,94,0.07)',  border:'rgba(34,197,94,0.15)'  },
            { label:'Total Bookings', value:totalBookings, color:'#a5b4fc', bg:'rgba(99,102,241,0.07)', border:'rgba(99,102,241,0.15)' },
            { label:'Pending Payout', value:fmt(pending_payout), color:'#d8b4fe', bg:'rgba(168,85,247,0.07)', border:'rgba(168,85,247,0.15)', span:true },
            { label:'Total Earned',   value:fmt(revenue), color:'#86efac', bg:'rgba(34,197,94,0.07)', border:'rgba(34,197,94,0.15)', span:true },
          ].map((s,i) => (
            <div key={s.label} style={{ gridColumn: s.span ? 'span 1' : 'span 1', padding:'14px 16px', borderRadius:12, background:s.bg, border:`1px solid ${s.border}`, position:'relative', overflow:'hidden' }}>
              {s.urgent && <div style={{ position:'absolute', top:8, right:8, width:8, height:8, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 8px #f59e0b' }}/>}
              <p style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{s.label}</p>
              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:22, color:s.color, letterSpacing:'-0.5px' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }}>

          {/* LEFT — Bookings */}
          <div>
            {/* Filter tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={()=>setFilter(f.key)}
                  style={{ padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.15s', fontFamily:'Manrope,sans-serif',
                    background: filter===f.key ? (f.urgent?'rgba(245,158,11,0.2)':'rgba(99,102,241,0.2)') : 'rgba(255,255,255,0.04)',
                    color:       filter===f.key ? (f.urgent?'#fcd34d':'#a5b4fc') : 'rgba(255,255,255,0.45)',
                    outline:     filter===f.key ? `1px solid ${f.urgent?'rgba(245,158,11,0.4)':'rgba(99,102,241,0.35)'}` : '1px solid rgba(255,255,255,0.07)',
                  }}>
                  {f.label}
                  {f.count > 0 && <span style={{ marginLeft:5, fontSize:10, opacity:0.8 }}>({f.count})</span>}
                </button>
              ))}
            </div>

            {loading && <div style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}><Spinner size={16}/>Loading bookings…</div>}

            {!loading && filtered.length===0 && (
              <div style={{ padding:48, textAlign:'center', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)' }}>
                <p style={{ fontWeight:600, color:'white', marginBottom:6 }}>No bookings here</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>When clients book your inventory, they'll appear here.</p>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filtered.map(booking => {
                const status  = (booking.status||'').toUpperCase();
                const meta    = STATUS_META[status] || STATUS_META.PENDING_PROVIDER_CONFIRMATION;
                const bid     = booking.bookingId;
                const isOpen  = expanded===bid;
                const isPending = status==='PENDING_PROVIDER_CONFIRMATION';
                const needsProof = ['PAID','IN_PROGRESS'].includes(status);

                return (
                  <div key={bid} style={{ borderRadius:13, background: isPending ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.025)', border: isPending ? '1px solid rgba(245,158,11,0.22)' : '1px solid rgba(255,255,255,0.07)', overflow:'hidden', transition:'border-color 0.15s' }}>

                    {/* Row */}
                    <div onClick={()=>setExpanded(isOpen?null:bid)} style={{ padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}>
                      {/* Status dot */}
                      <div style={{ width:8, height:8, borderRadius:'50%', background:meta.dot, flexShrink:0, boxShadow: isPending ? `0 0 8px ${meta.dot}` : 'none' }}/>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                          <p style={{ fontWeight:700, fontSize:14, color:'white' }}>{booking.brandName||'—'}</p>
                          <span style={{ padding:'2px 8px', borderRadius:20, fontSize:9, fontWeight:700, background:meta.bg, color:meta.color }}>{meta.label}</span>
                        </div>
                        <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {booking.target} · {(booking.inventoryOption||'').replaceAll('_',' ')} · {booking.market}
                          {booking.runs>1 && ` · ×${booking.runs} runs`}
                          {booking.date && ` · ${fmtDate(booking.date)}`}
                        </p>
                      </div>

                      {/* Payout + time */}
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:15, color:'#86efac' }}>{fmt(booking.mediaPayout)}</p>
                        <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{timeAgo(booking.createdAt)}</p>
                      </div>

                      <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                        style={{ transform:isOpen?'rotate(180deg)':'none', transition:'0.2s', flexShrink:0 }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>

                    {/* Expanded */}
                    {isOpen && (
                      <div style={{ padding:'0 20px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>

                        {/* Details */}
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'16px 0' }}>
                          {[
                            ['Campaign Value', fmt(booking.finalPrice)],
                            ['Your Payout',    fmt(booking.mediaPayout)],
                            ['Client',         booking.contactEmail||'—'],
                            ['Category',       (booking.category||'—').replaceAll('_',' ')],
                            ['Campaign Date',  fmtDate(booking.date)],
                            ['Booking Ref',    (booking.bookingId||'').slice(0,8).toUpperCase()],
                          ].map(([l,v]) => (
                            <div key={l} style={{ padding:'9px 12px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                              <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{l}</p>
                              <p style={{ fontSize:12, fontWeight:600, color:'white', wordBreak:'break-all' }}>{v}</p>
                            </div>
                          ))}
                        </div>

                        {/* Campaign brief */}
                        {booking.campaignBrief && (
                          <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.14)', marginBottom:14 }}>
                            <p style={{ fontSize:9, fontWeight:700, color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Campaign Brief</p>
                            <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>{booking.campaignBrief}</p>
                          </div>
                        )}

                        {/* ── PENDING ACTIONS ── */}
                        {isPending && (
                          <div style={{ padding:'16px', borderRadius:12, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)' }}>
                            <p style={{ fontSize:11, fontWeight:700, color:'#fcd34d', marginBottom:4 }}>Respond to this booking request</p>
                            <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:12 }}>Once you approve, the client will receive a payment link. Your payout of <strong style={{color:'#86efac'}}>{fmt(booking.mediaPayout)}</strong> is released after delivery approval.</p>

                            <textarea value={moreInfoNotes[bid]||''} onChange={e=>setMIN(p=>({...p,[bid]:e.target.value}))}
                              placeholder="Optional: type your questions here before clicking 'Get More Info'"
                              rows={2}
                              style={{ width:'100%', padding:'9px 12px', borderRadius:8, fontSize:11, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'white', fontFamily:'Manrope,sans-serif', resize:'none', marginBottom:10 }}/>

                            <div style={{ display:'flex', gap:8 }}>
                              <button onClick={()=>approve(bid)} disabled={!!acting[bid]}
                                style={{ flex:1, padding:'10px', borderRadius:9, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white' }}>
                                {acting[bid]==='approve'?<><Spinner size={12}/>Approving…</>:'✓ Approve'}
                              </button>
                              <button onClick={()=>requestMoreInfo(booking)}
                                style={{ flex:1, padding:'10px', borderRadius:9, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'1px solid rgba(99,102,241,0.3)', background:'rgba(99,102,241,0.1)', color:'#a5b4fc', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                💬 More Info
                              </button>
                              <button onClick={()=>reject(bid)} disabled={!!acting[bid]}
                                style={{ flex:1, padding:'10px', borderRadius:9, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'1px solid rgba(239,68,68,0.22)', background:'rgba(239,68,68,0.07)', color:'#fca5a5', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                {acting[bid]==='reject'?<><Spinner size={12}/>…</>:'✕ Decline'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ── UPLOAD PROOF ── */}
                        {needsProof && (
                          <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.16)' }}>
                            <p style={{ fontSize:11, fontWeight:700, color:'#d8b4fe', marginBottom:10 }}>Upload Delivery Proof</p>
                            <input type="url" placeholder="https://... proof link, screenshot or report URL" value={proofUrl[bid]||''}
                              onChange={e=>setProofUrl(p=>({...p,[bid]:e.target.value}))}
                              style={{ width:'100%', padding:'9px 12px', borderRadius:8, fontSize:11, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'white', marginBottom:8 }}/>
                            <textarea placeholder="Notes (optional)" rows={2} value={proofNotes[bid]||''}
                              onChange={e=>setProofNotes(p=>({...p,[bid]:e.target.value}))}
                              style={{ width:'100%', padding:'9px 12px', borderRadius:8, fontSize:11, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'white', marginBottom:10, resize:'vertical', fontFamily:'Manrope,sans-serif' }}/>
                            <button onClick={()=>submitProof(bid)} disabled={!!acting[bid]}
                              style={{ padding:'9px 18px', borderRadius:8, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', background:'linear-gradient(135deg,#a855f7,#6366f1)', color:'white', display:'flex', alignItems:'center', gap:6 }}>
                              {acting[bid]==='proof'?<><Spinner size={12}/>Uploading…</>:'Submit Proof →'}
                            </button>
                          </div>
                        )}

                        {status==='PENDING_DELIVERY_REVIEW' && (
                          <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.16)' }}>
                            <p style={{ fontSize:12, color:'#a5b4fc', fontWeight:600 }}>✓ Proof submitted — awaiting client approval</p>
                            <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:3 }}>Your payout of {fmt(booking.mediaPayout)} will be released once approved.</p>
                          </div>
                        )}

                        {status==='COMPLETED' && (
                          <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.16)' }}>
                            <p style={{ fontSize:12, color:'#86efac', fontWeight:600 }}>✅ Campaign completed</p>
                            <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:3 }}>Payout of {fmt(booking.mediaPayout)} pending release by BrandCasta.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Quick links */}
            <div style={{ padding:'18px', borderRadius:13, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Quick Actions</p>
              {[
                { to:'/inventory',          icon:'📦', label:'Manage Inventory',       sub:'Add or update your rate card' },
                { to:'/proof-of-performance',icon:'📋', label:'Proof of Performance',  sub:'Upload delivery evidence'     },
              ].map(item => (
                <Link key={item.to} to={item.to} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, marginBottom:6, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', textDecoration:'none', transition:'all 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:'white' }}>{item.label}</p>
                    <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Payout summary */}
            <div style={{ padding:'18px', borderRadius:13, background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.14)' }}>
              <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Earnings Summary</p>
              {[
                ['Total Earned',      fmt(revenue),          '#86efac'],
                ['Pending Payout',    fmt(pending_payout),   '#fcd34d'],
                ['Active Campaigns',  active,                '#5eead4'],
                ['Completed',         completed,             '#86efac'],
              ].map(([l,v,c]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{l}</p>
                  <p style={{ fontSize:12, fontWeight:700, color:c }}>{v}</p>
                </div>
              ))}
            </div>

            {/* How payouts work */}
            <div style={{ padding:'16px', borderRadius:13, background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.12)' }}>
              <p style={{ fontSize:10, fontWeight:700, color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>How Payouts Work</p>
              {[
                ['1','Client pays invoice'],
                ['2','You deliver the campaign'],
                ['3','Upload proof of delivery'],
                ['4','Client approves proof'],
                ['5','Payout released within 48hrs'],
              ].map(([n,t]) => (
                <div key={n} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                  <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(99,102,241,0.2)', color:'#a5b4fc', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{n}</span>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', lineHeight:1.5 }}>{t}</p>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:6 }}>Need help with a booking?</p>
              <a href="mailto:notifications@brandcasta.co" style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', textDecoration:'none' }}>
                notifications@brandcasta.co
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}