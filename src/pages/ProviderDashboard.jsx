import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingBlock, ErrorBlock, EmptyBlock, StatusBadge, Toast, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_COLORS = {
  PENDING_PROVIDER_CONFIRMATION: { bg:'rgba(245,158,11,0.1)',  text:'#fcd34d' },
  APPROVED:     { bg:'rgba(99,102,241,0.12)',  text:'#a5b4fc' },
  PAID:         { bg:'rgba(20,184,166,0.1)',   text:'#5eead4' },
  IN_PROGRESS:  { bg:'rgba(168,85,247,0.12)',  text:'#d8b4fe' },
  PENDING_REVIEW:{ bg:'rgba(99,102,241,0.12)', text:'#a5b4fc' },
  COMPLETED:    { bg:'rgba(34,197,94,0.1)',    text:'#86efac' },
  REJECTED:     { bg:'rgba(239,68,68,0.1)',    text:'#fca5a5' },
};

export default function ProviderDashboard() {
  const { user }                      = useAuth();
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [toast, setToast]             = useState(null);
  const [acting, setActing]           = useState({});
  const [proofUrl, setProofUrl]       = useState({});
  const [proofNotes, setProofNotes]   = useState({});
  const [expanded, setExpanded]       = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBookings = async () => {
    setLoading(true); setError('');
    try {
      // Fetch bookings for this provider's media (matched by contactEmail)
      const res = await api.get('/bookings');
      const all = Array.isArray(res.data) ? res.data : res.data?.bookings ?? [];
      // Filter to bookings for media owned by this provider
      const mine = all.filter(b => b.providerEmail === user?.email || b.mediaContactEmail === user?.email);
      setBookings(mine);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const submitProof = async (bookingId) => {
    if (!proofUrl[bookingId]) { showToast('error', 'Please enter a proof URL or upload a file'); return; }
    setActing(a => ({ ...a, [bookingId]: 'proof' }));
    try {
      await api.post('/bookings/proof', {
        bookingId,
        fileUrl:    proofUrl[bookingId],
        notes:      proofNotes[bookingId] || '',
        uploadedBy: 'provider',
      });
      showToast('success', 'Delivery proof submitted successfully');
      setProofUrl(p => { const n = { ...p }; delete n[bookingId]; return n; });
      setProofNotes(p => { const n = { ...p }; delete n[bookingId]; return n; });
      await fetchBookings();
    } catch(e) { showToast('error', e.message); }
    finally { setActing(a => { const n = { ...a }; delete n[bookingId]; return n; }); }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }
    catch { return d; }
  };

  const pending   = bookings.filter(b => b.status === 'PENDING_PROVIDER_CONFIRMATION').length;
  const active    = bookings.filter(b => ['PAID','IN_PROGRESS'].includes(b.status)).length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  const revenue   = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.mediaPayout || 0), 0);

  return (
    <Layout
      title="Provider Dashboard"
      subtitle="Manage your bookings and upload delivery proofs"
      actions={
        <button onClick={fetchBookings} className="btn-secondary" style={{ fontSize:12 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
          Refresh
        </button>
      }
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Pending Review', value: pending,   color:'rgba(245,158,11,0.1)',  text:'#fcd34d' },
          { label:'Active',         value: active,    color:'rgba(168,85,247,0.12)', text:'#d8b4fe' },
          { label:'Completed',      value: completed, color:'rgba(34,197,94,0.1)',   text:'#86efac' },
          { label:'Total Earnings', value: `₦${Number(revenue).toLocaleString()}`, color:'rgba(99,102,241,0.12)', text:'#a5b4fc' },
        ].map((s) => (
          <div key={s.label} style={{ background:s.color, border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-lg)', padding:'16px 18px' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>{s.label}</p>
            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:24, color:s.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bookings */}
      {loading && <LoadingBlock message="Loading your bookings…"/>}
      {error   && <ErrorBlock message={error} onRetry={fetchBookings}/>}

      {!loading && !error && bookings.length === 0 && (
        <div className="page-card" style={{ padding:48, textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <svg width="22" height="22" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 13h4"/></svg>
          </div>
          <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>No bookings yet</p>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>When clients book your media inventory, they'll appear here.</p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status  = (booking.status || 'PENDING').toUpperCase();
            const col     = STATUS_COLORS[status] || STATUS_COLORS.PENDING_PROVIDER_CONFIRMATION;
            const bid     = booking.bookingId;
            const isOpen  = expanded === bid;
            const needsProof = status === 'IN_PROGRESS';
            const hasPendingReview = status === 'PENDING_REVIEW';

            return (
              <div key={bid} className="page-card">
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : bid)}
                  style={{ padding:'18px 22px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}
                >
                  <div>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, color:'white' }}>{booking.brandName || '—'}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>
                      {booking.inventoryOption?.replaceAll('_',' ')} · {booking.market} · {fmtDate(booking.date)}
                      {booking.runs > 1 && <span style={{ marginLeft:8, padding:'2px 8px', borderRadius:20, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:10, fontWeight:700 }}>×{booking.runs} runs</span>}
                    </p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                    <span style={{ padding:'5px 12px', borderRadius:20, background:col.bg, color:col.text, fontWeight:700, fontSize:10 }}>
                      {status.replaceAll('_',' ')}
                    </span>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, color:'#86efac' }}>₦{Number(booking.mediaPayout || 0).toLocaleString()}</p>
                    <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding:'0 22px 22px', borderTop:'1px solid var(--border)' }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 mb-5">
                      {[
                        { label:'Campaign Value', value:`₦${Number(booking.finalPrice || 0).toLocaleString()}` },
                        { label:'Your Payout',    value:`₦${Number(booking.mediaPayout || 0).toLocaleString()}` },
                        { label:'Payout Status',  value: booking.payoutStatus || 'PENDING' },
                        { label:'Category',       value: booking.category?.replaceAll('_',' ') || '—' },
                        { label:'Market',         value: booking.market || '—' },
                        { label:'Booking ID',     value: bid?.slice(0,8)+'...' },
                      ].map((row) => (
                        <div key={row.label} style={{ padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                          <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{row.label}</p>
                          <p style={{ fontSize:13, fontWeight:600, color:'white' }}>{row.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery proofs list */}
                    {booking.deliveryProofs?.length > 0 && (
                      <div style={{ marginBottom:16 }}>
                        <p style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:8 }}>Uploaded Proofs</p>
                        <div className="space-y-2">
                          {booking.deliveryProofs.map((proof) => (
                            <a key={proof.proofId} href={proof.fileUrl} target="_blank" rel="noreferrer"
                              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)', color:'#86efac', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                              View Proof
                              {proof.notes && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:4 }}>— {proof.notes}</span>}
                              <span style={{ marginLeft:'auto', fontSize:10, padding:'2px 8px', borderRadius:20, background: proof.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : proof.status === 'REJECTED' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.08)', color: proof.status === 'APPROVED' ? '#86efac' : proof.status === 'REJECTED' ? '#fca5a5' : 'var(--text-muted)' }}>
                                {proof.status || 'PENDING_REVIEW'}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload proof */}
                    {needsProof && (
                      <div style={{ padding:'16px', borderRadius:12, background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.18)' }}>
                        <p style={{ fontWeight:700, fontSize:13, color:'#d8b4fe', marginBottom:4 }}>Upload Delivery Proof</p>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>
                          This campaign is live. Upload proof of delivery (screenshot, report, recording link, etc.)
                        </p>
                        <input
                          type="url"
                          placeholder="https://... (link to proof file, screenshot, or report)"
                          value={proofUrl[bid] || ''}
                          onChange={(e) => setProofUrl(p => ({ ...p, [bid]: e.target.value }))}
                          style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', marginBottom:8 }}
                        />
                        <textarea
                          placeholder="Notes (optional) — describe what was delivered"
                          rows={2}
                          value={proofNotes[bid] || ''}
                          onChange={(e) => setProofNotes(p => ({ ...p, [bid]: e.target.value }))}
                          style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', marginBottom:12, resize:'vertical' }}
                        />
                        <button type="button" onClick={() => submitProof(bid)} disabled={!!acting[bid]} className="btn-primary" style={{ fontSize:12, padding:'9px 18px' }}>
                          {acting[bid] === 'proof' ? <><Spinner size={12}/> Uploading…</> : 'Submit Proof'}
                        </button>
                      </div>
                    )}

                    {hasPendingReview && (
                      <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.18)' }}>
                        <p style={{ fontSize:13, color:'#a5b4fc', fontWeight:600 }}>✓ Proof submitted — awaiting admin review</p>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>BrandCasta will review your delivery proof and approve your payout shortly.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}