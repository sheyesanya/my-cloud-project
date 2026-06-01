import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`}:{}; };
const fmt = n => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtD = d => { try{return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'});}catch{return d||'-';} };

const STATUS = {
  PENDING_PROVIDER_CONFIRMATION:{label:'Awaiting Provider',color:'#d97706',bg:'#fffbeb',border:'#fde68a'},
  PAYMENT_PENDING:              {label:'Invoice Sent',     color:'#4338ca',bg:'#eef2ff',border:'#c7d2fe'},
  PAID:                         {label:'Live',             color:'#0d9488',bg:'#f0fdfa',border:'#99f6e4'},
  IN_PROGRESS:                  {label:'In Progress',      color:'#7c3aed',bg:'#f5f3ff',border:'#ddd6fe'},
  PENDING_DELIVERY_REVIEW:      {label:'Proof Review',     color:'#d97706',bg:'#fffbeb',border:'#fde68a'},
  COMPLETED:                    {label:'Completed',        color:'#16a34a',bg:'#f0fdf4',border:'#bbf7d0'},
  REJECTED:                     {label:'Declined',         color:'#dc2626',bg:'#fef2f2',border:'#fecaca'},
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');

  useEffect(()=>{
    (async()=>{
      try { const hd=await h(); const r=await axios.get(`${API}/bookings`,{headers:hd}); setBookings(Array.isArray(r.data)?r.data:r.data?.bookings??[]); }
      catch(e){console.error(e);}
      finally{setLoading(false);}
    })();
  },[]);

  const FILTERS = [
    {key:'ALL',                           label:'All',          count:bookings.length},
    {key:'PENDING_PROVIDER_CONFIRMATION', label:'Awaiting',     count:bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length},
    {key:'PAID',                          label:'Live',         count:bookings.filter(b=>b.status==='PAID').length},
    {key:'PENDING_DELIVERY_REVIEW',       label:'Proof Review', count:bookings.filter(b=>b.status==='PENDING_DELIVERY_REVIEW').length},
    {key:'COMPLETED',                     label:'Completed',    count:bookings.filter(b=>b.status==='COMPLETED').length},
    {key:'REJECTED',                      label:'Declined',     count:bookings.filter(b=>b.status==='REJECTED').length},
  ];

  const filtered = bookings
    .filter(b=>filter==='ALL'||b.status===filter)
    .filter(b=>!search||b.brandName?.toLowerCase().includes(search.toLowerCase())||b.target?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const totalSpend = bookings.reduce((s,b)=>s+(b.finalPrice||0),0);

  const th = {fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',padding:'10px 14px',textAlign:'left',borderBottom:'1px solid #e1e4f0',fontWeight:500,whiteSpace:'nowrap'};
  const td = {padding:'11px 14px',fontFamily:'Inter,sans-serif',fontSize:12,color:'#131b2e',borderBottom:'1px solid #f2f3ff'};

  return (
    <Layout title="My Bookings" subtitle="All Bookings"
      actions={<Link to="/create-booking" style={{padding:'8px 16px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none'}}>+ New Campaign</Link>}>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:20}}>
        {[
          {label:'Total Spend', val:fmt(totalSpend),                                                        color:'#4338ca'},
          {label:'Live',        val:bookings.filter(b=>b.status==='PAID').length,                           color:'#0d9488'},
          {label:'Completed',   val:bookings.filter(b=>b.status==='COMPLETED').length,                      color:'#16a34a'},
          {label:'Needs Action',val:bookings.filter(b=>b.status==='PENDING_PROVIDER_CONFIRMATION').length,   color:'#d97706'},
        ].map(s=>(
          <div key={s.label} style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px',position:'relative',overflow:'hidden'}}>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',marginBottom:8}}>{s.label}</div>
            <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:22,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:s.color,opacity:0.3}}/>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',borderBottom:'1px solid #e1e4f0',marginBottom:16,overflowX:'auto'}}>
        {FILTERS.map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key)}
            style={{padding:'8px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap',color:filter===f.key?'#4338ca':'#464554',borderBottom:filter===f.key?'2px solid #4338ca':'2px solid transparent',marginBottom:-1}}>
            {f.label}{f.count>0&&<span style={{marginLeft:4,opacity:0.6}}>({f.count})</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{marginBottom:16}}>
        <input type="text" placeholder="Search bookings…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{padding:'8px 12px',border:'1px solid #e1e4f0',fontFamily:'Inter,sans-serif',fontSize:12,width:'100%',maxWidth:360,outline:'none',boxSizing:'border-box'}}/>
      </div>

      {loading&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>Loading…</div>}

      {!loading&&filtered.length===0&&(
        <div style={{textAlign:'center',padding:'48px',border:'1px dashed #e1e4f0'}}>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>No bookings found. <Link to="/create-booking" style={{color:'#4338ca'}}>Create your first →</Link></div>
        </div>
      )}

      {!loading&&filtered.length>0&&(
        <div style={{overflowX:'auto',background:'white',border:'1px solid #e1e4f0'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Brand','Media','Option','Market','Date','Runs','Value','Status'].map(c=><th key={c} style={th}>{c}</th>)}</tr></thead>
            <tbody>
              {filtered.map(b=>{
                const sm=STATUS[b.status]||{label:b.status,color:'#464554',bg:'#f2f3ff',border:'#e1e4f0'};
                return (
                  <tr key={b.bookingId} style={{transition:'background 0.1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#faf8ff'}
                    onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={{...td,fontWeight:600}}>{b.brandName||b.contactEmail||'-'}</td>
                    <td style={td}>{b.target||'-'}</td>
                    <td style={{...td,color:'#464554'}}>{(b.inventoryOption||'-').replaceAll('_',' ')}</td>
                    <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10}}>{(b.market||'-').replaceAll('_',' ')}</td>
                    <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10,whiteSpace:'nowrap'}}>{fmtD(b.date)}</td>
                    <td style={{...td,fontFamily:'IBM Plex Mono,monospace',fontSize:10}}>{b.runs||1}</td>
                    <td style={{...td,fontFamily:'Manrope,sans-serif',fontWeight:700,color:'#4338ca',whiteSpace:'nowrap'}}>{fmt(b.finalPrice)}</td>
                    <td style={td}><span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 8px',background:sm.bg,color:sm.color,border:`1px solid ${sm.border}`,letterSpacing:'0.06em',whiteSpace:'nowrap',textTransform:'uppercase'}}>{sm.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
