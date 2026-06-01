import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`,'Content-Type':'application/json'}:{}; };
const fmt = n => `₦${Number(n||0).toLocaleString('en-NG')}`;
const fmtD = d => { try{return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'});}catch{return d||'-';} };

const SM = {PAID:{label:'Running',color:'#0d9488'},IN_PROGRESS:{label:'In Progress',color:'#7c3aed'},PENDING_DELIVERY_REVIEW:{label:'Proof Submitted',color:'#d97706'},COMPLETED:{label:'Completed',color:'#16a34a'}};

export default function ProofOfPerformance() {
  const { user }                = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [proofs, setProofs]     = useState([]);
  const [approving, setApproving] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [notes, setNotes]       = useState('');
  const [filter, setFilter]     = useState('ALL');
  const role = (user?.role||'CLIENT').toUpperCase();

  useEffect(()=>{
    (async()=>{
      try {
        const hd = await h();
        const r  = await axios.get(`${API}/bookings`,{headers:hd});
        const all = Array.isArray(r.data)?r.data:r.data?.bookings??[];
        setBookings(all.filter(b=>['PAID','IN_PROGRESS','PENDING_DELIVERY_REVIEW','COMPLETED'].includes(b.status)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
      } catch(e){console.error(e);}
      finally{setLoading(false);}
    })();
  },[]);

  const selectBooking = async booking => {
    setSelected(booking);setProofs([]);setAnalysis(null);setNotes('');
    try { const hd=await h(); const r=await axios.get(`${API}/bookings/${booking.bookingId}/proofs`,{headers:hd}); setProofs(Array.isArray(r.data)?r.data:r.data?.proofs??[]); } catch{setProofs([]);}
  };

  const reviewProof = async (proofId,approved) => {
    setApproving(true);
    try {
      const hd=await h();
      await axios.post(`${API}/bookings/proof/review`,{bookingId:selected.bookingId,proofId,approved,notes},{headers:hd});
      if(approved)setSelected(prev=>({...prev,status:'COMPLETED'}));
      setProofs(prev=>prev.map(p=>p.id===proofId?{...p,status:approved?'APPROVED':'REJECTED'}:p));
    } catch(e){console.error(e);}
    finally{setApproving(false);}
  };

  const analyseWithAI = async () => {
    setAnalysing(true);setAnalysis(null);
    try {
      const hd=await h();
      const prompt=`Analyse this campaign delivery as a performance analyst. Campaign: ${selected.target}, Category: ${(selected.category||'').replaceAll('_',' ')}, Market: ${(selected.market||'').replaceAll('_',' ')}, Runs: ${selected.runs||1}, Investment: ₦${Number(selected.finalPrice||0).toLocaleString()}, Proofs: ${proofs.length}. Respond in JSON only: {"verdict":"APPROVED","score":85,"summary":"2-sentence summary","strengths":["..."],"concerns":[],"recommendation":"next step"}`;
      const res=await axios.post(`${API}/ai/generate`,{prompt},{headers:hd});
      const text=(res.data?.text||'').replace(/\`\`\`json|\`\`\`/g,'').trim();
      setAnalysis(JSON.parse(text));
    } catch{;}
    finally{setAnalysing(false);}
  };

  const filtered = filter==='ALL'?bookings:bookings.filter(b=>b.status===filter);

  return (
    <Layout title="Proof of Performance" subtitle="Campaign Delivery">
      {loading&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586'}}>Loading…</div>}
      {!loading&&(
        <div style={{display:'grid',gridTemplateColumns:selected?'1fr 1.2fr':'1fr',gap:20}}>

          {/* Left */}
          <div>
            <div style={{display:'flex',borderBottom:'1px solid #e1e4f0',marginBottom:14}}>
              {[['ALL','All'],['PAID','Running'],['PENDING_DELIVERY_REVIEW','Needs Review'],['COMPLETED','Completed']].map(([k,l])=>(
                <button key={k} onClick={()=>setFilter(k)} style={{padding:'7px 12px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em',color:filter===k?'#4338ca':'#464554',borderBottom:filter===k?'2px solid #4338ca':'2px solid transparent',marginBottom:-1,whiteSpace:'nowrap'}}>{l}</button>
              ))}
            </div>
            {filtered.length===0&&<div style={{textAlign:'center',padding:'40px',border:'1px dashed #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586',textTransform:'uppercase'}}>No campaigns here</div>}
            {filtered.map(b=>{
              const sm=SM[b.status]||{label:b.status,color:'#464554'};
              const isActive=selected?.bookingId===b.bookingId;
              return (
                <div key={b.bookingId} onClick={()=>selectBooking(b)}
                  style={{padding:'11px 14px',cursor:'pointer',marginBottom:4,background:isActive?'#eef2ff':'white',border:`1px solid ${isActive?'#c7d2fe':'#e1e4f0'}`,borderLeft:`2px solid ${isActive?'#4338ca':'transparent'}`,transition:'all 0.15s'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                    <span style={{fontFamily:'Manrope,sans-serif',fontWeight:500,fontSize:12,color:'#131b2e'}}>{b.target||'-'}</span>
                    <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',background:'#f2f3ff',color:sm.color,letterSpacing:'0.06em',textTransform:'uppercase'}}>{sm.label}</span>
                  </div>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586'}}>{b.brandName||b.contactEmail} · {fmt(b.finalPrice)} · {fmtD(b.date)}</div>
                </div>
              );
            })}
          </div>

          {/* Right */}
          {selected&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {/* Summary */}
              <div style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px'}}>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#464554',marginBottom:12}}>Campaign Details</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[['Campaign Value',fmt(selected.finalPrice)],['Provider Payout',fmt(selected.mediaPayout)],['Market',(selected.market||'-').replaceAll('_',' ')],['Runs',selected.runs||1]].map(([l,v])=>(
                    <div key={l} style={{padding:'8px 10px',background:'#faf8ff',border:'1px solid #e1e4f0'}}>
                      <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#777586',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:500,color:'#131b2e'}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proofs */}
              <div style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px'}}>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#464554',marginBottom:12}}>Delivery Proofs ({proofs.length})</div>
                {proofs.length===0&&<p style={{fontSize:11,color:'#777586'}}>No proofs submitted yet.</p>}
                {proofs.map(proof=>(
                  <div key={proof.id||proof.fileUrl} style={{marginBottom:10,padding:12,background:'#faf8ff',border:'1px solid #e1e4f0'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontSize:12,fontWeight:500,color:'#131b2e'}}>{proof.name||'Proof file'}</span>
                      <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',letterSpacing:'0.06em',background:proof.status==='APPROVED'?'#f0fdf4':proof.status==='REJECTED'?'#fef2f2':'#fffbeb',color:proof.status==='APPROVED'?'#16a34a':proof.status==='REJECTED'?'#dc2626':'#d97706'}}>{proof.status||'PENDING'}</span>
                    </div>
                    {proof.fileUrl&&<a href={proof.fileUrl} target="_blank" rel="noopener noreferrer" style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#4338ca',display:'block',marginBottom:6,wordBreak:'break-all'}}>{proof.fileUrl}</a>}
                    {(!proof.status||proof.status==='PENDING')&&['CLIENT','ADMIN'].includes(role)&&(
                      <div style={{marginTop:8}}>
                        <input type="text" placeholder="Rejection notes (optional)" value={notes} onChange={e=>setNotes(e.target.value)} style={{width:'100%',border:'1px solid #e1e4f0',padding:'7px 10px',fontFamily:'Inter,sans-serif',fontSize:11,outline:'none',marginBottom:8,boxSizing:'border-box'}}/>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>reviewProof(proof.id,true)} disabled={approving} style={{flex:1,padding:'7px',background:'#16a34a',color:'white',border:'none',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer'}}>✓ Approve</button>
                          <button onClick={()=>reviewProof(proof.id,false)} disabled={approving} style={{flex:1,padding:'7px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',fontFamily:'IBM Plex Mono,monospace',fontWeight:600,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer'}}>Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Analysis */}
              {['CLIENT','ADMIN'].includes(role)&&(
                <div style={{background:'white',border:'1px solid #e1e4f0',padding:'16px 18px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:analysis?14:0}}>
                    <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',textTransform:'uppercase',letterSpacing:'0.14em'}}>AI Performance Analysis</div>
                    <button onClick={analyseWithAI} disabled={analysing} style={{padding:'4px 10px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.06em',background:'transparent',cursor:'pointer'}}>
                      {analysing?'Analysing…':'Run Analysis'}
                    </button>
                  </div>
                  {analysis&&(
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',marginBottom:12,background:'#faf8ff',border:'1px solid #e1e4f0',borderLeft:`2px solid ${analysis.verdict==='APPROVED'?'#16a34a':analysis.verdict==='DISPUTED'?'#dc2626':'#d97706'}`}}>
                        <div style={{textAlign:'center',flexShrink:0}}>
                          <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:28,color:analysis.verdict==='APPROVED'?'#16a34a':'#d97706',lineHeight:1}}>{analysis.score}</div>
                          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#777586'}}>SCORE</div>
                        </div>
                        <div>
                          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,fontWeight:600,color:'#131b2e',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.06em'}}>{analysis.verdict}</div>
                          <p style={{fontSize:11,color:'#464554',lineHeight:1.6}}>{analysis.summary}</p>
                        </div>
                      </div>
                      <div style={{padding:'10px 12px',background:'#fffbeb',borderLeft:'2px solid #d97706'}}>
                        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Recommendation</div>
                        <p style={{fontSize:11,color:'#464554',lineHeight:1.6}}>{analysis.recommendation}</p>
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
  );
}
