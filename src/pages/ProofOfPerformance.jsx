import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { getBookings } from '../services/api';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const STATUS_CONFIG = {
  PAID:                    { label:'Active',           color:'#86efac', bg:'rgba(34,197,94,0.1)',   border:'rgba(34,197,94,0.2)' },
  IN_PROGRESS:             { label:'In Progress',      color:'#86efac', bg:'rgba(34,197,94,0.1)',   border:'rgba(34,197,94,0.2)' },
  PENDING_DELIVERY_REVIEW: { label:'Proof Submitted',  color:'#fcd34d', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.2)' },
  COMPLETED:               { label:'Completed',        color:'#a5b4fc', bg:'rgba(99,102,241,0.1)',  border:'rgba(99,102,241,0.2)' },
  PENDING_PROVIDER_CONFIRMATION: { label:'Awaiting Provider', color:'rgba(255,255,255,0.4)', bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.08)' },
  PAYMENT_PENDING:         { label:'Awaiting Payment', color:'#fcd34d', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.2)' },
};

const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ProofOfPerformance() {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [proofs, setProofs]         = useState([]);
  const [uploading, setUploading]   = useState(false);
  const [approving, setApproving]   = useState(false);
  const [toast, setToast]           = useState(null);
  const [filter, setFilter]         = useState('ALL');
  const [analysis, setAnalysis]     = useState(null);
  const [analysing, setAnalysing]   = useState(false);
  const [notes, setNotes]           = useState('');

  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 3000); };

  const userRole = auth.currentUser?.reloadUserInfo?.customAttributes
    ? JSON.parse(auth.currentUser.reloadUserInfo.customAttributes)?.role || 'CLIENT'
    : 'CLIENT';

  useEffect(() => {
    getBookings()
      .then(r => setBookings(Array.isArray(r) ? r : r.bookings ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = bookings.filter(b => {
    if (filter === 'ALL') return ['PAID','IN_PROGRESS','PENDING_DELIVERY_REVIEW','COMPLETED'].includes(b.status);
    return b.status === filter;
  });

  const openBooking = (b) => {
    setSelected(b);
    setProofs(b.deliveryProofs || []);
    setAnalysis(null);
    setNotes('');
  };

  const uploadProof = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !selected) return;
    setUploading(true);
    try {
      const headers = await authHeader();
      const uploaded = [];
      for (const file of files) {
        // Get presigned URL
        const urlRes = await axios.get(`${API}/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`, { headers });
        await axios.put(urlRes.data.uploadUrl, file, { headers: { 'Content-Type': file.type } });
        uploaded.push({ name: file.name, url: urlRes.data.fileUrl, type: file.type, uploadedAt: new Date().toISOString() });
      }
      // Save proofs + update status
      await axios.patch(`${API}/bookings/${selected.bookingId}/proof`, { proofs: uploaded, notes, status: 'PENDING_DELIVERY_REVIEW' }, { headers: { ...headers, 'Content-Type':'application/json' } });
      setProofs(prev => [...prev, ...uploaded]);
      setSelected(prev => ({ ...prev, status:'PENDING_DELIVERY_REVIEW', deliveryProofs:[...(prev.deliveryProofs||[]), ...uploaded] }));
      setBookings(prev => prev.map(b => b.bookingId===selected.bookingId ? { ...b, status:'PENDING_DELIVERY_REVIEW', deliveryProofs:[...(b.deliveryProofs||[]),...uploaded] } : b));
      showToast('success', `${uploaded.length} file${uploaded.length>1?'s':''} uploaded successfully`);
    } catch(e) { showToast('error', 'Upload failed: ' + (e.response?.data?.error || e.message)); }
    finally { setUploading(false); }
  };

  const approveDelivery = async () => {
    if (!selected) return;
    setApproving(true);
    try {
      const headers = await authHeader();
      await axios.patch(`${API}/bookings/${selected.bookingId}/approve-delivery`, {}, { headers });
      setSelected(prev => ({ ...prev, status:'COMPLETED' }));
      setBookings(prev => prev.map(b => b.bookingId===selected.bookingId ? { ...b, status:'COMPLETED' } : b));
      showToast('success', 'Delivery approved — campaign marked complete');
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setApproving(false); }
  };

  const analyseWithAI = async () => {
    if (!selected || !proofs.length) return;
    setAnalysing(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are BrandCasta's campaign performance analyst. Analyse this campaign delivery based on the available information and provide a performance assessment.

Campaign Details:
- Media: ${selected.target}
- Category: ${(selected.category||'').replaceAll('_',' ')}
- Inventory: ${(selected.inventoryGroup||'').replaceAll('_',' ')} › ${(selected.inventoryOption||'').replaceAll('_',' ')}
- Market: ${(selected.market||'').replaceAll('_',' ')}
- Runs: ${selected.runs || 1}
- Investment: ₦${Number(selected.finalPrice||0).toLocaleString()}
- Campaign Date: ${selected.date || 'Not specified'}
- Proof files submitted: ${proofs.length} file(s) (${proofs.map(p=>p.name).join(', ')})
- Provider notes: ${notes || 'None'}

Respond with JSON only:
{
  "verdict": "APPROVED" | "NEEDS_REVIEW" | "DISPUTED",
  "score": 85,
  "summary": "2-sentence performance summary",
  "strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1"] or [],
  "recommendation": "What the client should do next",
  "estimatedReach": "estimated reach based on media type and market",
  "roi": "estimated ROI commentary"
}`
          }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text||'').join('').trim();
      const parsed = JSON.parse(text.replace(/```json|```/g,'').trim());
      setAnalysis(parsed);
    } catch(e) { showToast('error', 'AI analysis failed'); }
    finally { setAnalysing(false); }
  };

  const FILTERS = [
    { key:'ALL',                      label:'All Active' },
    { key:'PAID',                     label:'Running' },
    { key:'PENDING_DELIVERY_REVIEW',  label:'Awaiting Review' },
    { key:'COMPLETED',                label:'Completed' },
  ];

  if (loading) return <Layout title="Proof of Performance"><div style={{ color:'var(--text-muted)', padding:40 }}><Spinner size={16}/></div></Layout>;

  return (
    <Layout title="Proof of Performance" subtitle="Track, verify and approve campaign delivery evidence">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap:20 }}>

        {/* Left — booking list */}
        <div>
          {/* Filters */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s', border:'none',
                  background: filter===f.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  color:       filter===f.key ? '#a5b4fc' : 'var(--text-muted)',
                  outline:     filter===f.key ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
                }}>{f.label}</button>
            ))}
          </div>

          {active.length === 0 && (
            <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No campaigns found for this filter.</div>
          )}

          <div className="space-y-3">
            {active.map(b => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PAID;
              const isSelected = selected?.bookingId === b.bookingId;
              const proofCount = (b.deliveryProofs||[]).length;
              return (
                <div key={b.bookingId} onClick={() => openBooking(b)}
                  style={{ padding:'16px 18px', borderRadius:12, background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--bg-surface)', border: isSelected ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)', cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                    <div>
                      <p style={{ fontWeight:700, fontSize:14, color:'white' }}>{b.target}</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                        {(b.inventoryOption||'').replaceAll('_',' ')} · {(b.market||'').replaceAll('_',' ')}
                        {b.runs > 1 && ` · ×${b.runs} runs`}
                      </p>
                    </div>
                    <span style={{ padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, background: cfg.bg, color: cfg.color, border:`1px solid ${cfg.border}`, flexShrink:0, marginLeft:8 }}>{cfg.label}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <p style={{ fontSize:12, color:'var(--text-muted)' }}>₦{Number(b.finalPrice||0).toLocaleString()} · {b.date||'—'}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      {proofCount > 0 && (
                        <span style={{ padding:'2px 8px', borderRadius:6, background:'rgba(34,197,94,0.1)', color:'#86efac', fontSize:10, fontWeight:700, border:'1px solid rgba(34,197,94,0.2)' }}>
                          {proofCount} proof{proofCount>1?'s':''}
                        </span>
                      )}
                      {b.status === 'PENDING_DELIVERY_REVIEW' && (
                        <span style={{ padding:'2px 8px', borderRadius:6, background:'rgba(245,158,11,0.1)', color:'#fcd34d', fontSize:10, fontWeight:700, border:'1px solid rgba(245,158,11,0.2)' }}>
                          Review needed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — detail panel */}
        {selected && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Header */}
            <div style={{ padding:'18px 20px', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <p style={{ fontWeight:800, fontSize:16, color:'white', letterSpacing:'-0.2px' }}>{selected.target}</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>
                    {(selected.category||'').replaceAll('_',' ')} · Booking #{selected.bookingId?.slice(0,8).toUpperCase()}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18, padding:2 }}>✕</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  ['Inventory', (selected.inventoryGroup||'').replaceAll('_',' ')],
                  ['Option', (selected.inventoryOption||'').replaceAll('_',' ')],
                  ['Market', (selected.market||'').replaceAll('_',' ')],
                  ['Runs', selected.runs||1],
                  ['Date', selected.date||'—'],
                  ['Investment', `₦${Number(selected.finalPrice||0).toLocaleString()}`],
                ].map(([l,v]) => (
                  <div key={l} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)' }}>
                    <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{l}</p>
                    <p style={{ fontSize:13, color:'white', fontWeight:600, marginTop:2 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof uploads */}
            <div style={{ padding:'18px 20px', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <p style={{ fontWeight:700, fontSize:14, color:'white', marginBottom:12 }}>Delivery Evidence</p>

              {proofs.length === 0 ? (
                <div style={{ padding:'20px', textAlign:'center', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize:13, color:'var(--text-muted)' }}>No proof submitted yet</p>
                </div>
              ) : (
                <div className="space-y-2" style={{ marginBottom:12 }}>
                  {proofs.map((p, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:9, background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)' }}>
                      <span style={{ fontSize:16 }}>{p.type?.includes('image') ? '🖼' : p.type?.includes('video') ? '🎬' : '📄'}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12, fontWeight:600, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                        {p.uploadedAt && <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{new Date(p.uploadedAt).toLocaleDateString('en-NG')}</p>}
                      </div>
                      {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#a5b4fc', fontWeight:600, flexShrink:0 }}>View</a>}
                    </div>
                  ))}
                </div>
              )}

              {/* Provider upload */}
              {['PAID','IN_PROGRESS'].includes(selected.status) && (
                <div>
                  <textarea rows={2} placeholder="Notes about the delivery (optional)..." value={notes} onChange={e => setNotes(e.target.value)}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:9, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'white', fontSize:12, fontFamily:'Manrope,sans-serif', resize:'none', outline:'none', marginBottom:8 }}/>
                  <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', borderRadius:9, background:'rgba(99,102,241,0.08)', border:'1px dashed rgba(99,102,241,0.3)', color:'#a5b4fc', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    {uploading ? <><Spinner size={13}/> Uploading…</> : '📤 Upload Proof of Delivery'}
                    <input type="file" multiple accept="image/*,video/*,.pdf,.csv,.xlsx" onChange={uploadProof} style={{ display:'none' }}/>
                  </label>
                </div>
              )}

              {/* Client approve */}
              {selected.status === 'PENDING_DELIVERY_REVIEW' && proofs.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', marginBottom:10 }}>
                    <p style={{ fontSize:12, color:'#fcd34d', fontWeight:600 }}>⏳ Delivery proof submitted. Please review and approve.</p>
                  </div>
                  <button onClick={approveDelivery} disabled={approving} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'11px' }}>
                    {approving ? <><Spinner size={13}/> Approving…</> : '✓ Approve Delivery & Close Campaign'}
                  </button>
                </div>
              )}

              {selected.status === 'COMPLETED' && (
                <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
                  <p style={{ fontSize:12, color:'#86efac', fontWeight:600 }}>✅ Campaign completed and approved. Provider payout pending.</p>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            {proofs.length > 0 && (
              <div style={{ padding:'18px 20px', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <p style={{ fontWeight:700, fontSize:14, color:'white' }}>AI Performance Analysis</p>
                  <button onClick={analyseWithAI} disabled={analysing} className="btn-secondary" style={{ fontSize:11, padding:'6px 12px' }}>
                    {analysing ? <><Spinner size={11}/> Analysing…</> : '✨ Analyse with AI'}
                  </button>
                </div>

                {!analysis && !analysing && (
                  <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
                    Run an AI analysis on the submitted delivery proof to get a performance verdict, estimated reach and ROI commentary.
                  </p>
                )}

                {analysis && (
                  <div>
                    {/* Verdict */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:10, marginBottom:12,
                      background: analysis.verdict==='APPROVED' ? 'rgba(34,197,94,0.08)' : analysis.verdict==='DISPUTED' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                      border: analysis.verdict==='APPROVED' ? '1px solid rgba(34,197,94,0.2)' : analysis.verdict==='DISPUTED' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)',
                    }}>
                      <span style={{ fontSize:22 }}>{analysis.verdict==='APPROVED'?'✅':analysis.verdict==='DISPUTED'?'❌':'⚠️'}</span>
                      <div>
                        <p style={{ fontWeight:800, fontSize:14, color:'white' }}>
                          {analysis.verdict==='APPROVED'?'Delivery Approved':analysis.verdict==='DISPUTED'?'Delivery Disputed':'Needs Review'}
                          <span style={{ marginLeft:8, fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>Score: {analysis.score}/100</span>
                        </p>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:3, lineHeight:1.5 }}>{analysis.summary}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                      <div style={{ padding:'10px 12px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                        <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Estimated Reach</p>
                        <p style={{ fontSize:13, color:'white', fontWeight:600, marginTop:3 }}>{analysis.estimatedReach}</p>
                      </div>
                      <div style={{ padding:'10px 12px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                        <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>ROI Commentary</p>
                        <p style={{ fontSize:13, color:'white', fontWeight:600, marginTop:3 }}>{analysis.roi}</p>
                      </div>
                    </div>

                    {analysis.strengths?.length > 0 && (
                      <div style={{ marginBottom:8 }}>
                        <p style={{ fontSize:10, color:'#86efac', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Strengths</p>
                        {analysis.strengths.map(s => <p key={s} style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:3 }}>✓ {s}</p>)}
                      </div>
                    )}
                    {analysis.concerns?.length > 0 && (
                      <div style={{ marginBottom:8 }}>
                        <p style={{ fontSize:10, color:'#fca5a5', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Concerns</p>
                        {analysis.concerns.map(c => <p key={c} style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:3 }}>⚠ {c}</p>)}
                      </div>
                    )}
                    <div style={{ padding:'10px 12px', borderRadius:9, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)' }}>
                      <p style={{ fontSize:12, color:'#a5b4fc', lineHeight:1.6 }}>💡 {analysis.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}