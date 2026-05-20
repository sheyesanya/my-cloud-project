import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Spinner, Toast, LoadingBlock, ErrorBlock } from '../components/UI';
import { getCampaignDetails, uploadDeliveryProof, approveDelivery, markProviderPaid } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  PENDING:        { bg:'#fff7e8', text:'#f59e0b' },
  APPROVED:       { bg:'#eef8eb', text:'#68c20a' },
  PAID:           { bg:'#ecfdf3', text:'#10b981' },
  IN_PROGRESS:    { bg:'#f3f0ff', text:'#7c3aed' },
  COMPLETED:      { bg:'#e7fff7', text:'#059669' },
  REJECTED:       { bg:'#fff0ed', text:'#ff4d1f' },
  PENDING_REVIEW: { bg:'#eef2ff', text:'#4641f5' },
};

export default function CampaignDetails() {
  // ── FIX: destructure `role` from user object, not directly from useAuth
  const { user } = useAuth();
  const role = user?.role ?? 'USER';

  const { campaignId } = useParams();

  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [campaign, setCampaign]     = useState(null);
  const [bookings, setBookings]     = useState([]);
  const [proofUrl, setProofUrl]     = useState({});
  const [proofNotes, setProofNotes] = useState({});
  const [toast, setToast]           = useState(null);
  const [acting, setActing]         = useState({});

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const refreshCampaign = async () => {
    const data = await getCampaignDetails(campaignId);
    setCampaign(data.campaign ?? data);
    setBookings(data.bookings ?? []);
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    refreshCampaign()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const submitProof = async (bookingId) => {
    if (!proofUrl[bookingId]) {
      showToast('error', 'Please enter a proof URL');
      return;
    }
    setActing((a) => ({ ...a, [bookingId]: 'proof' }));
    try {
      await uploadDeliveryProof({
        bookingId,
        fileUrl:    proofUrl[bookingId],
        notes:      proofNotes[bookingId] ?? '',
        uploadedBy: 'provider',
      });
      showToast('success', 'Proof uploaded successfully');
      // Clear inputs for this booking
      setProofUrl((p)   => { const n = { ...p };   delete n[bookingId]; return n; });
      setProofNotes((p) => { const n = { ...p };   delete n[bookingId]; return n; });
      await refreshCampaign();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActing((a) => { const n = { ...a }; delete n[bookingId]; return n; });
    }
  };

  const handleApproveDelivery = async (bookingId) => {
    setActing((a) => ({ ...a, [bookingId]: 'approve' }));
    try {
      await approveDelivery(bookingId);
      showToast('success', 'Delivery approved');
      await refreshCampaign();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActing((a) => { const n = { ...a }; delete n[bookingId]; return n; });
    }
  };

  const handleMarkPaid = async (bookingId) => {
    setActing((a) => ({ ...a, [bookingId]: 'paid' }));
    try {
      await markProviderPaid(bookingId);
      showToast('success', 'Provider marked as paid');
      await refreshCampaign();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActing((a) => { const n = { ...a }; delete n[bookingId]; return n; });
    }
  };

  if (loading) return <Layout title="Campaign"><LoadingBlock message="Loading campaign…" /></Layout>;
  if (error)   return <Layout title="Campaign"><ErrorBlock message={error} onRetry={() => { setError(''); setLoading(true); refreshCampaign().catch((e) => setError(e.message)).finally(() => setLoading(false)); }} /></Layout>;
  if (!campaign) return <Layout title="Campaign"><p style={{ color:'#8888a8' }}>Campaign not found.</p></Layout>;

  const totalSpend      = bookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
  const completedItems  = bookings.filter((b) => (b.status || '').toUpperCase() === 'COMPLETED').length;
  const activeItems     = bookings.filter((b) => ['APPROVED','PAID','IN_PROGRESS','PENDING_REVIEW'].includes((b.status || '').toUpperCase())).length;

  return (
    <Layout title={campaign.brandName} subtitle="Campaign Operations">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div className="rounded-2xl p-6 mb-6" style={{ background:'linear-gradient(135deg,#4641f5 0%,#6460ff 60%,#ff4d1f 100%)' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>Campaign Contact</p>
            <p style={{ fontWeight:700, color:'white', fontSize:'18px' }}>{campaign.contactEmail}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>Total Campaign Spend</p>
            <p style={{ fontSize:'38px', fontWeight:800, color:'white' }}>₦{Number(totalSpend).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Campaign Assets */}
      {campaign.promotionFiles?.length > 0 && (
        <div className="page-card p-5 mb-6">
          <p style={{ fontWeight:800, fontSize:'18px', color:'#12121e', marginBottom:'4px' }}>Campaign Assets</p>
          <p style={{ fontSize:'12px', color:'#64748b', marginBottom:'20px' }}>Uploaded campaign files, creatives, decks, and media plans</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaign.promotionFiles.map((file, index) => {
              const isImage = file.type?.startsWith('image');
              const isVideo = file.type?.startsWith('video');
              const isPdf   = file.type?.includes('pdf');
              return (
                <div key={index} className="rounded-3xl overflow-hidden" style={{ background:'rgba(255,255,255,0.72)', border:'1px solid rgba(255,255,255,0.7)', backdropFilter:'blur(18px)', boxShadow:'0 10px 30px rgba(15,23,42,0.06)' }}>
                  <div style={{ height:'180px', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                    {isImage ? <img src={file.url} alt={file.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : isVideo ? <video src={file.url} controls style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ textAlign:'center' }}><div style={{ fontSize:'54px' }}>{isPdf ? '📄' : '📁'}</div><p style={{ fontSize:'12px', fontWeight:700, color:'#475569' }}>{isPdf ? 'PDF Document' : 'File Asset'}</p></div>}
                  </div>
                  <div className="p-4">
                    <p style={{ fontWeight:700, fontSize:'14px', color:'#12121e', marginBottom:'6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</p>
                    <p style={{ fontSize:'11px', color:'#64748b', marginBottom:'14px' }}>{file.type}</p>
                    <div className="flex gap-2">
                      <a href={file.url} target="_blank" rel="noreferrer" className="btn-secondary flex-1 justify-center">Preview</a>
                      <a href={file.url} download className="btn-primary flex-1 justify-center">Download</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Items"  value={bookings.length} />
        <MetricCard label="Active Items" value={activeItems} />
        <MetricCard label="Completed"    value={completedItems} />
      </div>

      {/* Booking Items */}
      <div className="space-y-5">
        {bookings.length === 0 && (
          <div className="page-card p-8 text-center" style={{ color:'#8888a8' }}>No booking items found for this campaign.</div>
        )}

        {bookings.map((booking) => {
          const status = (booking.status || 'PENDING').toUpperCase();
          const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
          const bid    = booking.bookingId ?? booking.id ?? booking._id;

          return (
            <div key={bid} className="page-card p-5">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p style={{ fontSize:'20px', fontWeight:800, color:'#12121e' }}>{booking.target}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {booking.inventoryGroup  && <MiniChip label={booking.inventoryGroup.replaceAll('_',' ')} />}
                    {booking.inventoryOption && <MiniChip label={booking.inventoryOption.replaceAll('_',' ')} />}
                    {booking.market          && <MiniChip label={booking.market} />}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ padding:'8px 12px', borderRadius:'999px', background:colors.bg, color:colors.text, fontWeight:700, fontSize:'11px' }}>
                    {status.replaceAll('_', ' ')}
                  </span>
                  <p style={{ marginTop:'12px', fontWeight:800, fontSize:'26px', color:'#68c20a' }}>
                    ₦{Number(booking.finalPrice || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Upload Proof — only shown when IN_PROGRESS, using case-insensitive check */}
              {status === 'IN_PROGRESS' && (
                <div className="mt-6 p-4 rounded-2xl" style={{ background:'rgba(70,65,245,0.05)', border:'1px solid rgba(70,65,245,0.1)' }}>
                  <p style={{ fontWeight:700, marginBottom:'12px', color:'#12121e' }}>Upload Delivery Proof</p>
                  <input
                    type="url"
                    placeholder="https://... (proof file URL)"
                    value={proofUrl[bid] || ''}
                    onChange={(e) => setProofUrl((p) => ({ ...p, [bid]: e.target.value }))}
                    className="form-input mb-3"
                  />
                  <textarea
                    placeholder="Notes (optional)"
                    rows={3}
                    value={proofNotes[bid] || ''}
                    onChange={(e) => setProofNotes((p) => ({ ...p, [bid]: e.target.value }))}
                    className="form-input mb-3"
                    style={{ resize:'vertical' }}
                  />
                  <button
                    type="button"
                    onClick={() => submitProof(bid)}
                    disabled={!!acting[bid]}
                    className="btn-primary"
                  >
                    {acting[bid] === 'proof' ? <><Spinner size={13} /> Submitting…</> : 'Submit Proof'}
                  </button>
                </div>
              )}

              {/* Delivery Proofs list */}
              {booking.deliveryProofs?.length > 0 && (
                <div className="mt-6">
                  <p style={{ fontWeight:700, marginBottom:'10px' }}>Delivery Proofs</p>
                  <div className="grid gap-2">
                    {booking.deliveryProofs.map((proof) => (
                      <a
                        key={proof.proofId}
                        href={proof.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ justifyContent:'flex-start' }}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        View Proof
                        {proof.notes && <span style={{ fontSize:'11px', color:'#8888a8', marginLeft:4 }}>— {proof.notes}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions — only for ADMIN role */}
              {role === 'ADMIN' && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {status === 'PENDING_REVIEW' && (
                    <button
                      type="button"
                      onClick={() => handleApproveDelivery(bid)}
                      disabled={!!acting[bid]}
                      className="btn-success"
                      style={{ padding:'10px 18px', fontSize:'13px' }}
                    >
                      {acting[bid] === 'approve' ? <Spinner size={13} /> : (
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                      )}
                      Approve Delivery
                    </button>
                  )}
                  {booking.payoutStatus === 'PAYOUT_PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(bid)}
                      disabled={!!acting[bid]}
                      className="btn-primary"
                      style={{ padding:'10px 18px', fontSize:'13px' }}
                    >
                      {acting[bid] === 'paid' ? <Spinner size={13} /> : null}
                      Mark Provider Paid
                    </button>
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

function MetricCard({ label, value }) {
  return (
    <div className="page-card p-5">
      <p style={{ fontSize:'12px', color:'#777', marginBottom:'8px' }}>{label}</p>
      <p style={{ fontSize:'28px', fontWeight:800, color:'#12121e' }}>{value}</p>
    </div>
  );
}

function MiniChip({ label }) {
  return (
    <span style={{ padding:'6px 10px', borderRadius:'999px', background:'#f3f4f8', fontSize:'11px', fontWeight:700, color:'#555' }}>
      {label}
    </span>
  );
}