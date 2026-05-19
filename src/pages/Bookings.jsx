import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingBlock, ErrorBlock, EmptyBlock, StatusBadge, Toast, Spinner } from '../components/UI';
import { getBookings, updateBooking } from '../services/api';

const FILTERS = ['ALL','PENDING','APPROVED','REJECTED'];
const FILTER_COLORS = { ALL:'#a5b4fc', PENDING:'#fcd34d', APPROVED:'#86efac', REJECTED:'#fca5a5' };

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [acting, setActing]     = useState({});
  const [toast, setToast]       = useState(null);
  const [filter, setFilter]     = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true); setError('');
    try {
      const res = await getBookings();
      setBookings(Array.isArray(res) ? res : res.bookings ?? res.data ?? []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const act = async (id, status) => {
    setActing((a) => ({ ...a, [id]: status }));
    try {
      await updateBooking(id, { status });
      setBookings((b) => b.map((bk) => (bk.id ?? bk._id ?? bk.bookingId) === id ? { ...bk, status } : bk));
      setToast({ type:'success', message:`Booking ${status.toLowerCase()} successfully.` });
    } catch (e) { setToast({ type:'error', message: e.message }); }
    finally {
      setActing((a) => { const n={...a}; delete n[id]; return n; });
      setTimeout(() => setToast(null), 3500);
    }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }
    catch { return d; }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => (b.status ?? '').toUpperCase() === filter);

  return (
    <Layout
      title="Bookings"
      subtitle="Review and manage all booking requests"
      actions={
        <button onClick={fetchBookings} className="btn-secondary" style={{ fontSize:12 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
          Refresh
        </button>
      }
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => {
          const count  = f === 'ALL' ? bookings.length : bookings.filter((b) => (b.status ?? '').toUpperCase() === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
                background: active ? `${FILTER_COLORS[f]}18` : 'rgba(255,255,255,0.04)',
                color:       active ? FILTER_COLORS[f] : 'var(--text-muted)',
                border:      active ? `1px solid ${FILTER_COLORS[f]}40` : '1px solid var(--border)',
              }}
            >
              {f} <span style={{ opacity:0.6, marginLeft:4, fontFamily:'var(--font-mono)' }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="page-card">
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#6366f1,#a855f7)' }}/>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:'white' }}>
              {filter === 'ALL' ? 'All Bookings' : `${filter.charAt(0)+filter.slice(1).toLowerCase()} Bookings`}
            </p>
            <p style={{ fontSize:11, color:'var(--text-muted)' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading && <LoadingBlock message="Loading bookings…"/>}
        {error   && <ErrorBlock message={error} onRetry={fetchBookings}/>}
        {!loading && !error && filtered.length === 0 && <EmptyBlock message={filter === 'ALL' ? 'No bookings found.' : `No ${filter.toLowerCase()} bookings.`}/>}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Brand</th>
                  <th>Media</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Final Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const id        = b.id ?? b._id ?? b.bookingId ?? i;
                  const status    = (b.status ?? 'PENDING').toUpperCase();
                  const isPending = status === 'PENDING' || status === 'PENDING_PROVIDER_CONFIRMATION';
                  const isActing  = acting[id];
                  return (
                    <tr key={id}>
                      <td style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11, width:36 }}>{i+1}</td>
                      <td>
                        <p style={{ fontWeight:600, color:'white', fontSize:13 }}>{b.brand_name ?? b.brandName ?? b.brand ?? '—'}</p>
                        {(b.email ?? b.brand_email ?? b.contactEmail) && (
                          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{b.email ?? b.brand_email ?? b.contactEmail}</p>
                        )}
                      </td>
                      <td style={{ color:'var(--text-secondary)', fontWeight:500 }}>{b.media_name ?? b.mediaName ?? b.target ?? '—'}</td>
                      <td style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{fmtDate(b.date ?? b.booking_date ?? b.bookingDate)}</td>
                      <td><StatusBadge status={status}/></td>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color:'#86efac' }}>
                        {b.final_price != null || b.finalPrice != null || b.price != null
                          ? `₦${Number(b.final_price ?? b.finalPrice ?? b.price).toLocaleString()}`
                          : '—'}
                      </td>
                      <td>
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button className="btn-success" disabled={!!isActing} onClick={() => act(id,'APPROVED')}>
                              {isActing === 'APPROVED' ? <Spinner size={11}/> : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
                              Approve
                            </button>
                            <button className="btn-danger" disabled={!!isActing} onClick={() => act(id,'REJECTED')}>
                              {isActing === 'REJECTED' ? <Spinner size={11}/> : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}