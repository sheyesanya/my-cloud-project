import { useState } from 'react';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' };
};

const OBJECTIVES = ['Brand Awareness','Product Launch','Sales Conversion','Lead Generation','Event Promotion','Brand Recall'];
const MEDIA_OPTIONS = ['TV','Radio','OOH Billboards','Podcasts','Influencers','Social Media','Print','Live Streaming'];
const AUDIENCES = ['Youth (18–25)','Young Adults (26–35)','Adults (36–50)','Mass Market','Urban Professional','Students','Parents'];

export default function BriefGenerator() {
  const { user } = useAuth();
  const [form, setForm] = useState({ brandName:'', objective:'Brand Awareness', audience:'', budget:'', duration:'', media:[], notes:'' });
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState('');
  const [error, setError] = useState('');

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleMedia = (m) => setForm(f=>({ ...f, media: f.media.includes(m) ? f.media.filter(x=>x!==m) : [...f.media,m] }));

  const generate = async () => {
    if(!form.brandName.trim()){ setError('Brand name is required'); return; }
    setGenerating(true); setError(''); setBrief('');
    try {
      const headers = await authHeader();
      const prompt = `You are a Nigerian media campaign strategist. Generate a professional, detailed campaign brief for the following:

Brand: ${form.brandName}
Objective: ${form.objective}
Target Audience: ${form.audience||'General Nigerian market'}
Budget: ${form.budget||'To be determined'}
Campaign Duration: ${form.duration||'4 weeks'}
Preferred Media Channels: ${form.media.length?form.media.join(', '):'All channels'}
Additional Notes: ${form.notes||'None'}

Write a comprehensive campaign brief including: Executive Summary, Campaign Objectives, Target Audience Analysis, Recommended Media Mix with rationale, Creative Direction suggestions, KPIs and Success Metrics, and Budget Allocation guidance. Format it professionally.`;

      const res = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role:'user', content: prompt }],
      });
      const text = res.data?.content?.find(c=>c.type==='text')?.text||'';
      setBrief(text);
    } catch(e){ setError('Could not generate brief. Please try again.'); }
    finally{ setGenerating(false); }
  };

  const inp = { width:'100%', padding:'8px 11px', borderRadius:8, fontSize:12, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', fontFamily:'Inter,sans-serif' };

  return (
    <>
      <PageTitle title="AI Brief Generator" description="Generate a professional campaign brief with AI."/>
      <Layout title="AI Brief Generator" subtitle="Generate professional campaign briefs powered by AI">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, alignItems:'start' }}>

          {/* Form */}
          <div className="page-card" style={{ padding:'18px 20px' }}>
            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white', marginBottom:16 }}>Campaign Details</p>
            <div className="space-y-4">
              <div>
                <label className="form-label">Brand Name *</label>
                <input style={inp} placeholder="e.g. Indomie Nigeria" value={form.brandName} onChange={e=>setF('brandName',e.target.value)}/>
              </div>
              <div>
                <label className="form-label">Campaign Objective</label>
                <select value={form.objective} onChange={e=>setF('objective',e.target.value)}
                  style={{ ...inp, background:'#0d0d18' }}>
                  {OBJECTIVES.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Target Audience</label>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {AUDIENCES.map(a=>(
                    <button key={a} type="button" onClick={()=>setF('audience',a)}
                      style={{ padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                        background:form.audience===a?'var(--accent-soft)':'rgba(255,255,255,0.04)',
                        color:form.audience===a?'var(--accent-light)':'var(--text-muted)',
                        outline:form.audience===a?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
                      }}>{a}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label className="form-label">Budget Range</label>
                  <input style={inp} placeholder="e.g. ₦5M–₦10M" value={form.budget} onChange={e=>setF('budget',e.target.value)}/>
                </div>
                <div>
                  <label className="form-label">Duration</label>
                  <input style={inp} placeholder="e.g. 4 weeks" value={form.duration} onChange={e=>setF('duration',e.target.value)}/>
                </div>
              </div>
              <div>
                <label className="form-label">Preferred Media</label>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {MEDIA_OPTIONS.map(m=>(
                    <button key={m} type="button" onClick={()=>toggleMedia(m)}
                      style={{ padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                        background:form.media.includes(m)?'var(--accent-soft)':'rgba(255,255,255,0.04)',
                        color:form.media.includes(m)?'var(--accent-light)':'var(--text-muted)',
                        outline:form.media.includes(m)?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
                      }}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Additional Notes</label>
                <textarea rows={2} style={{ ...inp, resize:'vertical' }} placeholder="Any specific requirements, tone, constraints…"
                  value={form.notes} onChange={e=>setF('notes',e.target.value)}/>
              </div>
              {error && <p style={{ color:'#fca5a5', fontSize:11 }}>{error}</p>}
              <button onClick={generate} disabled={generating} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'10px', fontSize:13 }}>
                {generating ? <><Spinner size={13}/>Generating brief…</> : '✧ Generate Campaign Brief'}
              </button>
            </div>
          </div>

          {/* Output */}
          <div>
            {!brief && !generating && (
              <div style={{ padding:'32px', borderRadius:10, background:'var(--bg-card)', border:'0.5px dashed rgba(99,102,241,0.25)', textAlign:'center' }}>
                <p style={{ fontSize:24, marginBottom:12 }}>✧</p>
                <p style={{ fontWeight:500, color:'white', fontSize:13, marginBottom:6 }}>Your brief will appear here</p>
                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>Fill in the campaign details and click Generate to create a professional brief using AI.</p>
              </div>
            )}
            {generating && (
              <div style={{ padding:'32px', borderRadius:10, background:'var(--bg-card)', border:'0.5px solid var(--accent-border)', textAlign:'center' }}>
                <Spinner size={20}/>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:12 }}>Crafting your campaign brief…</p>
              </div>
            )}
            {brief && (
              <div className="page-card" style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white' }}>Generated Brief</p>
                  <button onClick={()=>navigator.clipboard?.writeText(brief).then(()=>alert('Copied!'))}
                    className="btn-secondary" style={{ fontSize:11, padding:'5px 12px' }}>Copy</button>
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', lineHeight:1.9, whiteSpace:'pre-wrap', maxHeight:480, overflowY:'auto' }}>
                  {brief}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}