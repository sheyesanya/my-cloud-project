import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const callAI = async (prompt) => {
  const token = await auth.currentUser?.getIdToken();
  const headers = { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) };
  const res = await axios.post(`${API}/ai/generate`, { prompt, max_tokens:1500 }, { headers });
  return res.data?.text || '';
};

const TOOLS = [
  { key:'brief', icon:'✧', label:'Campaign Brief',    color:'var(--amber)', desc:'Full strategic campaign brief' },
  { key:'image', icon:'▦', label:'Ad Visual Concept', color:'#f472b6',      desc:'Visual direction & AI image prompt' },
  { key:'audio', icon:'◎', label:'Radio Script',      color:'#5eead4',      desc:'30s & 60s voiceover scripts' },
  { key:'video', icon:'▣', label:'TV/Video Script',   color:'#fcd34d',      desc:'TVC storyboard script' },
];

const OBJECTIVES    = ['Brand Awareness','Product Launch','Sales Conversion','Lead Generation','Event Promotion','Brand Recall'];
const MEDIA_OPTIONS = ['TV','Radio','OOH Billboards','Podcasts','Influencers','Social Media','Print','Live Streaming'];
const AUDIENCES     = ['Youth (18–25)','Young Adults (26–35)','Adults (36–50)','Mass Market','Urban Professional','Students','Parents'];

const PROMPTS = {
  brief: (form) => `You are a senior Nigerian media campaign strategist. Write a comprehensive, professional campaign brief for:

Brand: ${form.brandName}
Objective: ${form.objective}
Target Audience: ${form.audience || 'General Nigerian market'}
Budget: ${form.budget || 'To be determined'}
Duration: ${form.duration || '4 weeks'}
Media Channels: ${form.media.length ? form.media.join(', ') : 'All channels'}
Notes: ${form.notes || 'None'}

Include: Executive Summary, Campaign Objectives, Target Audience Analysis, Recommended Media Mix with rationale, Creative Direction, KPIs and Success Metrics, Budget Allocation. Be specific to the Nigerian market.`,

  image: (form) => `You are a creative director for a top Nigerian advertising agency. Write a detailed visual concept and art direction brief for:

Brand: ${form.brandName}
Campaign Objective: ${form.objective}
Target Audience: ${form.audience || 'Nigerian market'}
Media: ${form.media.join(', ') || 'Multi-channel'}
Notes: ${form.notes || 'None'}

Provide:
1. Visual Concept — the big idea in 2-3 sentences
2. Art Direction — colour palette, typography direction, photography style
3. Key Visual Description — describe the hero image in detail
4. **AI Image Prompt**
[Write a detailed Midjourney/DALL-E prompt that would generate the hero visual. Be specific about lighting, composition, style, mood, and Nigerian market context.]
5. Executions — how this looks across TV, OOH, digital`,

  audio: (form) => `You are a Nigerian radio copywriter. Write radio scripts for:

Brand: ${form.brandName}
Objective: ${form.objective}
Target Audience: ${form.audience || 'Lagos market'}
Key Message: ${form.notes || 'Awareness and consideration'}
Tone: Professional yet relatable, culturally resonant

Write:
1. 30-SECOND SCRIPT
[VOICEOVER]: [script here]
[SFX]: [sound effects]
[TAG]: [end line/CTA]

2. 60-SECOND SCRIPT
[VOICEOVER]: [script here]
[SFX]: [sound effects]
[TAG]: [end line/CTA]

Use natural Nigerian English. Avoid clichés. Make it memorable.`,

  video: (form) => `You are a Nigerian TVC director and copywriter. Write a detailed TV commercial script and storyboard for:

Brand: ${form.brandName}
Objective: ${form.objective}
Target Audience: ${form.audience || 'Nigerian market'}
Duration: 30 seconds
Tone: ${form.notes || 'Aspirational and culturally authentic'}

Provide:
1. CONCEPT — one paragraph
2. STORYBOARD TABLE
| Scene | Duration | Visual | Audio/VO | Transition |
|-------|----------|--------|----------|------------|
[4-6 scenes]
3. FULL SCRIPT with director's notes
4. CAST & LOCATION notes`,
};

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = { hidden:{ opacity:0, y:12 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.22,1,0.36,1] } } };

