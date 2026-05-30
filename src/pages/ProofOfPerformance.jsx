import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' } : {};
};

const fmt     = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d||'—'; }};

const STATUS_META = {
  PAID:                    { label:'Running',         color:'#5eead4', bg:'rgba(94,234,212,0.08)'  },
  IN_PROGRESS:             { label:'In Progress',     color:'#d8b4fe', bg:'rgba(168,85,247,0.08)'  },
  PENDING_DELIVERY_REVIEW: { label:'Proof Submitted', color:'var(--amber)', bg:'var(--amber-dim)'   },
  COMPLETED:               { label:'Completed',       color:'#4ade80', bg:'rgba(74,222,128,0.08)'  },
};

const FILTERS = [
  {key:'ALL',                     label:'All'},
  {key:'PAID',                    label:'Running'},
  {key:'PENDING_DELIVERY_REVIEW', label:'Needs Review'},
  {key:'COMPLETED',               label:'Completed'},
];

export default function ProofOfPerformance() {
  const { user }                  = useAuth();
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [proofs, setProofs]       = useState([]);
  const [approving, setApproving] = useState(false);
  const [toast, setToast]         = useState(null);
  const [filter, setFilter]       = useState('ALL');
  const [analysis, setAnalysis]   = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [notes, setNotes]         = useState('');

  const role = (user?.role||'CLIENT').toUpperCase();
  const showToast = (type, msg) => { setToast({type,message:msg}); setTimeout(()=>setToast(null),3500); };

  useEffect(()=>{
    const load = async () => {
      const h = await authHeader();
      try {
        const r = await axios.get(`${API}/bookings`,{headers:h});
        const all = Array.isArray(r.data)?r.data:r.data?.bookings??[];
        setBookings(all.filter(b=>['PAID','IN_PROGRESS','PENDING_DELIVERY_REVIEW','COMPLETED'].includes(b.status)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
      } catch(e){ showToast('error',e.message); }
      finally{ setLoading(false); }
    };
    load();
  },[]);

  const selectBooking = async (booking) => {
    setSelected(booking); setProofs([]); setAnalysis(null); setNotes('');
    try {
      const h = await authHeader();
      const r = await axios.get(`${API}/bookings/${booking.bookingId}/proofs`,{headers:h});
      setProofs(Array.isArray(r.data)?r.data:r.data?.proofs??[]);
    } catch{ setProofs([]); }
  };

  const reviewProof = async (proofId, approved) => {
    setApproving(true);
    try {
      const h = await authHeader();
      await axios.post(`${API}/bookings/proof/review`,{bookingId:selected.bookingId,proofId,approved,notes},{headers:h});
      showToast('success',approved?'✅ Proof approved — campaign completed':'Proof sent back for revision');
      if (approved) setSelected(prev=>({...prev,status:'COMPLETED'}));
      setProofs(prev=>prev.map(p=>p.id===proofId?{...p,status:approved?'APPROVED':'REJECTED'}:p));
    } catch(e){ showToast('error',e.message); }
    finally{ setApproving(false); }
  };

  const analyseWithAI = async () => {
    if (!selected) return;
    setAnalysing(true); setAnalysis(null);
    try {
      const h = await authHeader();
      const prompt = `You are BrandCasta's campaign performance analyst. Analyse this campaign delivery.

Campaign Details:
- Media: ${selected.target}
- Category: ${(selected.category||'').replaceAll('_',' ')}
- Inventory: ${(selected.inventoryGroup||'').replaceAll('_',' ')} › ${(selected.inventoryOption||'').replaceAll('_',' ')}
- Market: ${(selected.market||'').replaceAll('_',' ')}
- Runs: ${selected.runs||1}
- Investment: ₦${Number(selected.finalPrice||0).toLocaleString()}
- Proofs submitted: ${proofs.length}
- Notes: ${notes||'None'}

Respond with JSON only (no markdown, no backticks): {"verdict":"APPROVED","score":85,"summary":"2-sentence summary","strengths":["..."],"concerns":[],"recommendation":"next step","estimatedReach":"estimated reach","roi":"ROI commentary"}`;
      const res = await axios.post(`${API}/ai/generate`,{prompt},{headers:h});
      const text = (res.data?.text||'').replace(/```json|```/g,'').trim();
      setAnalysis(JSON.parse(text));
    } catch{ showToast('error','AI analysis failed'); }
    finally{ setAnalysing(false); }
  };

  const filtered = filter==='ALL'?bookings:bookings.filter(b=>b.status===filter);
  const inp = { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', padding:'7px 0', fontSize:11, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none', marginBottom:8, borderRadius:0 };

  return (
    <>
      <PageTitle title="Proof of Performance"/>
      <Layout title="Proof of Performance" subtitle="Campaign Delivery">
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}
        {loading && <div style={{ display:'flex',gap:10,color:'var(--text3)',padding:'20px 0',alignItems:'center' }}><Spinner size={14}/>Loading…</div>}

        {!loading && (
          <div style={{ display:'grid',gridTemplateColumns:selected?'1fr 1.2fr':'1fr',gap:16 }}>

            {/* Left — booking list */}
            <div>
              <div style={{ display:'flex',gap:0,borderBottom:'1px solid var(--border)',marginBottom:14 }}>
                {FILTERS.map(f=>(
                  <button key={f.key} onClick={()=>setFilter(f.key)}
                    style={{ padding:'7px 12px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:9,letterSpacing:'0.08em',textTransform:'uppercase',
                      color:filter===f.key?'var(--amber)':'var(--text3)',
                      borderBottom:filter===f.key?'2px solid var(--amber)':'2px solid transparent',
                      marginBottom:-1,transition:'all 0.15s' }}>
                    {f.label}
                  </button>
                ))}
              </div>

              {filtered.length===0 && <div style={{ textAlign:'center',padding:'40px',border:'1px dashed var(--border)',fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.1em' }}>No campaigns here</div>}

              <div className="space-y-2">
                {filtered.map(b=>{
                  const sm = STATUS_META[b.status]||{label:b.status,color:'var(--text3)',bg:'rgba(255,255,255,0.04)'};
                  const isActive = selected?.bookingId===b.bookingId;
                  return(
                    <div key={b.bookingId} onClick={()=>selectBooking(b)}
                      style={{ padding:'11px 14px',cursor:'pointer',transition:'all 0.15s',
                        background:isActive?'var(--amber-dim)':'var(--bg2)',
                        border:`1px solid ${isActive?'var(--amber-border)':'var(--border)'}`,
                        borderLeft:`2px solid ${isActive?'var(--amber)':'transparent'}`,
                      }}>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3 }}>
                        <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:500,fontSize:12,color:'var(--text)' }}>{b.target||'—'}</p>
                        <span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'1px 7px',background:sm.bg,color:sm.color,letterSpacing:'0.06em' }}>{sm.label}</span>
                      </div>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)' }}>{b.brandName||b.contactEmail} · {fmt(b.finalPrice)} · {fmtDate(b.date)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — proof details */}
            {selected && (
              <div className="space-y-3">

                {/* Campaign summary */}
                <div className="page-card" style={{ padding:'16px 18px' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:32,height:32,background:'var(--amber)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#0a0a0f',flexShrink:0,fontFamily:'Manrope,sans-serif' }}>
                      {(selected.target||'?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:'var(--text)' }}>{selected.target}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginTop:1 }}>{selected.brandName} · {fmt(selected.finalPrice)} · {fmtDate(selected.date)}</p>
                    </div>
                  </div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                    {[['Inventory',(selected.inventoryOption||'—').replaceAll('_',' ')],['Market',(selected.market||'—').replaceAll('_',' ')],['Runs',selected.runs||1],['Provider Payout',fmt(selected.mediaPayout)]].map(([l,v])=>(
                      <div key={l} style={{ padding:'7px 10px',background:'var(--bg3)',border:'1px solid var(--border2)' }}>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2 }}>{l}</p>
                        <p style={{ fontSize:11,fontWeight:500,color:'var(--text)' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proofs */}
                <div className="page-card" style={{ padding:'16px 18px' }}>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12 }}>
                    Delivery Proofs{proofs.length>0&&<span style={{ marginLeft:6,opacity:0.6 }}>({proofs.length})</span>}
                  </div>
                  {proofs.length===0&&<p style={{ fontSize:11,color:'var(--text3)' }}>No proofs submitted yet.</p>}
                  {proofs.map(proof=>(
                    <div key={proof.id||proof.fileUrl} style={{ marginBottom:10,padding:'12px',background:'rgba(255,255,255,0.025)',border:'1px solid var(--border)' }}>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6 }}>
                        <p style={{ fontSize:12,fontWeight:500,color:'var(--text)' }}>{proof.name||'Proof file'}</p>
                        <span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',letterSpacing:'0.06em',
                          background:proof.status==='APPROVED'?'rgba(74,222,128,0.08)':proof.status==='REJECTED'?'rgba(239,68,68,0.08)':'var(--amber-dim)',
                          color:proof.status==='APPROVED'?'#4ade80':proof.status==='REJECTED'?'#fca5a5':'var(--amber)' }}>
                          {proof.status||'PENDING'}
                        </span>
                      </div>
                      {proof.fileUrl&&<a href={proof.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--amber)',display:'block',marginBottom:6,wordBreak:'break-all' }}>{proof.fileUrl}</a>}
                      {proof.notes&&<p style={{ fontSize:11,color:'var(--text3)',fontStyle:'italic' }}>{proof.notes}</p>}
                      {(!proof.status||proof.status==='PENDING')&&(
                        <div style={{ marginTop:8 }}>
                          <input type="text" placeholder="Notes for rejection (optional)" value={notes} onChange={e=>setNotes(e.target.value)} style={{ ...inp,marginBottom:8 }}/>
                          <div style={{ display:'flex',gap:7 }}>
                            <button onClick={()=>reviewProof(proof.id,true)} disabled={approving}
                              style={{ flex:1,padding:'6px',background:'#4ade80',color:'#0a0a0f',border:'none',fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4 }}>
                              {approving?<Spinner size={10}/>:'✓ Approve'}
                            </button>
                            <button onClick={()=>reviewProof(proof.id,false)} disabled={approving}
                              style={{ flex:1,padding:'6px',background:'rgba(239,68,68,0.08)',color:'#fca5a5',border:'1px solid rgba(239,68,68,0.25)',fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:11,cursor:'pointer' }}>
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Analysis */}
                {['CLIENT','ADMIN'].includes(role) && (
                  <div className="page-card" style={{ padding:'16px 18px' }}>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:analysis?14:0 }}>
                      <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',letterSpacing:'0.14em',textTransform:'uppercase' }}>✧ AI Performance Analysis</div>
                      <button onClick={analyseWithAI} disabled={analysing} className="btn-secondary" style={{ fontSize:9,padding:'4px 10px' }}>
                        {analysing?<><Spinner size={10}/>Analysing…</>:'Run Analysis'}
                      </button>
                    </div>
                    {analysis && (
                      <div>
                        <div style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',marginBottom:12,
                          background:analysis.verdict==='APPROVED'?'rgba(74,222,128,0.06)':analysis.verdict==='DISPUTED'?'rgba(239,68,68,0.06)':'var(--amber-dim)',
                          borderLeft:`2px solid ${analysis.verdict==='APPROVED'?'#4ade80':analysis.verdict==='DISPUTED'?'#fca5a5':'var(--amber)'}` }}>
                          <div style={{ textAlign:'center',flexShrink:0 }}>
                            <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:28,color:analysis.verdict==='APPROVED'?'#4ade80':analysis.verdict==='DISPUTED'?'#fca5a5':'var(--amber)',lineHeight:1 }}>{analysis.score}</p>
                            <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'var(--text3)' }}>SCORE</p>
                          </div>
                          <div>
                            <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,fontWeight:600,color:'var(--text)',marginBottom:3,letterSpacing:'0.06em',textTransform:'uppercase' }}>{analysis.verdict}</p>
                            <p style={{ fontSize:11,color:'var(--text2)',lineHeight:1.6 }}>{analysis.summary}</p>
                          </div>
                        </div>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10 }}>
                          {analysis.strengths?.length>0&&(
                            <div style={{ padding:'10px 12px',background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.15)' }}>
                              <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#4ade80',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 }}>Strengths</p>
                              {analysis.strengths.map(s=><p key={s} style={{ fontSize:10,color:'var(--text2)',marginBottom:3 }}>✓ {s}</p>)}
                            </div>
                          )}
                          {analysis.concerns?.length>0&&(
                            <div style={{ padding:'10px 12px',background:'rgba(239,68,68,0.04)',border:'1px solid rgba(239,68,68,0.15)' }}>
                              <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#fca5a5',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 }}>Concerns</p>
                              {analysis.concerns.map(c=><p key={c} style={{ fontSize:10,color:'var(--text2)',marginBottom:3 }}>⚠ {c}</p>)}
                            </div>
                          )}
                        </div>
                        <div style={{ padding:'10px 12px',background:'var(--amber-dim)',borderLeft:'2px solid var(--amber)' }}>
                          <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'var(--amber)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>Recommendation</p>
                          <p style={{ fontSize:11,color:'var(--text2)',lineHeight:1.6 }}>{analysis.recommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Layout>
    </>
  );
}