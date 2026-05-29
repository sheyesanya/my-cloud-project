import { useEffect, useState } from 'react';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { getMedia } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const CAT_LABELS = {
  ALL:'All', TELEVISION:'TV', RADIO_AUDIO:'Radio', PODCASTS:'Podcasts',
  OUT_OF_HOME:'OOH', PRINT_MEDIA:'Print', INFLUENCERS:'Influencers',
  SOCIAL_MEDIA:'Social Media', MUSIC_PROMOTION:'Music Promo',
  LIVE_STREAMING:'Live Streaming',
};

export default function Media() {
  const [media, setMedia]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [deleting, setDeleting] = useState({});
  const [search, setSearch]     = useState('');
  const [cat, setCat]           = useState('ALL');
  const { user }                = useAuth();
  const isAdmin = (user?.role||'').toUpperCase() === 'ADMIN';

  const showToast = (type, msg) => { setToast({type,message:msg}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    getMedia()
      .then(r => setMedia(Array.isArray(r) ? r : r.media ?? r.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteMedia = async (mediaId, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(d => ({...d,[mediaId]:true}));
    try {
      const headers = await authHeader();
      await axios.delete(`${API}/media/${mediaId}`, { headers });
      setMedia(prev => prev.filter(m => (m.mediaId??m.id??m._id) !== mediaId));
      showToast('success', `${name} deleted`);
    } catch(e) { showToast('error', e.response?.data?.error||e.message); }
    finally { setDeleting(d => { const n={...d}; delete n[mediaId]; return n; }); }
  };

  const filtered = media.filter(m => {
    const matchCat = cat === 'ALL' || m.category === cat;
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const parseInv = (raw) => { if(!raw) return {}; if(typeof raw==='string'){try{return JSON.parse(raw);}catch{return{};}} return raw; };

  return (
    <>
      <PageTitle title="Media Inventory" description="Browse 184+ verified TV, radio, billboard, podcast and influencer providers."/>
      <Layout title="Media Inventory" subtitle={`${media.length}+ verified providers across 9 categories`}
        actions={isAdmin && <a href="/create-media" className="btn-primary" style={{ fontSize:12, padding:'7px 14px', textDecoration:'none' }}>+ Add Media</a>}
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Search + filters */}
        <div style={{ marginBottom:16 }}>
          <input type="text" placeholder="Search providers..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:'100%', padding:'9px 14px', borderRadius:8, fontSize:13, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', marginBottom:10, fontFamily:'Inter,sans-serif' }}/>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {Object.entries(CAT_LABELS).map(([key,label]) => {
              const count = key==='ALL' ? media.length : media.filter(m=>m.category===key).length;
              return (
                <button key={key} onClick={()=>setCat(key)}
                  style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer', border:'none', transition:'all 0.12s', fontFamily:'Inter,sans-serif',
                    background: cat===key ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)',
                    color:       cat===key ? 'var(--accent-light)' : 'var(--text-muted)',
                    outline:     cat===key ? '0.5px solid var(--accent-border)' : '0.5px solid var(--border)',
                  }}>
                  {label} {count > 0 && <span style={{ opacity:0.6 }}>({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text-muted)', padding:'20px 0' }}><Spinner size={14}/>Loading media…</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)', fontSize:13 }}>No providers found.</div>
        )}

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
          {filtered.map(m => {
            const id   = m.mediaId??m.id??m._id;
            const inv  = parseInv(m.inventory);
            const hasInv = Object.keys(inv).length > 0;
            const groupCount = Object.keys(inv).length;
            const optCount = Object.values(inv).reduce((s,g)=>s+Object.keys(g.options||{}).length,0);
            const prices = Object.values(inv).flatMap(g => Object.values(g.options||{}).flatMap(o => Object.values(o.markets||{}).map(mk=>mk.price||0))).filter(p=>p>0);
            const minPrice = prices.length ? Math.min(...prices) : 0;

            return (
              <div key={id} style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:10, padding:'14px 16px', transition:'border-color 0.15s', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:9, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
                      {(m.category||'').replaceAll('_',' ')}
                    </p>
                    <p style={{ fontSize:13, fontWeight:500, color:'white', lineHeight:1.3 }}>{m.name}</p>
                  </div>
                  <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, flexShrink:0, marginTop:2,
                    background: hasInv ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.08)',
                    color:       hasInv ? '#86efac'             : '#fcd34d',
                    border:      hasInv ? '0.5px solid rgba(34,197,94,0.2)' : '0.5px solid rgba(245,158,11,0.15)',
                  }}>{hasInv ? `${groupCount}g · ${optCount} opts` : 'Quote'}</span>
                </div>

                {minPrice > 0 && (
                  <p style={{ fontSize:11, color:'var(--accent-light)', fontWeight:500 }}>from ₦{Number(minPrice).toLocaleString()}</p>
                )}

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:8, borderTop:'0.5px solid rgba(255,255,255,0.05)', marginTop:'auto' }}>
                  <p style={{ fontSize:10, color:'var(--text-muted)' }}>Via BrandCasta</p>
                  <div style={{ display:'flex', gap:5 }}>
                    {isAdmin && (
                      <button onClick={()=>deleteMedia(id,m.name)} disabled={deleting[id]}
                        style={{ padding:'3px 8px', borderRadius:6, fontSize:10, background:'rgba(239,68,68,0.08)', border:'0.5px solid rgba(239,68,68,0.18)', color:'#fca5a5', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                        {deleting[id] ? '…' : '✕'}
                      </button>
                    )}
                    {!isAdmin && user?.role !== 'PROVIDER' && (
                      <a href="/register/provider" style={{ padding:'3px 8px', borderRadius:6, fontSize:10, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)', color:'var(--accent-light)', textDecoration:'none' }}>
                        Claim
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Layout>
    </>
  );
}