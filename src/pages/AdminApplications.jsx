import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`,'Content-Type':'application/json'}:{}; };
const fmtD = d => { try{return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'});}catch{return d||'-';} };

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [acting, setActing]             = useState({});
  const [expanded, setExpanded]         = useState(null);
  const [filter, setFilter]             = useState('PENDING_REVIEW');

  const fetchApplications = async () => {
    setLoading(true);
    try { const hd=await h(); const r=await axios.get(`${API}/providers`,{headers:hd}); setApplications(Array.isArray(r.data)?r.data:r.data?.providers??[]); }
    catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(()=>{fetchApplications();},[]);

  const act = async (applicationId, status) => {
    setActing(a=>({...a,[applicationId]:status}));
    try {
      const hd=await h();
      await axios.patch(`${API}/providers/${applicationId}`,{status},{headers:hd});
      setApplications(apps=>apps.map(a=>a.applicationId===applicationId?{...a,status}:a));
    } catch(e){console.error(e);}
    finally{setActing(a=>{const n={...a};delete n[applicationId];return n;});}
  };

  const FILTERS = [
    {key:'PENDING_REVIEW',label:'Pending',  count:applications.filter(a=>(a.status||'').toUpperCase()==='PENDING_REVIEW').length},
    {key:'APPROVED',      label:'Approved', count:applications.filter(a=>(a.status||'').toUpperCase()==='APPROVED').length},
    {key:'REJECTED',      label:'Rejected', count:applications.filter(a=>(a.status||'').toUpperCase()==='REJECTED').length},
    {key:'ALL',           label:'All',      count:applications.length},
  ];

  const filtered = filter==='ALL'?applications:applications.filter(a=>(a.status||'').toUpperCase()===filter);

  return (
    <Layout title="Provider Applications" subtitle="Applications"
      actions={<button onClick={fetchApplications} style={{padding:'7px 12px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',background:'transparent',cursor:'pointer'}}>↻ Refresh</button>}>

      <div style={{display:'flex',borderBottom:'1px solid #e1e4f0',marginBottom:20}}>
        {FILTERS.map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key)} style={{padding:'8px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',color:filter===f.key?'#4338ca':'#464554',borderBottom:filter===f.key?'2px solid #4338ca':'2px solid transparent',marginBottom:-1}}>
            {f.label}<span style={{marginLeft:4,opacity:0.6}}>({f.count})</span>
          </button>
        ))}
      </div>

      {loading&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>Loading…</div>}
      {!loading&&filtered.length===0&&<div style={{textAlign:'center',padding:'48px',border:'1px dashed #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586',textTransform:'uppercase'}}>No applications in this category</div>}

      <div style={{display:'flex',flexDirection:'column',gap:4}}>
        {filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(app=>{
          const aid   = app.applicationId||app.id;
          const status= (app.status||'PENDING_REVIEW').toUpperCase();
          const isOpen= expanded===aid;
          const isPending  = status==='PENDING_REVIEW'||status==='PENDING';
          const isApproved = status==='APPROVED';

          const statusColor = isPending?'#d97706':isApproved?'#16a34a':'#dc2626';
          const statusBg    = isPending?'#fffbeb':isApproved?'#f0fdf4':'#fef2f2';
          const statusLabel = isPending?'Pending Review':isApproved?'Approved':'Rejected';

          return (
            <div key={aid} style={{border:`1px solid ${isOpen?'#c7d2fe':'#e1e4f0'}`,borderLeft:`2px solid ${isPending?'#d97706':'transparent'}`,overflow:'hidden',background:'white',transition:'border-color 0.15s'}}>
              <div onClick={()=>setExpanded(isOpen?null:aid)}
                style={{padding:'12px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'background 0.1s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#faf8ff'}
                onMouseLeave={e=>e.currentTarget.style.background='white'}>
                <div style={{width:32,height:32,background:statusBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:statusColor,flexShrink:0,border:`1px solid ${statusColor}25`}}>
                  {(app.orgName||'?')[0].toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                    <span style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:'#131b2e'}}>{app.orgName||'-'}</span>
                    <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'1px 7px',background:statusBg,color:statusColor,letterSpacing:'0.06em',textTransform:'uppercase'}}>{statusLabel}</span>
                  </div>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586'}}>{(app.category||'').replaceAll('_',' ')} · {app.contactEmail} · Applied {fmtD(app.createdAt||app.appliedAt)}</div>
                </div>
                <span style={{fontSize:10,color:'#777586',transform:isOpen?'rotate(180deg)':'none',display:'inline-block',transition:'transform 0.2s'}}>⌄</span>
              </div>

              {isOpen&&(
                <div style={{borderTop:'1px solid #e1e4f0',padding:'14px 16px',background:'#faf8ff'}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8,marginBottom:14}}>
                    {[['Contact Name',app.contactName],['Contact Email',app.contactEmail],['Phone',app.contactPhone],['Role',app.contactRole||'-'],['Category',(app.category||'-').replaceAll('_',' ')],['Website',app.website||'-'],['Markets',(app.markets||[]).join(', ')||'-'],['Monthly Reach',app.monthlyReach||'-']].map(([l,v])=>(
                      <div key={l} style={{padding:'7px 10px',background:'white',border:'1px solid #e1e4f0'}}>
                        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#777586',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}}>{l}</div>
                        <div style={{fontSize:11,color:'#131b2e',wordBreak:'break-word'}}>{v||'-'}</div>
                      </div>
                    ))}
                  </div>
                  {app.description&&(
                    <div style={{padding:'10px 12px',background:'#fffbeb',borderLeft:'2px solid #d97706',marginBottom:14}}>
                      <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>Description</div>
                      <p style={{fontSize:12,color:'#464554',lineHeight:1.7}}>{app.description}</p>
                    </div>
                  )}
                  <div style={{display:'flex',gap:8}}>
                    {isPending&&(
                      <>
                        <button onClick={()=>act(aid,'APPROVED')} disabled={!!acting[aid]} style={{padding:'7px 16px',background:'#16a34a',color:'white',border:'none',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                          {acting[aid]==='APPROVED'?'…':'✓ Approve'}
                        </button>
                        <button onClick={()=>act(aid,'REJECTED')} disabled={!!acting[aid]} style={{padding:'7px 16px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',fontFamily:'IBM Plex Mono,monospace',fontWeight:600,fontSize:11,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer'}}>
                          {acting[aid]==='REJECTED'?'…':'✕ Reject'}
                        </button>
                      </>
                    )}
                    {isApproved&&(
                      <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#16a34a',padding:'7px 0'}}>✓ Approved — provider has access</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