export default function BriefGenerator() {
  const { user }                        = useAuth();
  const [activeTool, setActiveTool]     = useState('brief');
  const [form, setForm]                 = useState({ brandName:'', objective:'Brand Awareness', audience:'', budget:'', duration:'', media:[], notes:'' });
  const [generating, setGenerating]     = useState(false);
  const [outputs, setOutputs]           = useState({});
  const [error, setError]               = useState('');
  const [imgUrl, setImgUrl]             = useState('');
  const [imgLoading, setImgLoading]     = useState(false);
  const [showImgGen, setShowImgGen]     = useState(false);
  const [audioUrl, setAudioUrl]         = useState('');
  const [showAudioGen, setShowAudioGen] = useState(false);
  const [videoFrames, setVideoFrames]   = useState([]);
  const [showVideoGen, setShowVideoGen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const setF = (k,v) => setForm(f => ({...f,[k]:v}));
  const toggleMedia = (m) => setForm(f => ({ ...f, media: f.media.includes(m) ? f.media.filter(x=>x!==m) : [...f.media,m] }));
  const switchTool = (key) => { setActiveTool(key); setShowImgGen(false); setShowAudioGen(false); setShowVideoGen(false); setImgUrl(''); setAudioUrl(''); setVideoFrames([]); };

  const currentOutput = outputs[activeTool] || '';

  const generate = async () => {
    if (!form.brandName.trim()) { setError('Brand name is required'); return; }
    setGenerating(true); setError('');
    try {
      const text = await callAI(PROMPTS[activeTool](form));
      setOutputs(prev => ({ ...prev, [activeTool]:text }));
    } catch(e) { setError('Generation failed. Please try again.'); }
    finally { setGenerating(false); }
  };

  const generateImage = async () => {
    setImgLoading(true); setImgUrl('');
    try {
      const tag   = '**AI Image Prompt**';
      const idx   = currentOutput.indexOf(tag);
      let prompt  = '';
      if (idx !== -1) {
        const after = currentOutput.slice(idx + tag.length).replace(/^[:\s]+/, '');
        const end   = after.search(/\n\n|\n\*\*/);
        prompt      = end !== -1 ? after.slice(0, end).trim() : after.slice(0, 500).trim();
      }
      if (!prompt) prompt = `${form.brandName} advertising campaign, Nigerian market, professional photography, commercial style`;
      const encoded = encodeURIComponent(prompt + ', high quality, commercial advertising photography');
      setImgUrl(`https://image.pollinations.ai/prompt/${encoded}?width=1024&height=576&nologo=true&model=flux&seed=${Date.now()}`);
    } catch(e) { console.error(e); }
    finally { setImgLoading(false); }
  };

  const generateAudio = async () => {
    const voTag = '[VOICEOVER]:';
    const voIdx = currentOutput.indexOf(voTag);
    let text    = '';
    if (voIdx !== -1) {
      const afterTag = currentOutput.slice(voIdx + voTag.length).trim();
      text = afterTag.split('\n')[0].trim();
    }
    if (!text) text = currentOutput.slice(0, 300);
    const encoded = encodeURIComponent(text);
    setAudioUrl('https://tts.voiceovermaking.com/tts?text=' + encoded + '&lang=en&voice=en-NG-EzinneNeural');
  };

  const generateVideoFrames = async () => {
    setVideoLoading(true); setVideoFrames([]);
    try {
      const scenes = [];
      const rows = currentOutput.match(/\|\s*\d+\s*\|([^|]+)\|([^|]+)\|([^|]+)\|/g) || [];
      rows.slice(0,4).forEach((row, i) => {
        const parts = row.split('|').map(p=>p.trim()).filter(Boolean);
        if (parts.length >= 3) scenes.push({ visual:parts[1], audio:parts[2], n:i+1 });
      });
      if (scenes.length === 0) {
        for (let i=1;i<=4;i++) scenes.push({ visual:`Scene ${i} of ${form.brandName} TVC, Nigeria`, n:i });
      }
      const frames = scenes.map(s => ({
        url:`https://image.pollinations.ai/prompt/${encodeURIComponent(s.visual + ', Nigerian TV commercial, cinematic, 16:9')}?width=896&height=504&nologo=true&model=flux&seed=${Date.now()+s.n}`,
        scene:s,
      }));
      setVideoFrames(frames);
    } catch(e) { console.error(e); }
    finally { setVideoLoading(false); }
  };

  const inp = { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', padding:'8px 0', fontSize:13, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none', transition:'border-color 0.2s', borderRadius:0 };
  const focusAmber = (e) => e.target.style.borderBottomColor = 'var(--amber)';
  const blurBorder = (e) => e.target.style.borderBottomColor = 'var(--border)';

  return (
    <>
      <PageTitle title="AI Brief Generator"/>
      <Layout title="Brief Generator" subtitle="AI Campaign Tools">
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start' }}>

          {/* Left — form */}
          <motion.div variants={fadeUp} style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Tool selector */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:1, background:'var(--border)' }}>
              {TOOLS.map(t => (
                <button key={t.key} onClick={() => switchTool(t.key)}
                  style={{ padding:'12px 14px', background: activeTool===t.key ? 'var(--bg3)' : 'var(--bg2)', border:'none', cursor:'pointer', textAlign:'left', borderTop: activeTool===t.key ? `2px solid ${t.color}` : '2px solid transparent', transition:'all 0.15s' }}>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:12, color: activeTool===t.key ? t.color : 'var(--text2)', marginBottom:2 }}>
                    {t.icon} {t.label}
                  </div>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)' }}>{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="page-card" style={{ padding:'20px' }}>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16 }}>Campaign Details</div>
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <div>
                  <label className="form-label">Brand Name *</label>
                  <input style={inp} placeholder="e.g. Indomie Nigeria" value={form.brandName} onChange={e=>setF('brandName',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}/>
                </div>
                <div>
                  <label className="form-label">Campaign Objective</label>
                  <select value={form.objective} onChange={e=>setF('objective',e.target.value)}
                    style={{ ...inp, background:'transparent', cursor:'pointer' }} onFocus={focusAmber} onBlur={blurBorder}>
                    {OBJECTIVES.map(o=><option key={o} value={o} style={{ background:'#0e0e16' }}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Audience</label>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:4 }}>
                    {AUDIENCES.map(a => (
                      <button key={a} type="button" onClick={() => setF('audience', a)}
                        style={{ padding:'4px 10px', fontFamily:'IBM Plex Mono,monospace', fontSize:9, letterSpacing:'0.06em', cursor:'pointer', border:'none', textTransform:'uppercase', transition:'all 0.15s',
                          background: form.audience===a ? 'var(--amber-dim)' : 'rgba(255,255,255,0.04)',
                          color:      form.audience===a ? 'var(--amber)' : 'var(--text3)',
                          outline:    form.audience===a ? '1px solid var(--amber-border)' : '1px solid var(--border)',
                        }}>{a}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label className="form-label">Budget</label>
                    <input style={inp} placeholder="₦5M – ₦10M" value={form.budget} onChange={e=>setF('budget',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}/>
                  </div>
                  <div>
                    <label className="form-label">Duration</label>
                    <input style={inp} placeholder="4 weeks" value={form.duration} onChange={e=>setF('duration',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}/>
                  </div>
                </div>
                <div>
                  <label className="form-label">Preferred Media</label>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:4 }}>
                    {MEDIA_OPTIONS.map(m => (
                      <button key={m} type="button" onClick={() => toggleMedia(m)}
                        style={{ padding:'4px 10px', fontFamily:'IBM Plex Mono,monospace', fontSize:9, letterSpacing:'0.06em', cursor:'pointer', border:'none', textTransform:'uppercase', transition:'all 0.15s',
                          background: form.media.includes(m) ? 'var(--amber-dim)' : 'rgba(255,255,255,0.04)',
                          color:      form.media.includes(m) ? 'var(--amber)' : 'var(--text3)',
                          outline:    form.media.includes(m) ? '1px solid var(--amber-border)' : '1px solid var(--border)',
                        }}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Additional Notes</label>
                  <textarea rows={2} placeholder="Tone, constraints, key messages…" value={form.notes} onChange={e=>setF('notes',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}
                    style={{ ...inp, resize:'vertical', fontFamily:'Inter,sans-serif' }}/>
                </div>
                {error && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#fca5a5' }}>{error}</p>}
                <button onClick={generate} disabled={generating} className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:11 }}>
                  {generating ? <><Spinner size={12}/>Generating…</> : `✧ Generate ${TOOLS.find(t=>t.key===activeTool)?.label}`}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right — output */}
          <motion.div variants={fadeUp} style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* Output card */}
            <AnimatePresence mode="wait">
              {!currentOutput && !generating && (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ padding:'40px', border:'1px solid var(--border)', textAlign:'center', borderStyle:'dashed' }}>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text4)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>Output</div>
                  <p style={{ fontSize:12, color:'var(--text3)', lineHeight:1.7 }}>Fill in the campaign details and click Generate to create your brief.</p>
                </motion.div>
              )}
              {generating && (
                <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ padding:'40px', border:'1px solid var(--amber-border)', textAlign:'center', background:'var(--amber-dim)' }}>
                  <Spinner size={20}/>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--amber)', marginTop:14, letterSpacing:'0.1em', textTransform:'uppercase' }}>Generating…</p>
                </motion.div>
              )}
              {currentOutput && !generating && (
                <motion.div key="output" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
                  className="page-card" style={{ padding:'20px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase' }}>
                      {TOOLS.find(t=>t.key===activeTool)?.label}
                    </div>
                    <button onClick={() => navigator.clipboard?.writeText(currentOutput).then(() => alert('Copied!'))}
                      className="btn-secondary" style={{ fontSize:9, padding:'4px 10px' }}>Copy</button>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text2)', lineHeight:1.9, whiteSpace:'pre-wrap', maxHeight:400, overflowY:'auto', fontFamily:'IBM Plex Mono,monospace' }}>
                    {currentOutput}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image generator */}
            {activeTool === 'image' && currentOutput && !showImgGen && (
              <button onClick={() => setShowImgGen(true)} className="btn-secondary" style={{ width:'100%', justifyContent:'center', fontSize:10 }}>
                ▦ Generate Ad Visual
              </button>
            )}
            {activeTool === 'image' && currentOutput && showImgGen && (
              <div className="page-card" style={{ padding:'16px' }}>
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>Ad Visual Preview</div>
                <button onClick={generateImage} disabled={imgLoading} className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:10, marginBottom:imgUrl?12:0 }}>
                  {imgLoading ? <><Spinner size={11}/>Generating visual…</> : '▦ Generate Visual'}
                </button>
                {imgUrl && (
                  <div>
                    <img src={imgUrl} alt="AI generated ad visual" style={{ width:'100%', display:'block', borderTop:'1px solid var(--border)' }}
                      onError={e => e.target.style.display='none'}/>
                    <a href={imgUrl} download="ad-visual.jpg" className="btn-secondary" style={{ display:'block', textAlign:'center', textDecoration:'none', fontSize:10, marginTop:8 }}>
                      Download Image
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Audio generator */}
            {activeTool === 'audio' && currentOutput && !showAudioGen && (
              <button onClick={() => { setShowAudioGen(true); generateAudio(); }} className="btn-secondary" style={{ width:'100%', justifyContent:'center', fontSize:10 }}>
                ◎ Generate Audio Preview
              </button>
            )}
            {activeTool === 'audio' && currentOutput && showAudioGen && audioUrl && (
              <div className="page-card" style={{ padding:'16px' }}>
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>Audio Preview</div>
                <audio controls src={audioUrl} style={{ width:'100%' }}/>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:8 }}>Preview from voiceover text. Use a professional artist for final production.</p>
              </div>
            )}

            {/* Video storyboard */}
            {activeTool === 'video' && currentOutput && !showVideoGen && (
              <button onClick={() => setShowVideoGen(true)} className="btn-secondary" style={{ width:'100%', justifyContent:'center', fontSize:10 }}>
                ▣ Generate Storyboard Frames
              </button>
            )}
            {activeTool === 'video' && currentOutput && showVideoGen && (
              <div className="page-card" style={{ padding:'16px' }}>
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>Storyboard Frames</div>
                <button onClick={generateVideoFrames} disabled={videoLoading} className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:10, marginBottom:videoFrames.length?12:0 }}>
                  {videoLoading ? <><Spinner size={11}/>Generating…</> : '▣ Generate Frames'}
                </button>
                {videoFrames.length > 0 && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                    {videoFrames.map((frame,i) => (
                      <div key={i} style={{ border:'1px solid var(--border)', overflow:'hidden' }}>
                        <div style={{ position:'relative', aspectRatio:'16/9', background:'var(--bg3)' }}>
                          <img src={frame.url} alt={`Scene ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e=>e.target.style.display='none'}/>
                          <div style={{ position:'absolute', top:4, left:4, fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--amber)', background:'rgba(0,0,0,0.8)', padding:'2px 6px' }}>
                            Scene {i+1}
                          </div>
                        </div>
                        {frame.scene?.audio && (
                          <div style={{ padding:'6px 8px', background:'var(--bg2)' }}>
                            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', lineHeight:1.5 }}>
                              {frame.scene.audio.slice(0,70)}{frame.scene.audio.length>70?'…':''}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </Layout>
    </>
  );
}