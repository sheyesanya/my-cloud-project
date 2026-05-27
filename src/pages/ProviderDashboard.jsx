import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

const STATUS_COLORS = {
  PENDING_PROVIDER_CONFIRMATION: { bg:'rgba(245,158,11,0.1)',  text:'#fcd34d',  label:'Awaiting Your Response' },
  PAYMENT_PENDING:               { bg:'rgba(99,102,241,0.1)',  text:'#a5b4fc',  label:'Awaiting Payment'       },
  PAID:                          { bg:'rgba(20,184,166,0.1)',  text:'#5eead4',  label:'Paid — Go Live'         },
  IN_PROGRESS:                   { bg:'rgba(168,85,247,0.12)', text:'#d8b4fe',  label:'In Progress'            },
  PENDING_DELIVERY_REVIEW:       { bg:'rgba(99,102,241,0.1)',  text:'#a5b4fc',  label:'Proof Submitted'        },
  COMPLETED:                     { bg:'rgba(34,197,94,0.1)',   text:'#86efac',  label:'Completed'              },
  REJECTED:                      { bg:'rgba(239,68,68,0.1)',   text:'#fca5a5',  label:'Declined'               },
};

const fmt = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); } catch { return d||'—'; }};

export default function ProviderDashboard() {
  const { user }                    = useAuth();
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [toast, setToast]           = useState(null);
  const [acting, setActing]         = useState({});
  const [expanded, setExpanded]     = useState(null);
  const [moreInfoNotes, setMIN]     = useState({});
  const [proofUrl, setProofUrl]     = useState({});
  const [proofNotes, setProofNotes] = useState({});
  const [filter, setFilter]         = useState('ALL');

  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 3500); };

  const fetchBookings = async () => {
    setLoading(true); setError('');
    try {
      const headers = await authHeader();
      const res = await axios.get(`${API}/bookings`, { headers });
      const all  = Array.isArray(res.data) ? res.data : res.data?.bookings ?? [];
      const mine = all.filter(b => b.providerEmail === user?.email || b.mediaContactEmail === user?.email);
      setBookings(mine);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const approve = async (bookingId) => {
    setActing(a => ({ ...a, [bookingId]: 'approve' }));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/${bookingId}/approve`, {}, { headers });
      showToast('success', '✅ Booking approved — client has been sent a payment link');
      await fetchBookings();
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setActing(a => { const n={...a}; delete n[bookingId]; return n; }); }
  };

  const reject = async (bookingId) => {
    if (!window.confirm('Decline this booking? The client will be notified.')) return;
    setActing(a => ({ ...a, [bookingId]: 'reject' }));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/${bookingId}/reject`, {}, { headers });
      showToast('success', 'Booking declined — client notified');
      await fetchBookings();
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setActing(a => { const n={...a}; delete n[bookingId]; return n; }); }
  };

  const requestMoreInfo = (booking) => {
    const notes   = moreInfoNotes[booking.bookingId] || '';
    const subject = `Re: Booking Request ${booking.bookingId?.slice(0,8).toUpperCase()} — More Information Needed`;
    const body    = notes
      ? `Hello,\n\nThank you for your booking request. Before we can confirm, we need the following information:\n\n${notes}\n\nPlease reply at your earliest convenience.\n\nKind regards`
      : `Hello,\n\nThank you for your booking request for ${booking.target||'our media inventory'}. Before we confirm, we would like to request a few more details about your campaign:\n\n1. \n2. \n3. \n\nPlease reply to this email at your earliest convenience.\n\nKind regards`;
    window.open(`mailto:${booking.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const submitProof = async (bookingId) => {
    if (!proofUrl[bookingId]) { showToast('error', 'Please enter a proof URL'); return; }
    setActing(a => ({ ...a, [bookingId]: 'proof' }));
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/proof`, { bookingId, fileUrl: proofUrl[bookingId], notes: proofNotes[bookingId]||'', uploadedBy:'provider' }, { headers });
      showToast('success', 'Delivery proof submitted');
      setProofUrl(p => { const n={...p}; delete n[bookingId]; return n; });
      setProofNotes(p => { const n={...p}; delete n[bookingId]; return n; });
      await fetchBookings();
    } catch(e) { showToast('error', e.message); }
    finally { setActing(a => { const n={...a}; delete n[bookingId]; return n; }); }
  };

  const pending   = bookings.filter(b => b.status === 'PENDING_PROVIDER_CONFIRMATION').length;
  const active    = bookings.filter(b => ['PAID','IN_PROGRESS'].includes(b.status)).length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  const revenue   = bookings.filter(b => b.status === 'COMPLETED').reduce((s,b) => s + (b.mediaPayout||0), 0);

  const FILTERS = [
    { key:'ALL',                          label:'All'              },
    { key:'PENDING_PROVIDER_CONFIRMATION',label:'Action Required'  },
    { key:'PAID',                         label:'Active'           },
    { key:'PENDING_DELIVERY_REVIEW',      label:'Proof Submitted'  },
    { key:'COMPLETED',                    label:'Completed'        },
  ];

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <Layout title="Provider Dashboard" subtitle="Manage bookings, approve requests and upload delivery proofs"
      actions={<button onClick={fetchBookings} className="btn-secondary" style={{ fontSize:12 }}>↻ Refresh</button>}
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Action Required', value:pending,   color:'rgba(245,158,11,0.1)',  text:'#fcd34d' },
          { label:'Active',          value:active,    color:'rgba(168,85,247,0.1)',  text:'#d8b4fe' },
          { label:'Completed',       value:completed, color:'rgba(34,197,94,0.1)',   text:'#86efac' },
          { label:'Total Earnings',  value:fmt(revenue), color:'rgba(99,102,241,0.1)', text:'#a5b4fc' },
        ].map(s => (
          <div key={s.label} style={{ background:s.color, border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px 18px' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>{s.label}</p>
            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:24, color:s.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.15s',
              background: filter===f.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              color:       filter===f.key ? '#a5b4fc' : 'var(--text-muted)',
              outline:     filter===f.key ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
            }}>
            {f.label}
            {f.key === 'PENDING_PROVIDER_CONFIRMATION' && pending > 0 && (
              <span style={{ marginLeft:6, padding:'1px 6px', borderRadius:20, background:'#fcd34d', color:'#0a0a0f', fontSize:10, fontWeight:800 }}>{pending}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div style={{ color:'var(--text-muted)', padding:40, display:'flex', gap:10 }}><Spinner size={16}/>Loading bookings…</div>}
      {error   && <div style={{ color:'#fca5a5', padding:16, borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)' }}>{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ padding:48, textAlign:'center', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
          <p style={{ fontWeight:600, color:'white', marginBottom:6 }}>No bookings here</p>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>When clients book your media inventory, they'll appear here.</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map(booking => {
          const status  = (booking.status||'').toUpperCase();
          const col     = STATUS_COLORS[status] || STATUS_COLORS.PENDING_PROVIDER_CONFIRMATION;
          const bid     = booking.bookingId;
          const isOpen  = expanded === bid;
          const isPending = status === 'PENDING_PROVIDER_CONFIRMATION';
          const needsProof = ['PAID','IN_PROGRESS'].includes(status);

          return (
            <div key={bid} style={{ borderRadius:14, background:'var(--bg-surface)', border: isPending ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)', overflow:'hidden' }}>

              {/* Header */}
              <div onClick={() => setExpanded(isOpen ? null : bid)}
                style={{ padding:'18px 22px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
                  background: isPending ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    {isPending && <span style={{ width:8, height:8, borderRadius:'50%', background:'#fcd34d', flexShrink:0 }}/>}
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'white' }}>{booking.brandName||'—'}</p>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {booking.target} · {booking.inventoryOption?.replaceAll('_',' ')} · {booking.market} · {fmtDate(booking.date)}
                    {booking.runs > 1 && <span style={{ marginLeft:6, padding:'2px 7px', borderRadius:20, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:10, fontWeight:700 }}>×{booking.runs}</span>}
                  </p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  <span style={{ padding:'4px 10px', borderRadius:20, background:col.bg, color:col.text, fontWeight:700, fontSize:10, whiteSpace:'nowrap' }}>
                    {col.label}
                  </span>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'#86efac' }}>{fmt(booking.mediaPayout)}</p>
                  <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition:'0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>

              {isOpen && (
                <div style={{ padding:'0 22px 22px', borderTop:'1px solid var(--border)' }}>

                  {/* Details grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, margin:'16px 0' }}>
                    {[
                      ['Campaign Value', fmt(booking.finalPrice)],
                      ['Your Payout',    fmt(booking.mediaPayout)],
                      ['Category',       (booking.category||'—').replaceAll('_',' ')],
                      ['Market',         booking.market||'—'],
                      ['Campaign Date',  fmtDate(booking.date)],
                      ['Booking Ref',    booking.bookingId?.slice(0,8).toUpperCase()+'...'],
                    ].map(([l,v]) => (
                      <div key={l} style={{ padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                        <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{l}</p>
                        <p style={{ fontSize:13, fontWeight:600, color:'white' }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Campaign brief */}
                  {booking.campaignBrief && (
                    <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', marginBottom:14 }}>
                      <p style={{ fontSize:10, fontWeight:700, color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Campaign Brief</p>
                      <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.7 }}>{booking.campaignBrief}</p>
                    </div>
                  )}

                  {/* ── APPROVE / GET MORE INFO / REJECT ── */}
                  {isPending && (
                    <div style={{ padding:'18px', borderRadius:12, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', marginBottom:14 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:'#fcd34d', marginBottom:4 }}>Action Required</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16, lineHeight:1.6 }}>
                        Review this booking request and approve, request more information, or decline.
                        Client: <strong style={{ color:'white' }}>{booking.contactEmail}</strong>
                      </p>

                      {/* Notes for more info (optional) */}
                      <textarea
                        value={moreInfoNotes[bid]||''}
                        onChange={e => setMIN(p => ({ ...p, [bid]: e.target.value }))}
                        placeholder="Optional: type your questions here before clicking 'Get More Info' — they'll be pre-filled in the email"
                        rows={2}
                        style={{ width:'100%', padding:'10px 12px', borderRadius:9, fontSize:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontFamily:'Manrope,sans-serif', resize:'none', marginBottom:12 }}
                      />

                      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                        {/* Approve */}
                        <button onClick={() => approve(bid)} disabled={!!acting[bid]}
                          style={{ flex:1, minWidth:120, padding:'11px 16px', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                            background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white' }}>
                          {acting[bid]==='approve' ? <><Spinner size={13}/>Approving…</> : '✓ Approve Booking'}
                        </button>

                        {/* Get More Info */}
                        <button onClick={() => requestMoreInfo(booking)}
                          style={{ flex:1, minWidth:120, padding:'11px 16px', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'1px solid rgba(99,102,241,0.35)', background:'rgba(99,102,241,0.1)', color:'#a5b4fc', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                          💬 Get More Info
                        </button>

                        {/* Reject */}
                        <button onClick={() => reject(bid)} disabled={!!acting[bid]}
                          style={{ flex:1, minWidth:120, padding:'11px 16px', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'1px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                          {acting[bid]==='reject' ? <><Spinner size={13}/>Declining…</> : '✕ Decline Booking'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── UPLOAD PROOF ── */}
                  {needsProof && (
                    <div style={{ padding:'16px', borderRadius:12, background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.18)' }}>
                      <p style={{ fontWeight:700, fontSize:13, color:'#d8b4fe', marginBottom:4 }}>Upload Delivery Proof</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>Campaign is live. Upload proof of delivery (screenshot, report, recording link, etc.)</p>
                      <input type="url" placeholder="https://... (link to proof file or screenshot)" value={proofUrl[bid]||''}
                        onChange={e => setProofUrl(p => ({ ...p, [bid]: e.target.value }))}
                        style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', marginBottom:8 }}/>
                      <textarea placeholder="Notes (optional)" rows={2} value={proofNotes[bid]||''}
                        onChange={e => setProofNotes(p => ({ ...p, [bid]: e.target.value }))}
                        style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', marginBottom:12, resize:'vertical', fontFamily:'Manrope,sans-serif' }}/>
                      <button onClick={() => submitProof(bid)} disabled={!!acting[bid]} className="btn-primary" style={{ fontSize:12, padding:'9px 18px' }}>
                        {acting[bid]==='proof' ? <><Spinner size={12}/>Uploading…</> : 'Submit Proof'}
                      </button>
                    </div>
                  )}

                  {status === 'PENDING_DELIVERY_REVIEW' && (
                    <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.18)' }}>
                      <p style={{ fontSize:13, color:'#a5b4fc', fontWeight:600 }}>✓ Proof submitted — awaiting client approval</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>Once the client approves your proof, your payout will be released.</p>
                    </div>
                  )}

                  {status === 'COMPLETED' && (
                    <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
                      <p style={{ fontSize:13, color:'#86efac', fontWeight:600 }}>✅ Campaign completed — payout of {fmt(booking.mediaPayout)} pending release</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}