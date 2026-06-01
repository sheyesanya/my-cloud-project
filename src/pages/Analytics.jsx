import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useSubscription } from '../context/SubscriptionContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`}:{}; };
const fmt = n => `₦${Number(n||0).toLocaleString('en-NG')}`;

const CAT_COLOR = {TELEVISION:'#4338ca',RADIO_AUDIO:'#0d9488',OUT_OF_HOME:'#ea580c',PODCASTS:'#7c3aed',INFLUENCERS:'#db2777',SOCIAL_MEDIA:'#2563eb',LIVE_STREAMING:'#16a34a',MUSIC_PROMOTION:'#d97706',PRINT_MEDIA:'#64748b'};

export default function Analytics() {
  const { isPremium, isPro } = useSubscription();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!isPremium&&!isPro){setLoading(false);return;}
    (async()=>{
      try { const hd=await h(); const r=await axios.get(`${API}/analytics`,{headers:hd}); setData(r.data); }
      catch(e){console.error(e);}
      finally{setLoading(false);}
    })();
  },[isPremium,isPro]);

  if(!isPremium&&!isPro) return (
    <Layout title="Analytics" subtitle="Campaign Performance">
      <div style={{textAlign:'center',padding:'64px 24px',maxWidth:480,margin:'0 auto'}}>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:12}}>Premium Feature</div>
        <h2 style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:24,color:'#131b2e',marginBottom:12}}>Unlock Campaign Analytics</h2>
        <p style={{fontSize:13,color:'#464554',lineHeight:1.75,marginBottom:24}}>Detailed spend analysis and performance metrics require a Premium or Pro subscription.</p>
        <Link to="/subscription" style={{padding:'12px 24px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none',display:'inline-block'}}>View Plans →</Link>
      </div>
    </Layout>
  );

  if(loading) return <Layout title="Analytics" subtitle="Campaign Performance"><div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586',padding:'40px 0'}}>Loading…</div></Layout>;

  const catData = data?.categoryBreakdown||{};
  const maxCat  = Math.max(...Object.values(catData).map(v=>Number(v)||0),1);

  return (
    <Layout title="Analytics" subtitle="Campaign Performance">
      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24}}>
        {[
          {label:'Total Spend',    val:fmt(data?.totalRevenue),        color:'#4338ca'},
          {label:'Total Bookings', val:data?.totalBookings||0,         color:'#131b2e'},
          {label:'Active',         val:data?.activeBookings||0,        color:'#0d9488'},
          {label:'Completed',      val:data?.completedBookings||0,     color:'#16a34a'},
        ].map(s=>(
          <div key={s.label} style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px',position:'relative',overflow:'hidden'}}>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',marginBottom:8}}>{s.label}</div>
            <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:22,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:s.color,opacity:0.3}}/>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {Object.keys(catData).length>0&&(
        <div style={{background:'white',border:'1px solid #e1e4f0',padding:'20px 22px',marginBottom:20}}>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#464554',marginBottom:16}}>Spend by Category</div>
          {Object.entries(catData).sort(([,a],[,b])=>Number(b)-Number(a)).map(([cat,amount])=>{
            const pct=(Number(amount)/maxCat)*100;
            const color=CAT_COLOR[cat]||'#4338ca';
            return (
              <div key={cat} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#464554',width:90,textAlign:'right',flexShrink:0}}>{cat.replaceAll('_',' ')}</div>
                <div style={{flex:1,height:6,background:'#f2f3ff',position:'relative'}}>
                  <div style={{height:'100%',background:color,width:`${pct}%`,transition:'width 1s ease'}}/>
                </div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',width:80,textAlign:'right',flexShrink:0}}>{fmt(amount)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top providers */}
      {data?.topProviders?.length>0&&(
        <div style={{background:'white',border:'1px solid #e1e4f0',padding:'20px 22px'}}>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#464554',marginBottom:16}}>Top Providers by Spend</div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['#','Provider','Category','Bookings','Total Spend'].map(c=><th key={c} style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',color:'#464554',padding:'8px 14px',textAlign:'left',borderBottom:'1px solid #e1e4f0',fontWeight:500}}>{c}</th>)}</tr></thead>
            <tbody>
              {data.topProviders.slice(0,8).map((p,i)=>(
                <tr key={p.name||i}>
                  <td style={{padding:'10px 14px',fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586'}}>{i+1}</td>
                  <td style={{padding:'10px 14px',fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:12,color:'#131b2e'}}>{p.name||'-'}</td>
                  <td style={{padding:'10px 14px',fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:CAT_COLOR[(p.category||'').toUpperCase()]||'#4338ca'}}>{(p.category||'-').replaceAll('_',' ')}</td>
                  <td style={{padding:'10px 14px',fontFamily:'IBM Plex Mono,monospace',fontSize:10}}>{p.bookingCount||0}</td>
                  <td style={{padding:'10px 14px',fontFamily:'Manrope,sans-serif',fontWeight:700,color:'#4338ca'}}>{fmt(p.totalSpend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
