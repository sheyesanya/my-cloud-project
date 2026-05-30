import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  return token ? { Authorization:`Bearer ${token}` } : {};
};

const CAT_LABELS = {
  ALL:'All', TELEVISION:'TV', RADIO_AUDIO:'Radio', PODCASTS:'Podcasts',
  OUT_OF_HOME:'OOH', PRINT_MEDIA:'Print', INFLUENCERS:'Influencers',
  SOCIAL_MEDIA:'Social Media', MUSIC_PROMOTION:'Music Promo', LIVE_STREAMING:'Live Streaming',
};

const CAT_COLOR = {
  TELEVISION:'var(--amber)', RADIO_AUDIO:'#5eead4', OUT_OF_HOME:'#fb923c',
  PODCASTS:'#d8b4fe', INFLUENCERS:'#f472b6', SOCIAL_MEDIA:'#60a5fa',
  LIVE_STREAMING:'#4ade80', MUSIC_PROMOTION:'#fcd34d', PRINT_MEDIA:'#94a3b8',
};

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.04 } } };
const card    = { hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.22,1,0.36,1] } } };

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
      .then(r => setMedia(Array.isArray(r)?r:r.media??r.data??[]))
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

  const parseInv = (raw) => { if(!raw) return {}; if(typeof raw==='string'){try{return JSON.parse(raw);}catch{return{};}} return raw; };

  const filtered = media.filter(m => {
    const matchCat    = cat==='ALL' || m.category===cat;
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <PageTitle title="Media Inventory"/>
      <Layout title="Media Inventory" subtitle={`${media.length}+ Verified Providers`}
        actions={isAdmin && <a href="/create-media" className="btn-primary" style={{ fontSize:11, padding:'8px 18px', textDecoration:'none' }}>+ Add Media</a>}
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid var(--border)', paddingBottom:10, marginBottom:16, maxWidth:480 }}>
          <input type="text" placeholder="Search providers — Channels TV, Cool FM, XL Billboards…"
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{ flex:1, background:'none', border:'none', fontSize:13, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none' }}/>
          {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer' }}>✕</button>}
        </div>

        {/* Category filters */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:20, overflowX:'auto' }}>
          {Object.entries(CAT_LABELS).map(([key,label]) => {
            const count = key==='ALL' ? media.length : media.filter(m=>m.category===key).length;
            return (
              <button key={key} onClick={()=>setCat(key)}
                style={{ padding:'7px 14px', background:'none', border:'none', cursor:'pointer', fontFamily:'IBM Plex Mono,monospace', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap',
                  color:cat===key?'var(--amber)':'var(--text3)',
                  borderBottom:cat===key?'2px solid var(--amber)':'2px solid transparent',
                  marginBottom:-1, transition:'all 0.15s' }}>
                {label}{count>0&&<span style={{ marginLeft:5, opacity:0.5 }}>({count})</span>}
              </button>
            );
          })}
        </div>

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text3)', padding:'20px 0', alignItems:'center' }}><Spinner size={14}/>Loading media…</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text3)', fontSize:12 }}>No providers found.</div>
        )}

        {/* Grid */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:1, background:'var(--border)' }}>
          {filtered.map(m => {
            const id      = m.mediaId??m.id??m._id;
            const inv     = parseInv(m.inventory);
            const hasInv  = Object.keys(inv).length > 0;
            const prices  = Object.values(inv).flatMap(g=>Object.values(g.options||{}).flatMap(o=>Object.values(o.markets||{}).map(mk=>mk.price||0))).filter(p=>p>0);
            const minPrice= prices.length ? Math.min(...prices) : 0;
            const catColor= CAT_COLOR[(m.category||'').toUpperCase()] || 'var(--amber)';

            return (
              <motion.div key={id} variants={card}
                style={{ background:'var(--bg)', padding:'18px', display:'flex', flexDirection:'column', gap:10, transition:'background 0.15s', cursor:'default', borderLeft:'2px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.borderLeftColor=catColor; }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg)'; e.currentTarget.style.borderLeftColor='transparent'; }}>

                <div>
                  <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, fontWeight:500, padding:'2px 8px', letterSpacing:'0.08em', textTransform:'uppercase', background:`${catColor}15`, color:catColor, border:`1px solid ${catColor}30` }}>
                    {(m.category||'').replaceAll('_',' ')}
                  </span>
                </div>

                <div>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'var(--text)', lineHeight:1.25, marginBottom:4 }}>{m.name}</p>
                  {minPrice > 0 && (
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--amber)' }}>from ₦{Number(minPrice).toLocaleString()}</p>
                  )}
                </div>

                <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid var(--border2)' }}>
                  <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, padding:'2px 7px', background:hasInv?'rgba(74,222,128,0.08)':'rgba(212,168,67,0.08)', color:hasInv?'#4ade80':'var(--amber)', border:`1px solid ${hasInv?'rgba(74,222,128,0.2)':'var(--amber-border)'}`, letterSpacing:'0.06em' }}>
                    {hasInv ? 'Inventory set' : 'Quote only'}
                  </span>
                  <div style={{ display:'flex', gap:5 }}>
                    {isAdmin && (
                      <button onClick={()=>deleteMedia(id,m.name)} disabled={deleting[id]}
                        style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, padding:'2px 8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#fca5a5', cursor:'pointer', letterSpacing:'0.06em' }}>
                        {deleting[id] ? '…' : 'Delete'}
                      </button>
                    )}
                    {!isAdmin && user?.role !== 'PROVIDER' && (
                      <a href="/register/provider" style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, padding:'2px 8px', background:'var(--amber-dim)', border:'1px solid var(--amber-border)', color:'var(--amber)', textDecoration:'none', letterSpacing:'0.06em' }}>
                        Claim
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Layout>
    </>
  );
}