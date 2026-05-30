import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import api from '../services/api';

const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d||'—'; }};

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.05 } } };
const fadeUp  = { hidden:{ opacity:0, y:8 }, show:{ opacity:1, y:0, transition:{ duration:0.35, ease:[0.22,1,0.36,1] } } };

export default function AdminApplications() {
  const navigate                        = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState(null);
  const [acting, setActing]             = useState({});
  const [expanded, setExpanded]         = useState(null);
  const [filter, setFilter]             = useState('PENDING_REVIEW');

  const showToast = (type, msg) => { setToast({type,message:msg}); setTimeout(()=>setToast(null),3500); };

  const fetchApplications = async () => {
    setLoading(true);
    try { const r = await api.get('/providers'); setApplications(Array.isArray(r)?r:r.providers??r.data??[]); }
    catch(e){ showToast('error',e.message); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchApplications(); },[]);

  const act = async (applicationId, status) => {
    setActing(a=>({...a,[applicationId]:status}));
    try {
      await api.patch(`/providers/${applicationId}`,{status});
      setApplications(apps=>apps.map(a=>a.applicationId===applicationId?{...a,status}:a));
      showToast('success',`Application ${status==='APPROVED'?'approved':'rejected'}`);
    } catch(e){ showToast('error',e.message); }
    finally{ setActing(a=>{const n={...a};delete n[applicationId];return n;}); }
  };

  const deleteProvider = async (applicationId, orgName) => {
    if (!window.confirm(`Permanently delete "${orgName}"? This removes their account, media listing and revokes provider access.`)) return;
    setActing(a=>({...a,[applicationId]:'DELETE'}));
    try {
      await api.delete(`/providers/${applicationId}`);
      setApplications(apps=>apps.filter(a=>a.applicationId!==applicationId));
      showToast('success',`${orgName} removed`);
    } catch(e){ showToast('error',e.message); }
    finally{ setActing(a=>{const n={...a};delete n[applicationId];return n;}); }
  };

  const FILTERS = [
    {key:'PENDING_REVIEW',label:'Pending',  color:'var(--amber)', count:applications.filter(a=>(a.status||'').toUpperCase()==='PENDING_REVIEW').length},
    {key:'APPROVED',      label:'Approved', color:'#4ade80',       count:applications.filter(a=>(a.status||'').toUpperCase()==='APPROVED').length},
    {key:'REJECTED',      label:'Rejected', color:'#fca5a5',       count:applications.filter(a=>(a.status||'').toUpperCase()==='REJECTED').length},
    {key:'ALL',           label:'All',      color:'var(--text2)',   count:applications.length},
  ];

  const filtered = filter==='ALL'?applications:applications.filter(a=>(a.status||'').toUpperCase()===filter);

  return (
    <>
      <PageTitle title="Provider Applications"/>
      <Layout title="Provider Applications" subtitle="Applications"
        actions={<button onClick={fetchApplications} className="btn-secondary" style={{ fontSize:10 }}>↻ Refresh</button>}
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Filter tabs */}
        <div style={{ display:'flex',gap:0,borderBottom:'1px solid var(--border)',marginBottom:20 }}>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)}
              style={{ padding:'8px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',
                color:filter===f.key?f.color:'var(--text3)',
                borderBottom:filter===f.key?`2px solid ${f.color}`:'2px solid transparent',
                marginBottom:-1,transition:'all 0.15s' }}>
              {f.label}<span style={{ marginLeft:5,opacity:0.6 }}>({f.count})</span>
            </button>
          ))}
        </div>

        {loading && <div style={{ display:'flex',gap:10,color:'var(--text3)',padding:'20px 0',alignItems:'center' }}><Spinner size={14}/>Loading…</div>}
        {!loading&&filtered.length===0&&<div style={{ textAlign:'center',padding:'48px',border:'1px dashed var(--border)',fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--text3)',letterSpacing:'0.1em',textTransform:'uppercase' }}>No applications in this category</div>}

        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
          {filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(app=>{
            const aid    = app.applicationId||app.id;
            const status = (app.status||'PENDING_REVIEW').toUpperCase();
            const isOpen = expanded===aid;
            const isPending  = status==='PENDING_REVIEW';
            const isApproved = status==='APPROVED';
            const isRejected = status==='REJECTED';

            const statusColor = isPending?'var(--amber)':isApproved?'#4ade80':'#fca5a5';
            const statusLabel = isPending?'Pending Review':isApproved?'Approved':'Rejected';
            const statusBg    = isPending?'var(--amber-dim)':isApproved?'rgba(74,222,128,0.08)':'rgba(239,68,68,0.08)';

            return (
              <motion.div key={aid} variants={fadeUp}
                style={{ border:'1px solid var(--border)',borderLeft:`2px solid ${isPending?'var(--amber)':'transparent'}`,overflow:'hidden' }}>

                {/* Header */}
                <div onClick={()=>setExpanded(isOpen?null:aid)}
                  style={{ padding:'12px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ width:32,height:32,background:isPending?'var(--amber-dim)':isApproved?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:statusColor,flexShrink:0,fontFamily:'Manrope,sans-serif',border:`1px solid ${statusColor}30` }}>
                    {(app.orgName||'?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:2 }}>
                      <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:'var(--text)' }}>{app.orgName||'—'}</p>
                      <span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'1px 7px',background:statusBg,color:statusColor,letterSpacing:'0.06em' }}>{statusLabel}</span>
                    </div>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)' }}>
                      {(app.category||'').replaceAll('_',' ')} · {app.contactEmail} · Applied {fmtDate(app.createdAt||app.appliedAt)}
                    </p>
                  </div>
                  <span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--text3)',flexShrink:0,transition:'transform 0.2s',display:'inline-block',transform:isOpen?'rotate(180deg)':'none' }}>⌄</span>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}
                      transition={{ duration:0.3,ease:[0.22,1,0.36,1] }}
                      style={{ overflow:'hidden',borderTop:'1px solid var(--border)' }}>
                      <div style={{ padding:'14px 16px' }}>
                        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8,marginBottom:14 }}>
                          {[['Contact Name',app.contactName],['Contact Email',app.contactEmail],['Phone',app.contactPhone],['Role',app.contactRole||'—'],['Category',(app.category||'—').replaceAll('_',' ')],['Website',app.website||'—'],['Founded',app.founded||'—'],['Markets',(app.markets||[]).join(', ')||'—'],['Monthly Reach',app.monthlyReach||'—'],['Bank',app.bankName||'—'],['Account Name',app.accountName||'—'],['Account No.',app.accountNumber||'—']].map(([label,value])=>(
                            <div key={label} style={{ padding:'8px 10px',background:'var(--bg3)',border:'1px solid var(--border2)' }}>
                              <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2 }}>{label}</p>
                              <p style={{ fontSize:11,color:'var(--text)',wordBreak:'break-word' }}>{value}</p>
                            </div>
                          ))}
                        </div>

                        {app.description && (
                          <div style={{ padding:'10px 12px',background:'var(--amber-dim)',borderLeft:'2px solid var(--amber)',marginBottom:14 }}>
                            <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4 }}>Description</p>
                            <p style={{ fontSize:12,color:'var(--text2)',lineHeight:1.7 }}>{app.description}</p>
                          </div>
                        )}

                        <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                          {isPending && (
                            <>
                              <button onClick={()=>act(aid,'APPROVED')} disabled={!!acting[aid]}
                                style={{ padding:'7px 16px',background:'#4ade80',color:'#0a0a0f',border:'none',fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:5,letterSpacing:'0.04em' }}>
                                {acting[aid]==='APPROVED'?<><Spinner size={10}/>…</>:'✓ Approve'}
                              </button>
                              <button onClick={()=>act(aid,'REJECTED')} disabled={!!acting[aid]}
                                style={{ padding:'7px 16px',background:'rgba(239,68,68,0.08)',color:'#fca5a5',border:'1px solid rgba(239,68,68,0.25)',fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
                                {acting[aid]==='REJECTED'?<><Spinner size={10}/>…</>:'✕ Reject'}
                              </button>
                            </>
                          )}
                          {isApproved && (
                            <>
                              <button onClick={()=>navigate(`/admin/inventory?name=${encodeURIComponent(app.orgName)}`)}
                                style={{ padding:'7px 16px',background:'var(--amber)',color:'#0a0a0f',border:'none',fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:11,cursor:'pointer',letterSpacing:'0.04em' }}>
                                Set Up Inventory →
                              </button>
                              <button onClick={()=>deleteProvider(aid,app.orgName)} disabled={!!acting[aid]}
                                style={{ padding:'7px 16px',background:'rgba(239,68,68,0.08)',color:'#fca5a5',border:'1px solid rgba(239,68,68,0.25)',fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
                                {acting[aid]==='DELETE'?<><Spinner size={10}/>…</>:'Delete Provider'}
                              </button>
                            </>
                          )}
                          {isRejected && (
                            <button onClick={()=>deleteProvider(aid,app.orgName)} disabled={!!acting[aid]}
                              style={{ padding:'7px 16px',background:'rgba(239,68,68,0.08)',color:'#fca5a5',border:'1px solid rgba(239,68,68,0.25)',fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
                              {acting[aid]==='DELETE'?<><Spinner size={10}/>…</>:'Delete Application'}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </Layout>
    </>
  );
}