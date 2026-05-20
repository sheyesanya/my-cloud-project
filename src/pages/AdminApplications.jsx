import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingBlock, ErrorBlock, EmptyBlock, Toast, Spinner } from '../components/UI';
import api from '../services/api';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [toast, setToast]               = useState(null);
  const [acting, setActing]             = useState({});
  const [expanded, setExpanded]         = useState(null);
  const [filter, setFilter]             = useState('PENDING_REVIEW');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchApplications = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/providers');
      setApplications(Array.isArray(res.data) ? res.data : res.data?.providers ?? []);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, []);

  const act = async (applicationId, status) => {
    setActing(a => ({ ...a, [applicationId]: status }));
    try {
      await api.patch(`/providers/${applicationId}`, { status });
      setApplications(apps => apps.map(a => a.applicationId === applicationId ? { ...a, status } : a));
      showToast('success', `Application ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
    } catch(e) { showToast('error', e.message); }
    finally { setActing(a => { const n = { ...a }; delete n[applicationId]; return n; }); }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch { return d; }
  };

  const FILTERS = ['PENDING_REVIEW','APPROVED','REJECTED'];
  const FILTER_COLORS = { PENDING_REVIEW:'#fcd34d', APPROVED:'#86efac', REJECTED:'#fca5a5' };
  const filtered = filter === 'ALL' ? applications : applications.filter(a => (a.status || '').toUpperCase() === filter);

  const pending  = applications.filter(a => (a.status || '').toUpperCase() === 'PENDING_REVIEW').length;
  const approved = applications.filter(a => (a.status || '').toUpperCase() === 'APPROVED').length;

  return (
    <Layout
      title="Provider Applications"
      subtitle="Review and approve media organisation applications"
      actions={
        <button onClick={fetchApplications} className="btn-secondary" style={{ fontSize:12 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
          Refresh
        </button>
      }
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:'Total Applications', value: applications.length, color:'rgba(99,102,241,0.12)',  text:'#a5b4fc' },
          { label:'Pending Review',     value: pending,             color:'rgba(245,158,11,0.1)',   text:'#fcd34d' },
          { label:'Approved Providers', value: approved,            color:'rgba(34,197,94,0.1)',    text:'#86efac' },
        ].map((s) => (
          <div key={s.label} style={{ background:s.color, border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-lg)', padding:'16px 18px' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>{s.label}</p>
            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:26, color:s.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => {
          const count  = applications.filter(a => (a.status || '').toUpperCase() === f).length;
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
                background: active ? `${FILTER_COLORS[f]}18` : 'rgba(255,255,255,0.04)',
                color:       active ? FILTER_COLORS[f] : 'var(--text-muted)',
                border:      active ? `1px solid ${FILTER_COLORS[f]}40` : '1px solid var(--border)',
              }}>
              {f.replaceAll('_',' ')} <span style={{ opacity:0.6, marginLeft:4 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading && <LoadingBlock message="Loading applications…"/>}
      {error   && <ErrorBlock message={error} onRetry={fetchApplications}/>}
      {!loading && !error && filtered.length === 0 && <EmptyBlock message="No applications in this category."/>}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((app) => {
            const aid    = app.applicationId;
            const status = (app.status || 'PENDING_REVIEW').toUpperCase();
            const isOpen = expanded === aid;
            const isPending = status === 'PENDING_REVIEW';

            const statusColors = {
              PENDING_REVIEW: { bg:'rgba(245,158,11,0.1)',  text:'#fcd34d' },
              APPROVED:       { bg:'rgba(34,197,94,0.1)',   text:'#86efac' },
              REJECTED:       { bg:'rgba(239,68,68,0.1)',   text:'#fca5a5' },
            };
            const col = statusColors[status] || statusColors.PENDING_REVIEW;

            return (
              <div key={aid} className="page-card">
                {/* Header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : aid)}
                  style={{ padding:'18px 22px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'white', flexShrink:0 }}>
                      {(app.orgName || app.contactName || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, color:'white' }}>{app.orgName || '—'}</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                        {app.contactName} · {app.contactEmail}
                        {app.category && <span style={{ marginLeft:8, padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,0.06)', color:'var(--text-muted)', fontSize:10, fontWeight:600 }}>{app.category.replaceAll('_',' ')}</span>}
                      </p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                    <span style={{ padding:'5px 12px', borderRadius:20, background:col.bg, color:col.text, fontWeight:700, fontSize:10 }}>
                      {status.replaceAll('_',' ')}
                    </span>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{fmtDate(app.appliedAt)}</p>
                    <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition:'0.2s' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ padding:'0 22px 22px', borderTop:'1px solid var(--border)' }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {[
                        { label:'Phone',       value: app.contactPhone || '—' },
                        { label:'Role',        value: app.contactRole  || '—' },
                        { label:'Website',     value: app.website      || '—' },
                        { label:'Founded',     value: app.founded      || '—' },
                        { label:'Markets',     value: app.markets?.join(', ') || '—' },
                        { label:'Monthly Reach', value: app.monthlyReach || '—' },
                        { label:'Audience',    value: app.audienceDemo || '—' },
                        { label:'Bank',        value: app.bankName ? `${app.bankName} · ${app.accountName} · ${app.accountNumber}` : '—' },
                      ].map((row) => (
                        <div key={row.label} style={{ padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                          <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{row.label}</p>
                          <p style={{ fontSize:12, fontWeight:500, color:'white', wordBreak:'break-all' }}>{row.value}</p>
                        </div>
                      ))}
                    </div>

                    {app.description && (
                      <div style={{ marginTop:16, padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                        <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Description</p>
                        <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>{app.description}</p>
                      </div>
                    )}

                    {isPending && (
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => act(aid, 'APPROVED')}
                          disabled={!!acting[aid]}
                          className="btn-success"
                          style={{ padding:'10px 20px', fontSize:13 }}
                        >
                          {acting[aid] === 'APPROVED' ? <Spinner size={13}/> : (
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                          )}
                          Approve Provider
                        </button>
                        <button
                          onClick={() => act(aid, 'REJECTED')}
                          disabled={!!acting[aid]}
                          className="btn-danger"
                          style={{ padding:'10px 20px', fontSize:13 }}
                        >
                          {acting[aid] === 'REJECTED' ? <Spinner size={13}/> : (
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          )}
                          Reject Application
                        </button>
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