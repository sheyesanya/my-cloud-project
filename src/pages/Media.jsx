import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingBlock, ErrorBlock, EmptyBlock, Toast, Spinner } from '../components/UI';
import { getMedia, createMedia } from '../services/api';

const GRAD = [
  'linear-gradient(135deg,#6366f1,#a855f7)',
  'linear-gradient(135deg,#14b8a6,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#22c55e,#84cc16)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
];
const avatarGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

function AddMediaModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ name:'', base_price:'', discount_percent:'' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.base_price) return;
    setSaving(true); setErr('');
    try {
      await createMedia({ name: form.name.trim(), base_price: Number(form.base_price), discount_percent: Number(form.discount_percent) || 0 });
      onCreated(); onClose();
    } catch (e) { setErr(e.message); }
    finally     { setSaving(false); }
  };

  const inp = { width:'100%', padding:'11px 14px', borderRadius:10, fontSize:13, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'white', transition:'all 0.15s' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)' }} onClick={onClose}/>
      <div className="relative w-full max-w-md" style={{ background:'var(--bg-surface)', border:'1px solid var(--border-strong)', borderRadius:20, padding:24, animation:'fadeSlideIn 0.2s ease-out' }}>
        <div className="flex items-center gap-3 mb-5">
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'white' }}>Add Media Profile</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)' }}>Create a new media personality listing</p>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)', cursor:'pointer', color:'var(--text-muted)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {err && <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#fca5a5', fontSize:13 }}>{err}</div>}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Name *</label>
            <input style={inp} placeholder="e.g. Toolz Oniru, Ebuka Obi-Uchendu" value={form.name} onChange={(e)=>set('name',e.target.value)} required/>
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Base Price (₦) *</label>
            <input style={inp} type="number" min="0" placeholder="500000" value={form.base_price} onChange={(e)=>set('base_price',e.target.value)} required/>
          </div>
          <div>
            <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Discount %</label>
            <input style={inp} type="number" min="0" max="100" placeholder="10" value={form.discount_percent} onChange={(e)=>set('discount_percent',e.target.value)}/>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <><Spinner size={13}/> Saving…</> : 'Add Media'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Media() {
  const [media, setMedia]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [showModal, setModal] = useState(false);
  const [toast, setToast]     = useState(null);

  const fetchMedia = async () => {
    setLoading(true); setError('');
    try {
      const res = await getMedia();
      setMedia(Array.isArray(res) ? res : res.media ?? res.data ?? []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleCreated = () => {
    fetchMedia();
    setToast({ type:'success', message:'Media profile created!' });
    setTimeout(() => setToast(null), 3500);
  };

  const discountedPrice = (base, pct) => !base || !pct ? null : base - (base * pct) / 100;

  return (
    <Layout
      title="Media"
      subtitle="Manage media personalities and their pricing"
      actions={
        <button onClick={() => setModal(true)} className="btn-primary">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add Media
        </button>
      }
    >
      {showModal && <AddMediaModal onClose={() => setModal(false)} onCreated={handleCreated}/>}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      <div className="page-card">
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div className="flex items-center gap-3">
            <div style={{ width:3, height:18, borderRadius:2, background:'linear-gradient(180deg,#6366f1,#a855f7)' }}/>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'white' }}>All Media Profiles</p>
              <p style={{ fontSize:11, color:'var(--text-muted)' }}>{media.length} profile{media.length !== 1 ? 's' : ''} listed</p>
            </div>
          </div>
          <button onClick={fetchMedia} className="btn-secondary" style={{ padding:'6px 12px', fontSize:12 }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
            Refresh
          </button>
        </div>

        {loading && <LoadingBlock message="Loading media profiles…"/>}
        {error   && <ErrorBlock message={error} onRetry={fetchMedia}/>}
        {!loading && !error && media.length === 0 && <EmptyBlock message="No media profiles yet. Add your first one!"/>}

        {!loading && !error && media.length > 0 && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Personality</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                </tr>
              </thead>
              <tbody>
                {media.map((m, i) => {
                  const base  = m.base_price ?? m.basePrice ?? m.price;
                  const pct   = m.discount_percent ?? m.discount ?? m.discountPercent;
                  const final = discountedPrice(base, pct);
                  return (
                    <tr key={m.id ?? m._id ?? i}>
                      <td style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:11, width:36 }}>{i+1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div style={{ width:34, height:34, borderRadius:10, background:avatarGrad(m.name), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:700, flexShrink:0 }}>
                            {(m.name||'?')[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight:600, color:'white', fontSize:13 }}>{m.name}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-secondary)' }}>
                        {base != null ? `₦${Number(base).toLocaleString()}` : '—'}
                      </td>
                      <td>
                        {pct != null ? (
                          <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700, background:'rgba(239,68,68,0.1)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.18)' }}>
                            {pct}% off
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color:'#86efac' }}>
                        {final != null ? `₦${Number(final).toLocaleString()}` : base != null ? `₦${Number(base).toLocaleString()}` : '—'}
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