import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import api from '../services/api';

const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d||'—'; }};

export default function AdminApplications() {
  const navigate                      = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [acting, setActing]           = useState({});
  const [expanded, setExpanded]       = useState(null);
  const [filter, setFilter]           = useState('PENDING_REVIEW');

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
      await api.patch(`/providers/${applicationId}`, {status});
      setApplications(apps=>apps.map(a=>a.applicationId===applicationId?{...a,status}:a));
      showToast('success', `Application ${status==='APPROVED'?'approved':'rejected'}`);
    } catch(e){ showToast('error',e.message); }
    finally{ setActing(a=>{const n={...a};delete n[applicationId];return n;}); }
  };

  const deleteProvider = async (applicationId, orgName) => {
    if(!window.confirm(`Permanently delete "${orgName}"? This removes their account, media listing and revokes provider access.`)) return;
    setActing(a=>({...a,[applicationId]:'DELETE'}));
    try {
      await api.delete(`/providers/${applicationId}`);
      setApplications(apps=>apps.filter(a=>a.applicationId!==applicationId));
      showToast('success',`${orgName} removed`);
    } catch(e){ showToast('error',e.message); }
    finally{ setActing(a=>{const n={...a};delete n[applicationId];return n;}); }
  };

  const FILTERS = [
    { key:'PENDING_REVIEW', label:'Pending',  color:'#fcd34d', count: applications.filter(a=>(a.status||'').toUpperCase()==='PENDING_REVIEW').length },
    { key:'APPROVED',       label:'Approved', color:'#86efac', count: applications.filter(a=>(a.status||'').toUpperCase()==='APPROVED').length },
    { key:'REJECTED',       label:'Rejected', color:'#fca5a5', count: applications.filter(a=>(a.status||'').toUpperCase()==='REJECTED').length },
    { key:'ALL',            label:'All',      color:'var(--accent-light)', count: applications.length },
  ];

  const filtered = filter==='ALL'?applications:applications.filter(a=>(a.status||'').toUpperCase()===filter);

  return (
    <>
      <PageTitle title="Provider Applications" description="Review and manage provider applications."/>
      <Layout title="Provider Applications" subtitle="Review, approve and manage media provider applications"
        actions={<button onClick={fetchApplications} className="btn-secondary" style={{ fontSize:12 }}>↻ Refresh</button>}
      >
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)}
              style={{ padding:'5px 14px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                background:filter===f.key?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)',
                color:filter===f.key?f.color:'var(--text-muted)',
                outline:filter===f.key?`0.5px solid ${f.color}44`:'0.5px solid var(--border)',
              }}>
              {f.label} <span style={{ opacity:0.65 }}>({f.count})</span>
            </button>
          ))}
        </div>

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text-muted)', padding:'20px 0' }}><Spinner size={14}/>Loading…</div>}

        {!loading && filtered.length===0 && (
          <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)', fontSize:13 }}>No applications in this category.</div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(app => {
            const aid    = app.applicationId||app.id;
            const status = (app.status||'PENDING_REVIEW').toUpperCase();
            const isOpen = expanded===aid;
            const isPending  = status==='PENDING_REVIEW';
            const isApproved = status==='APPROVED';
            const isRejected = status==='REJECTED';

            const statusMeta = isPending
              ? { color:'#fcd34d', bg:'rgba(245,158,11,0.1)', label:'Pending Review' }
              : isApproved
              ? { color:'#86efac', bg:'rgba(34,197,94,0.1)', label:'Approved' }
              : { color:'#fca5a5', bg:'rgba(239,68,68,0.1)', label:'Rejected' };

            return (
              <div key={aid} style={{ borderRadius:10, background:'var(--bg-card)', border:`0.5px solid ${isPending?'rgba(245,158,11,0.18)':'var(--border)'}`, overflow:'hidden' }}>

                {/* Header row */}
                <div onClick={()=>setExpanded(isOpen?null:aid)} style={{ padding:'13px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white', flexShrink:0 }}>
                    {(app.orgName||'?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
                      <p style={{ fontWeight:500, fontSize:13, color:'white' }}>{app.orgName||'—'}</p>
                      <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:statusMeta.bg, color:statusMeta.color, whiteSpace:'nowrap' }}>{statusMeta.label}</span>
                    </div>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                      {(app.category||'').replaceAll('_',' ')} · {app.contactEmail} · Applied {fmtDate(app.createdAt||app.appliedAt)}
                    </p>
                  </div>
                  <span style={{ color:'var(--text-muted)', fontSize:12, transform:isOpen?'rotate(180deg)':'none', display:'inline-block', transition:'0.2s' }}>⌄</span>
                </div>

                {/* Expanded details */}
                {isOpen&&(
                  <div style={{ padding:'0 16px 16px', borderTop:'0.5px solid var(--border)' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8, margin:'14px 0' }}>
                      {[
                        ['Contact Name', app.contactName],
                        ['Contact Email', app.contactEmail],
                        ['Phone', app.contactPhone],
                        ['Role', app.contactRole||'—'],
                        ['Category', (app.category||'—').replaceAll('_',' ')],
                        ['Website', app.website||'—'],
                        ['Founded', app.founded||'—'],
                        ['Markets', (app.markets||[]).join(', ')||'—'],
                        ['Monthly Reach', app.monthlyReach||'—'],
                        ['Bank', app.bankName||'—'],
                        ['Account Name', app.accountName||'—'],
                        ['Account No.', app.accountNumber||'—'],
                      ].map(([label,value])=>(
                        <div key={label} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.025)', border:'0.5px solid var(--border)' }}>
                          <p style={{ fontSize:9, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>{label}</p>
                          <p style={{ fontSize:11, color:'white', wordBreak:'break-word' }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {app.description&&(
                      <div style={{ padding:'10px 12px', borderRadius:8, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)', marginBottom:14 }}>
                        <p style={{ fontSize:9, fontWeight:600, color:'var(--accent-light)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Description</p>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>{app.description}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {isPending&&(
                        <>
                          <button onClick={()=>act(aid,'APPROVED')} disabled={!!acting[aid]}
                            style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', display:'flex', alignItems:'center', gap:5 }}>
                            {acting[aid]==='APPROVED'?<><Spinner size={11}/>…</>:'✓ Approve'}
                          </button>
                          <button onClick={()=>act(aid,'REJECTED')} disabled={!!acting[aid]}
                            style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'0.5px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', display:'flex', alignItems:'center', gap:5 }}>
                            {acting[aid]==='REJECTED'?<><Spinner size={11}/>…</>:'✕ Reject'}
                          </button>
                        </>
                      )}
                      {isApproved&&(
                        <>
                          <button onClick={()=>navigate(`/admin/inventory?name=${encodeURIComponent(app.orgName)}`)}
                            style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white' }}>
                            📦 Set Up Inventory
                          </button>
                          <button onClick={()=>deleteProvider(aid,app.orgName)} disabled={!!acting[aid]}
                            style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'0.5px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', display:'flex', alignItems:'center', gap:5 }}>
                            {acting[aid]==='DELETE'?<><Spinner size={11}/>…</>:'🗑 Delete Provider'}
                          </button>
                        </>
                      )}
                      {isRejected&&(
                        <button onClick={()=>deleteProvider(aid,app.orgName)} disabled={!!acting[aid]}
                          style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'0.5px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', display:'flex', alignItems:'center', gap:5 }}>
                          {acting[aid]==='DELETE'?<><Spinner size={11}/>…</>:'🗑 Delete Application'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Layout>
    </>
  );
}