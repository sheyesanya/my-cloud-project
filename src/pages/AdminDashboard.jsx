import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`,'Content-Type':'application/json'}:{}; };
const fmt = n => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtD = d => { try{return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'});}catch{return d||'-';} };

const th = {fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid #e1e4f0',fontWeight:500,whiteSpace:'nowrap'};
const td = {padding:'10px 14px',fontFamily:'Inter,sans-serif',fontSize:12,color:'#131b2e',borderBottom:'1px solid #f2f3ff'};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [media, setMedia]       = useState([]);
  const [providers, setProviders] = useState([]);
  const [subs, setSubs]         = useState([]);
  const [payouts, setPayouts]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('overview');
  const [releasing, setReleasing] = useState({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const hd = await h();
      const [bR,mR,pR] = await Promise.all([
        axios.get(`${API}/bookings`,{headers:hd}),
        axios.get(`${API}/media`,{headers:hd}),
        axios.get(`${API}/providers`,{headers:hd}),
      ]);
      setBookings(Array.isArray(bR.data)?bR.data:bR.data?.bookings??[]);
      setMedia(Array.isArray(mR.data)?mR.data:mR.data?.media??[]);
      setProviders(Array.isArray(pR.data)?pR.data:pR.data?.providers??[]);
      try { const sR=await axios.get(`${API}/subscription/all`,{headers:hd}); setSubs(Array.isArray(sR.data)?sR.data:[]); } catch{setSubs([]);}
      try { const pyR=await axios.get(`${API}/admin/payouts`,{headers:hd}); setPayouts(Array.isArray(pyR.data)?pyR.data:[]); } catch{setPayouts([]);}
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(()=>{loadAll();},[]);

  const releasePayout = async (bookingId, providerName) => {
    if(!window.confirm(`Release payout for ${providerName}?`))return;
    setReleasing(r=>({...r,[bookingId]:true}));
    try { const hd=await h(); await axios.post(`${API}/admin/payouts/release`,{bookingId},{headers:hd}); await loadAll(); }
    catch(e){console.error(e);}
    finally{setReleasing(r=>{const n={...r};delete n[bookingId];return n;});}
  };

  const totalRevenue    = bookings.reduce((s,b)=>s+(Number(b.finalPrice)||0),0);
  const totalCommission = bookings.reduce((s,b)=>s+(Number(b.platformCommission)||Number(b.finalPrice||0)*0.15),0);
  const activeSubs      = subs.filter(s=>s.status==='ACTIVE').length;
  const pendingApps     = providers.filter(p=>(p.status||'').toUpperCase().includes('PENDING')).length;

  const TABS = [
    {key:'overview',      label:'Overview'},
    {key:'bookings',      label:`Bookings (${bookings.length})`},
    {key:'providers',     label:`Providers (${providers.length})`},
    {key:'subscriptions', label:`Subs (${activeSubs})`},
    {key:'media',         label:`Media (${media.length})`},
    {key:'payouts',       label:`Payouts (${payouts.length})`},
  ];

  return (
    <Layout title="Admin Dashboard" subtitle="Platform Operations"
      actions={
        <div style={{display:'flex',gap:8}}>
          <button onClick={loadAll} style={{padding:'7px 12px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',background:'transparent',cursor:'pointer'}}>↻</button>
        </div>
      }>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'1px solid #e1e4f0',marginBottom:20,overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:'8px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap',color:tab===t.key?'#4338ca':'#464554',borderBottom:tab===t.key?'2px solid #4338ca':'2px solid transparent',marginBottom:-1}}>
            {t.label}
          </button>
        ))}
      </div>

      {loading&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>Loading…</div>}

      {!loading&&tab==='overview'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24}}>
            {[{label:'Total GMV',val:fmt(totalRevenue),color:'#4338ca'},{label:'Commission',val:fmt(totalCommission),color:'#d97706'},{label:'Active Subs',val:activeSubs,color:'#0d9488'},{label:'Pending Apps',val:pendingApps,color:'#d97706'},{label:'Media Orgs',val:media.length,color:'#7c3aed'}].map(s=>(
              <div key={s.label} style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px',position:'relative',overflow:'hidden'}}>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',marginBottom:8}}>{s.label}</div>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:22,color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:s.color,opacity:0.3}}/>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,color:'#131b2e'}}>Recent Bookings</div>
                <Link to="#" onClick={()=>setTab('bookings')} style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.08em'}}>View all →</Link>
              </div>
              {[...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(b=>(
                <div key={b.bookingId} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f2f3ff'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:'#131b2e'}}>{b.brandName||b.contactEmail}</div>
                    <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>{b.target} · {fmtD(b.createdAt)}</div>
                  </div>
                  <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:12,color:'#4338ca'}}>{fmt(b.finalPrice)}</div>
                </div>
              ))}
            </div>
            <div style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,color:'#131b2e'}}>Pending Applications</div>
                <Link to="/applications" style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.08em'}}>Manage →</Link>
              </div>
              {providers.filter(p=>(p.status||'').toUpperCase().includes('PENDING')).slice(0,5).map(p=>(
                <div key={p.applicationId||p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f2f3ff'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:'#131b2e'}}>{p.orgName||'-'}</div>
                    <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>{p.contactEmail} · {fmtD(p.createdAt)}</div>
                  </div>
                  <Link to="/applications" style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'3px 8px',background:'#eef2ff',color:'#4338ca',border:'1px solid #c7d2fe',textDecoration:'none',letterSpacing:'0.06em'}}>Review</Link>
                </div>
              ))}
              {!providers.filter(p=>(p.status||'').toUpperCase().includes('PENDING')).length&&<p style={{fontSize:11,color:'#777586'}}>No pending applications</p>}
            </div>
          </div>
        </div>
      )}

      {!loading&&tab==='bookings'&&(
        <div style={{overflowX:'auto',background:'white',border:'1px solid #e1e4f0'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Brand','Media','Market','Date','Value','Commission','Status'].map(c=><th key={c} style={th}>{c}</th>)}</tr></thead>
            <tbody>
              {[...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(b=>(
                <tr key={b.bookingId} onMouseEnter={e=>e.currentTarget.style.background='#faf8ff'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{...td,fontWeight:600}}>{b.brandName||b.contactEmail}</td>
                  <td style={td}>{b.target||'-'}</td>
                  <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10}}>{(b.market||'-').replaceAll('_',' ')}</td>
                  <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap'}}>{fmtD(b.date)}</td>
                  <td style={{...td,fontFamily:'Manrope,sans-serif',fontWeight:700,color:'#4338ca'}}>{fmt(b.finalPrice)}</td>
                  <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#d97706'}}>{fmt(b.platformCommission||b.finalPrice*0.15)}</td>
                  <td style={td}><span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',background:'#f2f3ff',color:'#464554',letterSpacing:'0.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{(b.status||'').replaceAll('_',' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading&&tab==='providers'&&(
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <Link to="/applications" style={{padding:'8px 16px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none'}}>Manage Applications →</Link>
          </div>
          <div style={{overflowX:'auto',background:'white',border:'1px solid #e1e4f0'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Organisation','Category','Contact','Applied','Status'].map(c=><th key={c} style={th}>{c}</th>)}</tr></thead>
              <tbody>
                {[...providers].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(p=>(
                  <tr key={p.applicationId||p.id} onMouseEnter={e=>e.currentTarget.style.background='#faf8ff'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={{...td,fontWeight:600}}>{p.orgName||'-'}</td>
                    <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10}}>{(p.category||'-').replaceAll('_',' ')}</td>
                    <td style={td}>{p.contactEmail||'-'}</td>
                    <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap'}}>{fmtD(p.createdAt)}</td>
                    <td style={td}><span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',letterSpacing:'0.06em',background:p.status==='APPROVED'?'#f0fdf4':p.status==='REJECTED'?'#fef2f2':'#fffbeb',color:p.status==='APPROVED'?'#16a34a':p.status==='REJECTED'?'#dc2626':'#d97706'}}>{p.status||'PENDING'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading&&tab==='subscriptions'&&(
        subs.length===0?<p style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>No subscription data yet.</p>:(
          <div style={{overflowX:'auto',background:'white',border:'1px solid #e1e4f0'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['User','Plan','Amount','Activated','Expires','Status'].map(c=><th key={c} style={th}>{c}</th>)}</tr></thead>
              <tbody>
                {subs.map((s,i)=>(
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#faf8ff'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={td}>{s.userId||'-'}</td>
                    <td style={td}><span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 7px',background:s.tier==='PRO'?'#f0fdfa':'#eef2ff',color:s.tier==='PRO'?'#0d9488':'#4338ca',letterSpacing:'0.06em'}}>{s.tier}</span></td>
                    <td style={{...td,fontFamily:'Manrope,sans-serif',fontWeight:600,color:'#4338ca'}}>{fmt(s.amount)}</td>
                    <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap'}}>{fmtD(s.activatedAt)}</td>
                    <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap'}}>{fmtD(s.expiresAt)}</td>
                    <td style={td}><span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',background:s.status==='ACTIVE'?'#f0fdf4':'#fef2f2',color:s.status==='ACTIVE'?'#16a34a':'#dc2626',letterSpacing:'0.06em'}}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!loading&&tab==='media'&&(
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:12}}>
            <Link to="/create-media" style={{padding:'8px 16px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none'}}>+ Add Media</Link>
          </div>
          <div style={{overflowX:'auto',background:'white',border:'1px solid #e1e4f0'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Name','Category','Contact','Inventory'].map(c=><th key={c} style={th}>{c}</th>)}</tr></thead>
              <tbody>
                {[...media].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(m=>{
                  const inv=typeof m.inventory==='string'?JSON.parse(m.inventory||'{}'):(m.inventory||{});
                  return (
                    <tr key={m.mediaId} onMouseEnter={e=>e.currentTarget.style.background='#faf8ff'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                      <td style={{...td,fontWeight:600}}>{m.name}</td>
                      <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10}}>{(m.category||'-').replaceAll('_',' ')}</td>
                      <td style={td}>{m.contactEmail||'-'}</td>
                      <td style={td}><span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',background:Object.keys(inv).length>0?'#f0fdf4':'#fffbeb',color:Object.keys(inv).length>0?'#16a34a':'#d97706',letterSpacing:'0.06em'}}>{Object.keys(inv).length>0?`${Object.keys(inv).length} groups`:'No inventory'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading&&tab==='payouts'&&(
        payouts.length===0?<p style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>No completed campaigns yet.</p>:
        payouts.map((provider,pi)=>(
          <div key={pi} style={{marginBottom:12,border:'1px solid #e1e4f0',background:'white'}}>
            <div style={{padding:'12px 16px',background:'#faf8ff',borderBottom:'1px solid #e1e4f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600,fontSize:12,color:'#131b2e'}}>{provider.providerName}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>{provider.providerEmail}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:14,color:'#16a34a'}}>{fmt(provider.totalPayout)}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#d97706',marginTop:1}}>{fmt(provider.pendingPayout)} pending</div>
              </div>
            </div>
            {provider.bookings.map(b=>(
              <div key={b.bookingId} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid #f2f3ff'}}>
                <div>
                  <div style={{fontSize:11,fontWeight:500,color:'#131b2e'}}>{b.brandName||b.contactEmail}</div>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>{b.target} · {fmtD(b.date)}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div>
                    <div style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:12,color:'#16a34a'}}>{fmt(b.mediaPayout)}</div>
                    <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'1px 6px',background:b.payoutStatus==='RELEASED'?'#f0fdf4':'#fffbeb',color:b.payoutStatus==='RELEASED'?'#16a34a':'#d97706',letterSpacing:'0.06em'}}>{b.payoutStatus==='RELEASED'?'Released':'Pending'}</span>
                  </div>
                  {b.payoutStatus!=='RELEASED'&&(
                    <button onClick={()=>releasePayout(b.bookingId,provider.providerName)} disabled={!!releasing[b.bookingId]}
                      style={{padding:'5px 12px',background:'#16a34a',color:'white',border:'none',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer'}}>
                      {releasing[b.bookingId]?'…':'Release'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </Layout>
  );
}
