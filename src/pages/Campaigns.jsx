import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`}:{}; };
const fmt = n => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtD = d => { try{return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'});}catch{return d||'-';} };

const STATUS_STYLE = {
  COMPLETED:{color:'#16a34a',bg:'#f0fdf4',border:'#bbf7d0'},
  PAID:{color:'#0d9488',bg:'#f0fdfa',border:'#99f6e4'},
  IN_PROGRESS:{color:'#7c3aed',bg:'#f5f3ff',border:'#ddd6fe'},
  REJECTED:{color:'#dc2626',bg:'#fef2f2',border:'#fecaca'},
};
const getS = s => STATUS_STYLE[(s||'').toUpperCase()]||{color:'#d97706',bg:'#fffbeb',border:'#fde68a'};

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('ALL');

  useEffect(()=>{
    (async()=>{
      try { const hd=await h(); const r=await axios.get(`${API}/campaigns`,{headers:hd}); setCampaigns(Array.isArray(r.data)?r.data:r.data?.campaigns??[]); }
      catch(e){console.error(e);}
      finally{setLoading(false);}
    })();
  },[]);

  const totalSpend = campaigns.reduce((s,c)=>s+(c.totalPrice||0),0);
  const active     = campaigns.filter(c=>['APPROVED','PAID','IN_PROGRESS'].includes((c.status||'').toUpperCase())).length;

  const filtered = filter==='ALL'?campaigns:campaigns.filter(c=>(c.status||'').toUpperCase().includes(filter));

  return (
    <Layout title="My Campaigns" subtitle="Campaign Operations"
      actions={<Link to="/create-booking" style={{padding:'8px 16px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none'}}>+ New Campaign</Link>}>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:20}}>
        {[{label:'Total Spend',val:fmt(totalSpend),color:'#4338ca'},{label:'Active',val:active,color:'#0d9488'},{label:'Total',val:campaigns.length,color:'#131b2e'}].map(s=>(
          <div key={s.label} style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px',position:'relative',overflow:'hidden'}}>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',marginBottom:8}}>{s.label}</div>
            <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:22,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:s.color,opacity:0.3}}/>
          </div>
        ))}
      </div>

      <div style={{display:'flex',borderBottom:'1px solid #e1e4f0',marginBottom:20}}>
        {[['ALL','All'],['PENDING','Pending'],['PAID','Live'],['COMPLETED','Completed'],['REJECTED','Declined']].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{padding:'8px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',color:filter===k?'#4338ca':'#464554',borderBottom:filter===k?'2px solid #4338ca':'2px solid transparent',marginBottom:-1}}>{l}</button>
        ))}
      </div>

      {loading&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>Loading…</div>}
      {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'48px',border:'1px dashed #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>No campaigns yet. <Link to="/create-booking" style={{color:'#4338ca'}}>Create your first →</Link></div>}

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(c=>{
          const total = c.totalPrice||(c.bookings||[]).reduce((s,b)=>s+(b.finalPrice||0),0);
          const sm    = getS(c.status);
          return (
            <div key={c.campaignId||c.id}
              onClick={()=>navigate(`/campaigns/${c.campaignId||c.id}`)}
              style={{padding:'14px 18px',background:'white',border:'1px solid #e1e4f0',borderLeft:'2px solid transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderLeftColor='#4338ca';e.currentTarget.style.background='#faf8ff';}}
              onMouseLeave={e=>{e.currentTarget.style.borderLeftColor='transparent';e.currentTarget.style.background='white';}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:'#131b2e'}}>{c.brandName||'Campaign'}</span>
                  <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 8px',background:sm.bg,color:sm.color,border:`1px solid ${sm.border}`,letterSpacing:'0.06em',textTransform:'uppercase'}}>{c.status?.replaceAll('_',' ')||'PENDING'}</span>
                </div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586'}}>{(c.bookings||[]).length} booking{(c.bookings||[]).length!==1?'s':''} · Created {fmtD(c.createdAt)}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:15,color:'#4338ca'}}>{fmt(total)}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:2}}>View details →</div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
