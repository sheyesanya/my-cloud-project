import { useEffect, useState } from 'react';
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
      const headers = await authHeader();
      try {
        const r = await axios.get(`${API}/bookings`, {headers});
        const all = Array.isArray(r.data)?r.data:r.data?.bookings??[];
        const relevant = all.filter(b=>['PAID','IN_PROGRESS','PENDING_DELIVERY_REVIEW','COMPLETED'].includes(b.status));
        setBookings(relevant.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
      } catch(e){ showToast('error',e.message); }
      finally{ setLoading(false); }
    };
    load();
  },[]);

  const selectBooking = async (booking) => {
    setSelected(booking); setProofs([]); setAnalysis(null); setNotes('');
    try {
      const headers = await authHeader();
      const r = await axios.get(`${API}/bookings/${booking.bookingId}/proofs`, {headers});
      setProofs(Array.isArray(r.data)?r.data:r.data?.proofs??[]);
    } catch{ setProofs([]); }
  };

  const approveProof = async (proofId) => {
    setApproving(true);
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/proof/review`, {bookingId:selected.bookingId, proofId, approved:true}, {headers});
      showToast('success','✅ Proof approved — campaign completed');
      setSelected(prev=>({...prev, status:'COMPLETED'}));
      setProofs(prev=>prev.map(p=>p.id===proofId?{...p,status:'APPROVED'}:p));
    } catch(e){ showToast('error',e.message); }
    finally{ setApproving(false); }
  };

  const rejectProof = async (proofId) => {
    setApproving(true);
    try {
      const headers = await authHeader();
      await axios.post(`${API}/bookings/proof/review`, {bookingId:selected.bookingId, proofId, approved:false, notes}, {headers});
      showToast('success','Proof sent back for revision');
      setProofs(prev=>prev.map(p=>p.id===proofId?{...p,status:'REJECTED'}:p));
    } catch(e){ showToast('error',e.message); }
    finally{ setApproving(false); }
  };

  const analyseWithAI = async () => {
    if(!selected) return;
    setAnalysing(true); setAnalysis(null);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:1000,
          messages:[{ role:'user', content:`You are BrandCasta's campaign performance analyst. Analyse this campaign delivery.

Campaign Details:
- Media: ${selected.target}
- Category: ${(selected.category||'').replaceAll('_',' ')}
- Inventory: ${(selected.inventoryGroup||'').replaceAll('_',' ')} › ${(selected.inventoryOption||'').replaceAll('_',' ')}
- Market: ${(selected.market||'').replaceAll('_',' ')}
- Runs: ${selected.runs||1}
- Investment: ₦${Number(selected.finalPrice||0).toLocaleString()}
- Campaign Date: ${selected.date||'Not specified'}
- Proofs submitted: ${proofs.length}
- Provider notes: ${notes||'None'}

Respond with JSON only: {"verdict":"APPROVED"|"NEEDS_REVIEW"|"DISPUTED","score":85,"summary":"2-sentence summary","strengths":["..."],"concerns":[],"recommendation":"next step","estimatedReach":"estimated reach","roi":"ROI commentary"}` }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c=>c.text||'').join('').trim();
      setAnalysis(JSON.parse(text.replace(/```json|```/g,'').trim()));
    } catch{ showToast('error','AI analysis failed'); }
    finally{ setAnalysing(false); }
  };

  const STATUS_META = {
    PAID:                    { label:'Running',        color:'#5eead4', bg:'rgba(20,184,166,0.1)'  },
    IN_PROGRESS:             { label:'In Progress',    color:'#d8b4fe', bg:'rgba(168,85,247,0.1)'  },
    PENDING_DELIVERY_REVIEW: { label:'Proof Submitted',color:'#fcd34d', bg:'rgba(245,158,11,0.1)'  },
    COMPLETED:               { label:'Completed',      color:'#86efac', bg:'rgba(34,197,94,0.1)'   },
  };

  const FILTERS = [
    { key:'ALL',                     label:'All' },
    { key:'PAID',                    label:'Running' },
    { key:'PENDING_DELIVERY_REVIEW', label:'Needs Review' },
    { key:'COMPLETED',               label:'Completed' },
  ];

  const filtered = filter==='ALL'?bookings:bookings.filter(b=>b.status===filter);

  return (
    <>
      <PageTitle title="Proof of Performance" description="Review and approve campaign delivery proofs."/>
      <Layout title="Proof of Performance" subtitle="Review delivery proofs and approve campaign completion">
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {loading && <div style={{ display:'flex', gap:10, color:'var(--text-muted)', padding:'20px 0' }}><Spinner size={14}/>Loading…</div>}

        {!loading && (
          <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 1.2fr':'1fr', gap:16 }}>

            {/* Left — booking list */}
            <div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
                {FILTERS.map(f=>(
                  <button key={f.key} onClick={()=>setFilter(f.key)}
                    style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                      background:filter===f.key?'var(--accent-soft)':'rgba(255,255,255,0.04)',
                      color:filter===f.key?'var(--accent-light)':'var(--text-muted)',
                      outline:filter===f.key?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
                    }}>{f.label}</button>
                ))}
              </div>

              {filtered.length===0&&<div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)', fontSize:13, borderRadius:10, background:'var(--bg-card)', border:'0.5px solid var(--border)' }}>No campaigns in this category.</div>}

              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {filtered.map(b=>{
                  const sm = STATUS_META[b.status]||{label:b.status,color:'var(--text-muted)',bg:'rgba(255,255,255,0.05)'};
                  const isActive = selected?.bookingId===b.bookingId;
                  return(
                    <div key={b.bookingId} onClick={()=>selectBooking(b)}
                      style={{ padding:'12px 14px', borderRadius:10, cursor:'pointer', transition:'all 0.15s',
                        background:isActive?'var(--accent-soft)':'var(--bg-card)',
                        border:`0.5px solid ${isActive?'var(--accent-border)':'var(--border)'}`,
                      }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3 }}>
                        <p style={{ fontWeight:500, fontSize:12, color:'white' }}>{b.target||'—'}</p>
                        <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:sm.bg, color:sm.color, whiteSpace:'nowrap' }}>{sm.label}</span>
                      </div>
                      <p style={{ fontSize:10, color:'var(--text-muted)' }}>{b.brandName||b.contactEmail} · {fmt(b.finalPrice)} · {fmtDate(b.date)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — proof details */}
            {selected&&(
              <div>
                <div className="page-card" style={{ padding:'16px 18px', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:12, borderBottom:'0.5px solid var(--border)' }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', flexShrink:0 }}>
                      {(selected.target||'?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight:600, fontSize:13, color:'white' }}>{selected.target}</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{selected.brandName} · {fmt(selected.finalPrice)} · {fmtDate(selected.date)}</p>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['Inventory',(selected.inventoryOption||'—').replaceAll('_',' ')],['Market',(selected.market||'—').replaceAll('_',' ')],['Runs',selected.runs||1],['Provider Payout',fmt(selected.mediaPayout)]].map(([l,v])=>(
                      <div key={l} style={{ padding:'7px 10px', borderRadius:7, background:'rgba(255,255,255,0.025)', border:'0.5px solid var(--border)' }}>
                        <p style={{ fontSize:9, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:1 }}>{l}</p>
                        <p style={{ fontSize:11, fontWeight:500, color:'white' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proofs */}
                <div className="page-card" style={{ padding:'16px 18px', marginBottom:12 }}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white', marginBottom:12 }}>
                    Delivery Proofs {proofs.length>0&&<span style={{ marginLeft:6, fontSize:10, color:'var(--text-muted)' }}>({proofs.length})</span>}
                  </p>
                  {proofs.length===0&&<p style={{ fontSize:12, color:'var(--text-muted)' }}>No proofs submitted yet.</p>}
                  {proofs.map(proof=>(
                    <div key={proof.id||proof.fileUrl} style={{ marginBottom:10, padding:'12px', borderRadius:8, background:'rgba(255,255,255,0.025)', border:'0.5px solid var(--border)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                        <p style={{ fontSize:12, fontWeight:500, color:'white' }}>{proof.name||'Proof file'}</p>
                        <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20,
                          background:proof.status==='APPROVED'?'rgba(34,197,94,0.1)':proof.status==='REJECTED'?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)',
                          color:proof.status==='APPROVED'?'#86efac':proof.status==='REJECTED'?'#fca5a5':'#fcd34d'
                        }}>{proof.status||'PENDING'}</span>
                      </div>
                      {proof.fileUrl&&<a href={proof.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'var(--accent-light)', display:'block', marginBottom:6, wordBreak:'break-all' }}>{proof.fileUrl}</a>}
                      {proof.notes&&<p style={{ fontSize:11, color:'var(--text-muted)', fontStyle:'italic' }}>{proof.notes}</p>}
                      {!proof.status||proof.status==='PENDING'?(
                        <div style={{ display:'flex', gap:7, marginTop:8 }}>
                          <textarea placeholder="Notes for rejection (optional)" value={notes} onChange={e=>setNotes(e.target.value)} rows={1}
                            style={{ flex:1, padding:'6px 10px', borderRadius:7, fontSize:11, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', resize:'none', fontFamily:'Inter,sans-serif' }}/>
                          <button onClick={()=>approveProof(proof.id)} disabled={approving}
                            style={{ padding:'6px 12px', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer', border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', display:'flex', alignItems:'center', gap:4 }}>
                            {approving?<Spinner size={10}/>:'✓ Approve'}
                          </button>
                          <button onClick={()=>rejectProof(proof.id)} disabled={approving}
                            style={{ padding:'6px 12px', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer', border:'0.5px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.08)', color:'#fca5a5' }}>
                            Reject
                          </button>
                        </div>
                      ):null}
                    </div>
                  ))}
                </div>

                {/* AI Analysis */}
                {['CLIENT','ADMIN'].includes(role)&&(
                  <div className="page-card" style={{ padding:'16px 18px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:analysis?14:0 }}>
                      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white' }}>✧ AI Performance Analysis</p>
                      <button onClick={analyseWithAI} disabled={analysing} className="btn-secondary" style={{ fontSize:11, padding:'5px 12px' }}>
                        {analysing?<><Spinner size={11}/>Analysing…</>:'Run Analysis'}
                      </button>
                    </div>
                    {analysis&&(
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:9, marginBottom:12,
                          background:analysis.verdict==='APPROVED'?'rgba(34,197,94,0.06)':analysis.verdict==='DISPUTED'?'rgba(239,68,68,0.06)':'rgba(245,158,11,0.06)',
                          border:`0.5px solid ${analysis.verdict==='APPROVED'?'rgba(34,197,94,0.18)':analysis.verdict==='DISPUTED'?'rgba(239,68,68,0.18)':'rgba(245,158,11,0.18)'}`,
                        }}>
                          <div style={{ textAlign:'center', flexShrink:0 }}>
                            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, color:analysis.verdict==='APPROVED'?'#86efac':analysis.verdict==='DISPUTED'?'#fca5a5':'#fcd34d', lineHeight:1 }}>{analysis.score}</p>
                            <p style={{ fontSize:9, color:'var(--text-muted)', fontWeight:600 }}>SCORE</p>
                          </div>
                          <div>
                            <p style={{ fontWeight:600, fontSize:12, color:'white', marginBottom:3 }}>{analysis.verdict}</p>
                            <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.6 }}>{analysis.summary}</p>
                          </div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                          {analysis.strengths?.length>0&&(
                            <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(34,197,94,0.05)', border:'0.5px solid rgba(34,197,94,0.15)' }}>
                              <p style={{ fontSize:9, fontWeight:600, color:'#86efac', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Strengths</p>
                              {analysis.strengths.map(s=><p key={s} style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:3 }}>✓ {s}</p>)}
                            </div>
                          )}
                          {analysis.concerns?.length>0&&(
                            <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(239,68,68,0.05)', border:'0.5px solid rgba(239,68,68,0.15)' }}>
                              <p style={{ fontSize:9, fontWeight:600, color:'#fca5a5', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Concerns</p>
                              {analysis.concerns.map(c=><p key={c} style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:3 }}>⚠ {c}</p>)}
                            </div>
                          )}
                        </div>
                        <div style={{ padding:'10px 12px', borderRadius:8, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)' }}>
                          <p style={{ fontSize:9, fontWeight:600, color:'var(--accent-light)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Recommendation</p>
                          <p style={{ fontSize:11, color:'rgba(255,255,255,0.65)', lineHeight:1.6 }}>{analysis.recommendation}</p>
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