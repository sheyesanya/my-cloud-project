import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`,'Content-Type':'application/json'}:{}; };
const fmt = n => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtD = d => { try{return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'});}catch{return d||'-';} };
const timeAgo = d => { if(!d)return ''; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60)return 'just now'; if(s<3600)return Math.floor(s/60)+'m ago'; if(s<86400)return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago'; };

const SM = {
  PENDING_PROVIDER_CONFIRMATION:{label:'Needs Response',color:'#d97706',bg:'#fffbeb',border:'#fde68a',urgent:true},
  PAYMENT_PENDING:{label:'Awaiting Payment',color:'#4338ca',bg:'#eef2ff',border:'#c7d2fe'},
  PAID:{label:'Live — Upload Proof',color:'#0d9488',bg:'#f0fdfa',border:'#99f6e4'},
  IN_PROGRESS:{label:'In Progress',color:'#7c3aed',bg:'#f5f3ff',border:'#ddd6fe'},
  PENDING_DELIVERY_REVIEW:{label:'Proof Submitted',color:'#4338ca',bg:'#eef2ff',border:'#c7d2fe'},
  COMPLETED:{label:'Completed',color:'#16a34a',bg:'#f0fdf4',border:'#bbf7d0'},
  REJECTED:{label:'Declined',color:'#dc2626',bg:'#fef2f2',border:'#fecaca'},
};

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState({});
  const [expanded, setExpanded] = useState(null);
  const [proofUrl, setProofUrl] = useState({});
  const [proofNotes, setPN]     = useState({});
  const [filter, setFilter]     = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const hd=await h();
      const r=await axios.get(`${API}/bookings`,{headers:hd});
      const all=Array.isArray(r.data)?r.data:r.data?.bookings??[];
      setBookings(all.sort((a,b)=>{
        const ap=a.status==='PENDING_PROVIDER_CONFIRMATION'?0:1;
        const bp=b.status==='PENDING_PROVIDER_CONFIRMATION'?0:1;
        return ap-bp||new Date(b.createdAt)-new Date(a.createdAt);
      }));
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(()=>{fetchBookings();},[]);

  const approve = async bookingId => {
    setActing(a=>({...a,[bookingId]:'approve'}));
    try { const hd=await h(); await axios.post(`${API}/bookings/${bookingId}/approve`,{},{headers:hd}); await fetchBookings(); }
    catch(e){console.error(e);}
    finally{setActing(a=>{const n={...a};delete n[bookingId];return n;});}
  };

  const reject = async bookingId => {
    if(!window.confirm('Decline this booking?'))return;
    setActing(a=>({...a,[bookingId]:'reject'}));
    try { const hd=await h(); await axios.post(`${API}/bookings/${bookingId}/reject`,{},{headers:hd}); await fetchBookings(); }
    catch(e){console.error(e);}
    finally{setActing(a=>{const n={...a};delete n[bookingId];return n;});}
  };

  const submitProof = async bookingId => {
    if(!proofUrl[bookingId])return;
    setActing(a=>({...a,[bookingId]:'proof'}));
    try {
      const hd=await h();
      await axios.post(`${API}/bookings/proof`,{bookingId,fileUrl:proofUrl[bookingId],notes:proofNotes[bookingId]||'',uploadedBy:'provider'},{headers:hd});
      setProofUrl(p=>{const n={...p};delete n[bookingId];return n;});
      await fetchBookings();
    } catch(e){console.error(e);}
    finally{setActing(a=>{const n={...a};delete n[bookingId];return n;});}
  };

  const pending  = bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length;
  const active   = bookings.filter(b=>['PAID','IN_PROGRESS'].includes(b.status)).length;
  const completed= bookings.filter(b=>b.status==='COMPLETED').length;
  const revenue  = bookings.filter(b=>b.status==='COMPLETED').reduce((s,b)=>s+(b.mediaPayout||0),0);

  const filtered = filter==='ALL'?bookings:bookings.filter(b=>b.status===filter);
  const inp = {width:'100%',border:'1px solid #e1e4f0',padding:'7px 10px',fontFamily:'Inter,sans-serif',fontSize:11,outline:'none',marginBottom:8,boxSizing:'border-box'};

  return (
    <Layout title="My Bookings" subtitle="Provider Dashboard"
      actions={<button onClick={fetchBookings} style={{padding:'7px 14px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',background:'transparent',cursor:'pointer'}}>↻ Refresh</button>}>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20}}>
        {[{label:'Needs Action',val:pending,color:'#d97706',urgent:pending>0},{label:'Active',val:active,color:'#0d9488'},{label:'Completed',val:completed,color:'#16a34a'},{label:'Total Earned',val:fmt(revenue),color:'#4338ca'}].map(s=>(
          <div key={s.label} style={{background:'white',border:'1px solid #e1e4f0',padding:'14px 16px',position:'relative',overflow:'hidden',borderTop:s.urgent?'2px solid #d97706':'2px solid transparent'}}>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',marginBottom:7}}>{s.label}</div>
            <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:20,color:s.color,lineHeight:1}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'1px solid #e1e4f0',marginBottom:16,overflowX:'auto'}}>
        {[['ALL','All',bookings.length],['PENDING_PROVIDER_CONFIRMATION','Needs Response',pending],['PAID','Live',active],['PENDING_DELIVERY_REVIEW','Under Review',bookings.filter(b=>b.status==='PENDING_DELIVERY_REVIEW').length],['COMPLETED','Completed',completed]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{padding:'7px 14px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap',color:filter===k?'#4338ca':'#464554',borderBottom:filter===k?'2px solid #4338ca':'2px solid transparent',marginBottom:-1}}>
            {l}{c>0&&<span style={{marginLeft:4,opacity:0.6}}>({c})</span>}
          </button>
        ))}
      </div>

      {loading&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>Loading…</div>}

      <div style={{display:'flex',flexDirection:'column',gap:4}}>
        {filtered.map(booking=>{
          const status=(booking.status||'').toUpperCase();
          const meta=SM[status]||SM.PENDING_PROVIDER_CONFIRMATION;
          const bid=booking.bookingId;
          const isOpen=expanded===bid;
          const isPending=status==='PENDING_PROVIDER_CONFIRMATION';
          const needsProof=['PAID','IN_PROGRESS'].includes(status);

          return (
            <div key={bid} style={{border:`1px solid ${isOpen?'#c7d2fe':'#e1e4f0'}`,borderLeft:`2px solid ${meta.urgent?'#d97706':'transparent'}`,overflow:'hidden',background:'white',transition:'border-color 0.15s'}}>
              <div onClick={()=>setExpanded(isOpen?null:bid)}
                style={{padding:'12px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'background 0.1s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#faf8ff'}
                onMouseLeave={e=>e.currentTarget.style.background='white'}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:'#131b2e'}}>{booking.brandName||'-'}</span>
                    <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'1px 7px',background:meta.bg,color:meta.color,border:`1px solid ${meta.border}`,letterSpacing:'0.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{meta.label}</span>
                  </div>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {booking.target} · {(booking.inventoryOption||'').replaceAll('_',' ')} · {booking.market} · {fmtD(booking.date)}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,color:'#16a34a'}}>{fmt(booking.mediaPayout)}</div>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>{timeAgo(booking.createdAt)}</div>
                </div>
                <span style={{fontSize:10,color:'#777586',transform:isOpen?'rotate(180deg)':'none',display:'inline-block',transition:'transform 0.2s'}}>⌄</span>
              </div>

              {isOpen&&(
                <div style={{borderTop:'1px solid #e1e4f0',padding:'14px 16px',background:'#faf8ff'}}>
                  {/* Details grid */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8,marginBottom:12}}>
                    {[['Campaign Value',fmt(booking.finalPrice)],['Your Payout',fmt(booking.mediaPayout)],['Client',booking.contactEmail||'-'],['Date',fmtD(booking.date)],['Runs',booking.runs||1],['Ref',(booking.bookingId||'').slice(0,8).toUpperCase()]].map(([l,v])=>(
                      <div key={l} style={{padding:'7px 10px',background:'white',border:'1px solid #e1e4f0'}}>
                        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#777586',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2}}>{l}</div>
                        <div style={{fontSize:11,fontWeight:500,color:'#131b2e',wordBreak:'break-all'}}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {booking.campaignBrief&&(
                    <div style={{padding:'10px 12px',background:'#fffbeb',borderLeft:'2px solid #d97706',marginBottom:12}}>
                      <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Campaign Brief</div>
                      <p style={{fontSize:11,color:'#464554',lineHeight:1.7}}>{booking.campaignBrief}</p>
                    </div>
                  )}

                  {isPending&&(
                    <div style={{padding:14,background:'white',border:'1px solid #e1e4f0'}}>
                      <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}}>Respond to Booking</div>
                      <p style={{fontSize:11,color:'#464554',marginBottom:10,lineHeight:1.6}}>Payout of <strong style={{color:'#16a34a'}}>{fmt(booking.mediaPayout)}</strong> released after delivery approval.</p>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>approve(bid)} disabled={!!acting[bid]} style={{flex:1,padding:'8px',background:'#16a34a',color:'white',border:'none',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                          {acting[bid]==='approve'?'…':'✓ Approve'}
                        </button>
                        <button onClick={()=>reject(bid)} disabled={!!acting[bid]} style={{flex:1,padding:'8px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',fontFamily:'IBM Plex Mono,monospace',fontWeight:600,fontSize:11,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                          {acting[bid]==='reject'?'…':'✕ Decline'}
                        </button>
                      </div>
                    </div>
                  )}

                  {needsProof&&(
                    <div style={{padding:13,background:'white',border:'1px solid #ddd6fe'}}>
                      <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#7c3aed',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>Upload Delivery Proof</div>
                      <input type="url" placeholder="https://… proof link" value={proofUrl[bid]||''} onChange={e=>setProofUrl(p=>({...p,[bid]:e.target.value}))} style={inp}/>
                      <input placeholder="Notes (optional)" value={proofNotes[bid]||''} onChange={e=>setPN(p=>({...p,[bid]:e.target.value}))} style={{...inp,marginBottom:10}}/>
                      <button onClick={()=>submitProof(bid)} disabled={!!acting[bid]||!proofUrl[bid]} style={{padding:'8px 16px',background:'#4338ca',color:'white',border:'none',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer'}}>
                        {acting[bid]==='proof'?'Uploading…':'Submit Proof →'}
                      </button>
                    </div>
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
