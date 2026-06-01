import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`}:{}; };
const fmt = n => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtD = d => { try{return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short'});}catch{return d||'-';} };

const STATUS_COLOR = {
  COMPLETED:'#16a34a',PAID:'#0d9488',IN_PROGRESS:'#7c3aed',
  PENDING_DELIVERY_REVIEW:'#d97706',PENDING_PROVIDER_CONFIRMATION:'#d97706',
  PAYMENT_PENDING:'#4338ca',REJECTED:'#dc2626',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const hd = await h();
        const [a,b] = await Promise.all([
          axios.get(`${API}/analytics`,{headers:hd}),
          axios.get(`${API}/bookings`,{headers:hd}),
        ]);
        setData(a.data);
        const all = Array.isArray(b.data)?b.data:b.data?.bookings??[];
        setBookings(all.sort((x,y)=>new Date(y.createdAt)-new Date(x.createdAt)).slice(0,6));
      } catch(e){console.error(e);}
      finally{setLoading(false);}
    })();
  },[]);

  const name = user?.name?.split(' ')[0]||user?.email?.split('@')[0]||'there';
  const hr = new Date().getHours();
  const greeting = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';

  const STATS = data?[
    {label:'Total Spend',    val:fmt(data.totalRevenue),      note:`${data.totalBookings||0} bookings`},
    {label:'Active',         val:data.activeBookings||0,      note:'In flight',    color:'#0d9488'},
    {label:'Completed',      val:data.completedBookings||0,   note:'Delivered',    color:'#16a34a'},
    {label:'Needs Attention',val:data.pendingBookings||0,     note:'Pending',      color:'#d97706'},
  ]:[];

  const th = {fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid #e1e4f0',fontWeight:500};
  const td = {padding:'11px 14px',fontFamily:'Inter,sans-serif',fontSize:12,color:'#131b2e',borderBottom:'1px solid #f2f3ff'};

  return (
    <Layout title={`${greeting}, ${name}`} subtitle="Campaign Overview"
      actions={<Link to="/create-booking" style={{padding:'8px 16px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none',display:'inline-block'}}>+ New Campaign</Link>}>

      {loading && <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586',padding:'40px 0'}}>Loading…</div>}

      {!loading && (
        <div style={{display:'flex',flexDirection:'column',gap:24}}>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
            {STATS.map(s=>(
              <div key={s.label} style={{background:'white',border:'1px solid #e1e4f0',padding:'20px 22px',position:'relative',overflow:'hidden'}}>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#464554',marginBottom:10}}>{s.label}</div>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:28,letterSpacing:'-0.8px',color:s.color||'#1e1b4b',lineHeight:1}}>{s.val}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:6}}>{s.note}</div>
                <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:s.color||'#4338ca',opacity:0.4}}/>
              </div>
            ))}
          </div>

          {/* Two col */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20}}>

            {/* Recent Bookings */}
            <div style={{background:'white',border:'1px solid #e1e4f0',padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,color:'#131b2e'}}>Recent Bookings</div>
                <Link to="/bookings" style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.08em'}}>View all →</Link>
              </div>
              {bookings.length===0?<p style={{fontSize:12,color:'#777586'}}>No bookings yet. <Link to="/create-booking" style={{color:'#4338ca'}}>Start your first →</Link></p>:(
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr>{['Brand','Media','Value','Status'].map(c=><th key={c} style={th}>{c}</th>)}</tr></thead>
                  <tbody>
                    {bookings.map(b=>(
                      <tr key={b.bookingId}>
                        <td style={td}>{b.brandName||b.contactEmail||'-'}</td>
                        <td style={{...td,color:'#464554'}}>{b.target||'-'}</td>
                        <td style={{...td,fontFamily:'Manrope,sans-serif',fontWeight:700,color:'#4338ca'}}>{fmt(b.finalPrice)}</td>
                        <td style={td}><span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 8px',background:'#f2f3ff',color:STATUS_COLOR[b.status]||'#464554',letterSpacing:'0.06em',textTransform:'uppercase'}}>{(b.status||'').replaceAll('_',' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick actions */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                {to:'/create-booking', label:'Create Campaign',      sub:'Book TV, radio, OOH and more'},
                {to:'/media',          label:'Media Inventory',      sub:'184+ verified providers'},
                {to:'/analytics',      label:'Analytics',            sub:'Spend breakdown'},
                {to:'/brief-generator',label:'AI Brief Generator',   sub:'Generate with AI'},
                {to:'/assistant',      label:'Campaign Assistant',   sub:'Ask our AI strategist'},
              ].map(a=>(
                <Link key={a.to} to={a.to} style={{display:'block',padding:'12px 14px',background:'white',border:'1px solid #e1e4f0',textDecoration:'none',borderLeft:'2px solid transparent',transition:'border-color 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderLeftColor='#4338ca'}
                  onMouseLeave={e=>e.currentTarget.style.borderLeftColor='transparent'}>
                  <div style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:12,color:'#131b2e'}}>{a.label}</div>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:2}}>{a.sub}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Spend banner */}
          {data && (
            <div style={{padding:'22px 28px',background:'white',border:'1px solid #e1e4f0',borderLeft:'3px solid #4338ca',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:6}}>Total Campaign Spend</div>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:32,color:'#1e1b4b',letterSpacing:'-1px',lineHeight:1}}>{fmt(data.totalRevenue)}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586',marginTop:4}}>Across {data.totalBookings||0} bookings</div>
              </div>
              <Link to="/create-booking" style={{padding:'10px 22px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none'}}>Book a Campaign →</Link>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
