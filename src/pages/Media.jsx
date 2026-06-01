import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`}:{}; };

const CAT_LABELS = {ALL:'All',TELEVISION:'TV',RADIO_AUDIO:'Radio',PODCASTS:'Podcasts',OUT_OF_HOME:'OOH',PRINT_MEDIA:'Print',INFLUENCERS:'Influencers',SOCIAL_MEDIA:'Social Media',MUSIC_PROMOTION:'Music Promo',LIVE_STREAMING:'Live Streaming'};
const CAT_COLOR  = {TELEVISION:'#4338ca',RADIO_AUDIO:'#0d9488',OUT_OF_HOME:'#ea580c',PODCASTS:'#7c3aed',INFLUENCERS:'#db2777',SOCIAL_MEDIA:'#2563eb',LIVE_STREAMING:'#16a34a',MUSIC_PROMOTION:'#d97706',PRINT_MEDIA:'#64748b'};

export default function Media() {
  const { user }           = useAuth();
  const [media, setMedia]  = useState([]);
  const [loading, setLM]   = useState(true);
  const [cat, setCat]      = useState('ALL');
  const [search, setSearch]= useState('');
  const isAdmin = (user?.role||'').toUpperCase()==='ADMIN';

  useEffect(()=>{
    (async()=>{
      try { const hd=await h(); const r=await axios.get(`${API}/media`,{headers:hd}); setMedia(Array.isArray(r.data)?r.data:r.data?.media??[]); }
      catch(e){console.error(e);}
      finally{setLM(false);}
    })();
  },[]);

  const parseInv = raw => { if(!raw)return{}; if(typeof raw==='string'){try{return JSON.parse(raw);}catch{return{};}} return raw; };

  const filtered = media.filter(m=>{
    const matchCat   = cat==='ALL'||m.category===cat;
    const matchSearch= !search||m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });

  return (
    <Layout title="Media Inventory" subtitle={`${media.length}+ Verified Providers`}
      actions={isAdmin&&<a href="/create-media" style={{padding:'8px 16px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none'}}>+ Add Media</a>}>

      {/* Search */}
      <div style={{marginBottom:16}}>
        <input type="text" placeholder="Search providers — Channels TV, Cool FM, XL Billboards…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{padding:'9px 14px',border:'1px solid #e1e4f0',fontFamily:'Inter,sans-serif',fontSize:13,width:'100%',maxWidth:480,outline:'none',boxSizing:'border-box'}}/>
      </div>

      {/* Category tabs */}
      <div style={{display:'flex',borderBottom:'1px solid #e1e4f0',marginBottom:20,overflowX:'auto',gap:0}}>
        {Object.entries(CAT_LABELS).map(([key,label])=>{
          const count = key==='ALL'?media.length:media.filter(m=>m.category===key).length;
          return (
            <button key={key} onClick={()=>setCat(key)}
              style={{padding:'7px 14px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap',color:cat===key?'#4338ca':'#464554',borderBottom:cat===key?'2px solid #4338ca':'2px solid transparent',marginBottom:-1}}>
              {label}{count>0&&<span style={{marginLeft:4,opacity:0.5}}>({count})</span>}
            </button>
          );
        })}
      </div>

      {loading&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>Loading media…</div>}
      {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'48px',border:'1px dashed #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>No providers found.</div>}

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:1,background:'#e1e4f0'}}>
        {filtered.map(m=>{
          const id=m.mediaId??m.id??m._id;
          const inv=parseInv(m.inventory);
          const hasInv=Object.keys(inv).length>0;
          const prices=Object.values(inv).flatMap(g=>Object.values(g.options||{}).flatMap(o=>Object.values(o.markets||{}).map(mk=>mk.price||0))).filter(p=>p>0);
          const minPrice=prices.length?Math.min(...prices):0;
          const catColor=CAT_COLOR[(m.category||'').toUpperCase()]||'#4338ca';
          return (
            <div key={id} style={{background:'white',padding:20,display:'flex',flexDirection:'column',gap:10,transition:'border-color 0.15s',borderLeft:'2px solid transparent',cursor:'default'}}
              onMouseEnter={e=>{e.currentTarget.style.borderLeftColor=catColor;e.currentTarget.style.background='#faf8ff';}}
              onMouseLeave={e=>{e.currentTarget.style.borderLeftColor='transparent';e.currentTarget.style.background='white';}}>
              <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,fontWeight:500,padding:'2px 8px',letterSpacing:'0.08em',textTransform:'uppercase',background:`${catColor}15`,color:catColor,border:`1px solid ${catColor}25`,display:'inline-block',width:'fit-content'}}>
                {(m.category||'').replaceAll('_',' ')}
              </span>
              <div>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:14,color:'#131b2e',lineHeight:1.3,marginBottom:3}}>{m.name}</div>
                {minPrice>0&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#4338ca'}}>from ₦{Number(minPrice).toLocaleString()}</div>}
              </div>
              <div style={{marginTop:'auto',display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid #f2f3ff'}}>
                <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',background:hasInv?'#f0fdf4':'#fffbeb',color:hasInv?'#16a34a':'#d97706',border:`1px solid ${hasInv?'#bbf7d0':'#fde68a'}`,letterSpacing:'0.06em'}}>
                  {hasInv?'Inventory set':'Quote only'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
