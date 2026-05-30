import { useState } from 'react';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OBJECTIVES    = ['Brand Awareness','Product Launch','Sales Conversion','Lead Generation','Event Promotion','Brand Recall'];
const MEDIA_OPTIONS = ['TV','Radio','OOH Billboards','Podcasts','Influencers','Social Media','Print','Live Streaming'];
const AUDIENCES     = ['Youth (18–25)','Young Adults (26–35)','Adults (36–50)','Mass Market','Urban Professional','Students','Parents'];

const TOOLS = [
  { key:'brief',  icon:'✧', label:'Campaign Brief',   color:'#a5b4fc', desc:'Full strategic campaign brief'    },
  { key:'image',  icon:'🖼', label:'Ad Visual Concept',color:'#f472b6', desc:'Visual direction & image prompt'  },
  { key:'audio',  icon:'🎙', label:'Radio Script',     color:'#5eead4', desc:'30s & 60s voiceover scripts'      },
  { key:'video',  icon:'🎬', label:'TV/Video Script',  color:'#fcd34d', desc:'TVC script with full storyboard'  },
];

const API = import.meta.env.VITE_API_URL;

const callClaude = async (prompt) => {
  const { auth } = await import('../lib/firebase');
  const token = await auth.currentUser?.getIdToken();
  const headers = { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) };
  const res = await axios.post(`${API}/ai/generate`, { prompt, max_tokens:1500 }, { headers });
  return res.data?.text || '';
};

export default function BriefGenerator() {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState('brief');
  const [form, setForm] = useState({ brandName:'', objective:'Brand Awareness', audience:'', budget:'', duration:'', media:[], notes:'' });
  const [generating, setGenerating]   = useState(false);
  const [outputs, setOutputs]         = useState({});
  const [error, setError]             = useState('');
  const [imgPrompt, setImgPrompt]     = useState('');
  const [imgLoading, setImgLoading]   = useState(false);
  const [imgUrl, setImgUrl]           = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl]         = useState('');
  const [videoFrames, setVideoFrames]   = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [showAudioGen, setShowAudioGen] = useState(false);
  const [showImgGen, setShowImgGen]   = useState(false);
  const [showVideoGen, setShowVideoGen] = useState(false);

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleMedia = (m) => setForm(f=>({ ...f, media: f.media.includes(m) ? f.media.filter(x=>x!==m) : [...f.media,m] }));
  const switchTool = (key) => { setActiveTool(key); setShowAudioGen(false); setShowVideoGen(false); setShowImgGen(false); setAudioUrl(''); setVideoFrames([]); setImgUrl(''); };

  const context = () => `
Brand: ${form.brandName}
Objective: ${form.objective}
Target Audience: ${form.audience||'General Nigerian market'}
Budget: ${form.budget||'To be determined'}
Duration: ${form.duration||'4 weeks'}
Media Channels: ${form.media.length?form.media.join(', '):'All channels'}
Notes: ${form.notes||'None'}`.trim();

  const PROMPTS = {
    brief: () => `You are a Nigerian media campaign strategist. Generate a professional, detailed campaign brief for the following:

${context()}

Write a comprehensive campaign brief including: Executive Summary, Campaign Objectives, Target Audience Analysis, Recommended Media Mix with rationale, Creative Direction suggestions, KPIs and Success Metrics, and Budget Allocation guidance. Format it professionally with clear sections.`,

    image: () => `You are a Nigerian advertising creative director. Generate a detailed visual concept and AI image prompt for a campaign ad with the following details:

${context()}

Respond with:
1. **Visual Concept** — Describe the ad visual in 2–3 sentences. What does it show? What emotion does it evoke? What is the setting?
2. **Art Direction Notes** — Color palette, typography mood, photography style (e.g. lifestyle, product-forward, cinematic), lighting.
3. **Tagline** — A punchy, memorable tagline for the campaign.
4. **AI Image Prompt** — Write a detailed, ready-to-use prompt for an AI image generator (Midjourney / DALL·E / Stable Diffusion style). Make it specific: subject, setting, lighting, style, mood, aspect ratio.
5. **Platform Variants** — Brief notes on how to adapt the visual for Instagram (square), TikTok (vertical), Billboard (horizontal).`,

    audio: () => `You are a Nigerian radio copywriter and voiceover director. Write radio ad scripts for the following campaign:

${context()}

Write TWO radio scripts:

**30-SECOND SCRIPT:**
[SFX/MUSIC CUE]: ...
[VOICEOVER]: ...
[TAGLINE]: ...

**60-SECOND SCRIPT:**
[SFX/MUSIC CUE]: ...
[VOICEOVER]: ...
[TAGLINE]: ...

After each script include:
- Tone notes (e.g. energetic, warm, authoritative)
- Suggested voice type (male/female, accent notes)
- Music bed suggestion

Keep the language natural for Nigerian audiences. Include pidgin or local expressions where appropriate.`,

    video: () => `You are a Nigerian TVC director and scriptwriter. Write a full TV commercial script and storyboard for the following campaign:

${context()}

Format the output as:

**CONCEPT TITLE:**
**DURATION:** 30 seconds (or 60 seconds if appropriate)
**TONE:**
**HOOK (Opening 3 seconds):**

**STORYBOARD:**

| Scene | Visual | Audio / VO | Duration |
|-------|--------|------------|----------|
| 1     | ...    | ...        | 0–5s     |
| ...   |        |            |          |

**SCRIPT (Full VO):**
...

**SUPER (On-screen text):**
...

**END CARD:**
Brand logo + tagline + CTA

**DIRECTOR'S NOTES:**
Shooting style, colour grade, locations, cast direction.`,
  };

  const generate = async () => {
    if(!form.brandName.trim()){ setError('Brand name is required'); return; }
    setGenerating(true); setError('');
    try {
      const text = await callClaude(PROMPTS[activeTool]());
      setOutputs(o=>({...o,[activeTool]:text}));
    } catch(e){ setError('Generation failed. Please try again.'); }
    finally{ setGenerating(false); }
  };

  const generateImage = async () => {
    if(!imgPrompt.trim()){ return; }
    setImgLoading(true); setImgUrl('');
    try {
      // Use Pollinations.ai — free, no API key needed
      const encoded = encodeURIComponent(imgPrompt.trim());
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=576&nologo=true&model=flux`;
      setImgUrl(url);
    } catch(e){ console.error(e); }
    finally{ setImgLoading(false); }
  };

  // Generate audio from radio script using TTS
  const generateAudio = async () => {
    const script = outputs['audio'];
    if(!script) return;
    setAudioLoading(true); setAudioUrl('');
    try {
      // Extract the 30s voiceover text using string split
      const voTag = '[VOICEOVER]:';
      const voIdx = script.indexOf(voTag);
      let text = '';
      if(voIdx !== -1) {
        const afterTag = script.slice(voIdx + voTag.length).trim();
        text = afterTag.split('\n')[0].trim();
      }
      if(!text) text = script.slice(0, 300);
      const encoded = encodeURIComponent(text);
      setAudioUrl('https://tts.voiceovermaking.com/tts?text=' + encoded + '&lang=en&voice=en-NG-EzinneNeural');
    } catch(e){ console.error(e); }
    finally{ setAudioLoading(false); }
  };

  // Generate video storyboard frames using Pollinations
  const generateVideoFrames = async () => {
    const script = outputs['video'];
    if(!script) return;
    setVideoLoading(true); setVideoFrames([]);
    try {
      // Extract scene descriptions from storyboard table
      const scenes = [];
      const rows = script.match(/\|\s*\d+\s*\|([^|]+)\|([^|]+)\|([^|]+)\|/g) || [];
      rows.slice(0,4).forEach((row, i) => {
        const parts = row.split('|').map(p=>p.trim()).filter(Boolean);
        if(parts.length >= 3) scenes.push({ visual: parts[1], audio: parts[2], n: i+1 });
      });

      // If no table found, make 4 generic frames
      if(scenes.length === 0) {
        for(let i=1;i<=4;i++) scenes.push({ visual:`Scene ${i} of ${form.brandName} TVC`, n:i });
      }

      // Generate image for each scene in parallel
      const frameUrls = scenes.map(s => {
        const prompt = encodeURIComponent(`${s.visual}, ${form.brandName} TV commercial, cinematic, professional advertising photography, Nigerian market, 16:9 aspect ratio, high quality`);
        return { url:`https://image.pollinations.ai/prompt/${prompt}?width=896&height=504&nologo=true&model=flux&seed=${Date.now()+s.n}`, scene:s };
      });
      setVideoFrames(frameUrls);
    } catch(e){ console.error(e); }
    finally{ setVideoLoading(false); }
  };

  // When image concept is generated, auto-extract the AI prompt
  const imageOutput = outputs['image'] || '';
  const extractedPrompt = (() => {
    const tag = '**AI Image Prompt**';
    const idx = imageOutput.indexOf(tag);
    if(idx === -1) return '';
    const after = imageOutput.slice(idx + tag.length).replace(/^[:\s]+/, '');
    const end = after.search(/\n\n|\n\*\*/);
    return end !== -1 ? after.slice(0, end).trim() : after.slice(0, 500).trim();
  })();

  const currentOutput = outputs[activeTool] || '';
  const inp = { width:'100%', padding:'8px 11px', borderRadius:8, fontSize:12, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', fontFamily:'Inter,sans-serif' };

  return (
    <>
      <PageTitle title="AI Campaign Tools" description="Generate campaign briefs, ad concepts, radio scripts and TVC storyboards with AI."/>
      <Layout title="AI Campaign Tools" subtitle="Brief, visual, audio and video — all AI-generated for your campaign">

        {/* Tool selector */}
        <div style={{ display:'flex', gap:8, marginBottom:22, flexWrap:'wrap' }}>
          {TOOLS.map(t=>(
            <button key={t.key} onClick={()=>switchTool(t.key)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:10, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', transition:'all 0.15s',
                background: activeTool===t.key ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                outline: `${activeTool===t.key?'1':'0.5'}px solid ${activeTool===t.key?t.color+'55':'var(--border)'}`,
              }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              <div style={{ textAlign:'left' }}>
                <p style={{ fontSize:12, fontWeight:600, color:activeTool===t.key?t.color:'white', lineHeight:1.2 }}>{t.label}</p>
                <p style={{ fontSize:10, color:'var(--text-muted)' }}>{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

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
                <select value={form.objective} onChange={e=>setF('objective',e.target.value)} style={{ ...inp, background:'#0d0d18' }}>
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
                <textarea rows={2} style={{ ...inp, resize:'vertical' }} placeholder="Tone, constraints, specific requirements…"
                  value={form.notes} onChange={e=>setF('notes',e.target.value)}/>
              </div>
              {error && <p style={{ color:'#fca5a5', fontSize:11 }}>{error}</p>}

              {/* Generate button */}
              <button onClick={generate} disabled={generating} className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding:'10px', fontSize:13 }}>
                {generating
                  ? <><Spinner size={13}/>Generating {TOOLS.find(t=>t.key===activeTool)?.label}…</>
                  : `${TOOLS.find(t=>t.key===activeTool)?.icon} Generate ${TOOLS.find(t=>t.key===activeTool)?.label}`}
              </button>

              {/* Quick switch hints */}
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', paddingTop:4 }}>
                {TOOLS.filter(t=>t.key!==activeTool&&outputs[t.key]).map(t=>(
                  <button key={t.key} onClick={()=>switchTool(t.key)}
                    style={{ fontSize:10, fontWeight:500, padding:'3px 9px', borderRadius:20, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif', background:'rgba(255,255,255,0.05)', color:'var(--text-muted)', outline:'0.5px solid var(--border)' }}>
                    View {t.label} ↗
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output panel */}
          <div className="space-y-4">

            {/* Empty state */}
            {!currentOutput && !generating && (
              <div style={{ padding:'36px 24px', borderRadius:10, background:'var(--bg-card)', border:'0.5px dashed rgba(99,102,241,0.25)', textAlign:'center' }}>
                <p style={{ fontSize:28, marginBottom:12 }}>{TOOLS.find(t=>t.key===activeTool)?.icon}</p>
                <p style={{ fontWeight:500, color:'white', fontSize:13, marginBottom:6 }}>{TOOLS.find(t=>t.key===activeTool)?.label}</p>
                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6, maxWidth:280, margin:'0 auto' }}>
                  {activeTool==='brief'  && 'Fill in your campaign details and generate a full strategic brief.'}
                  {activeTool==='image'  && 'Generate a visual concept, art direction notes and a ready-to-use AI image prompt.'}
                  {activeTool==='audio'  && 'Generate 30s and 60s radio scripts with tone and music bed notes.'}
                  {activeTool==='video'  && 'Generate a full TVC script with scene-by-scene storyboard.'}
                </p>
              </div>
            )}

            {/* Generating */}
            {generating && (
              <div style={{ padding:'36px', borderRadius:10, background:'var(--bg-card)', border:'0.5px solid var(--accent-border)', textAlign:'center' }}>
                <Spinner size={22}/>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:14 }}>
                  {activeTool==='brief'  && 'Crafting your campaign brief…'}
                  {activeTool==='image'  && 'Developing your visual concept…'}
                  {activeTool==='audio'  && 'Writing your radio scripts…'}
                  {activeTool==='video'  && 'Building your TVC storyboard…'}
                </p>
              </div>
            )}

            {/* Output */}
            {currentOutput && !generating && (
              <div className="page-card" style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>{TOOLS.find(t=>t.key===activeTool)?.icon}</span>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white' }}>{TOOLS.find(t=>t.key===activeTool)?.label}</p>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={generate} disabled={generating} className="btn-secondary" style={{ fontSize:11, padding:'4px 10px' }}>↻ Redo</button>
                    <button onClick={()=>navigator.clipboard?.writeText(currentOutput)} className="btn-secondary" style={{ fontSize:11, padding:'4px 10px' }}>Copy</button>
                  </div>
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.72)', lineHeight:1.95, whiteSpace:'pre-wrap', maxHeight:440, overflowY:'auto' }}>
                  {currentOutput}
                </div>
              </div>
            )}

            {/* Audio player — optional, shown on request */}
            {activeTool==='audio' && currentOutput && !showAudioGen && (
              <button onClick={()=>setShowAudioGen(true)}
                style={{ width:'100%', padding:'10px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', background:'rgba(94,234,212,0.07)', border:'0.5px solid rgba(94,234,212,0.2)', color:'#5eead4', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                🎙 Generate Audio Preview
              </button>
            )}
            {activeTool==='audio' && currentOutput && showAudioGen && (
              <div className="page-card" style={{ padding:'18px 20px' }}>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white', marginBottom:8 }}>🎙 Preview Radio Script Audio</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12, lineHeight:1.6 }}>Generate a spoken audio preview of your 30s radio voiceover to share with your team or client.</p>
                <button onClick={generateAudio} disabled={audioLoading}
                  className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:12, padding:'9px', marginBottom:audioUrl?12:0 }}>
                  {audioLoading ? <><Spinner size={12}/>Generating audio…</> : '🎙 Generate Audio Preview'}
                </button>
                {audioUrl && (
                  <div style={{ padding:'12px 14px', borderRadius:9, background:'rgba(94,234,212,0.06)', border:'0.5px solid rgba(94,234,212,0.18)' }}>
                    <p style={{ fontSize:11, color:'#5eead4', fontWeight:600, marginBottom:8 }}>Audio Preview</p>
                    <audio controls src={audioUrl} style={{ width:'100%' }}/>
                    <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:8, lineHeight:1.5 }}>
                      Preview generated from your 30s voiceover text. For final production, record with a professional voiceover artist.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Video storyboard — optional, shown on request */}
            {activeTool==='video' && currentOutput && !showVideoGen && (
              <button onClick={()=>setShowVideoGen(true)}
                style={{ width:'100%', padding:'10px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', background:'rgba(252,211,77,0.07)', border:'0.5px solid rgba(252,211,77,0.2)', color:'#fcd34d', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                🎬 Generate Storyboard Frames
              </button>
            )}
            {activeTool==='video' && currentOutput && showVideoGen && (
              <div className="page-card" style={{ padding:'18px 20px' }}>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white', marginBottom:8 }}>🎬 Generate Storyboard Frames</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12, lineHeight:1.6 }}>Visualise your TVC scene by scene with AI-generated storyboard frames based on your script.</p>
                <button onClick={generateVideoFrames} disabled={videoLoading}
                  className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:12, padding:'9px', marginBottom:videoFrames.length?14:0 }}>
                  {videoLoading ? <><Spinner size={12}/>Generating storyboard…</> : '🎬 Generate Storyboard Frames'}
                </button>
                {videoFrames.length > 0 && (
                  <div>
                    <p style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Storyboard — {videoFrames.length} Scenes</p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                      {videoFrames.map((frame, i) => (
                        <div key={i} style={{ borderRadius:9, overflow:'hidden', border:'0.5px solid var(--border)' }}>
                          <div style={{ position:'relative', aspectRatio:'16/9', background:'rgba(255,255,255,0.03)', overflow:'hidden' }}>
                            <img src={frame.url} alt={`Scene ${i+1}`}
                              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                              onError={e=>{ e.target.style.display='none'; }}/>
                            <div style={{ position:'absolute', top:6, left:6, background:'rgba(0,0,0,0.7)', color:'white', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20 }}>
                              Scene {i+1}
                            </div>
                          </div>
                          {frame.scene?.audio && (
                            <div style={{ padding:'7px 10px', background:'rgba(255,255,255,0.025)' }}>
                              <p style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.5 }}>{frame.scene.audio.slice(0,80)}{frame.scene.audio.length>80?'…':''}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={generateVideoFrames} disabled={videoLoading} className="btn-secondary" style={{ width:'100%', fontSize:11, marginTop:10, justifyContent:'center' }}>
                      ↻ Regenerate Frames
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Image generator — optional, shown on request */}
            {activeTool==='image' && currentOutput && !showImgGen && (
              <button onClick={()=>setShowImgGen(true)}
                style={{ width:'100%', padding:'10px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', background:'rgba(244,114,182,0.07)', border:'0.5px solid rgba(244,114,182,0.2)', color:'#f472b6', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                🖼 Generate Ad Visual
              </button>
            )}
            {activeTool==='image' && currentOutput && showImgGen && (
              <div className="page-card" style={{ padding:'18px 20px' }}>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white', marginBottom:10 }}>
                  🖼 Generate the Ad Visual
                </p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10, lineHeight:1.6 }}>
                  The AI image prompt from your concept has been pre-filled. Edit it or use as-is to generate the visual.
                </p>
                <textarea rows={3} value={imgPrompt||extractedPrompt}
                  onChange={e=>setImgPrompt(e.target.value)}
                  placeholder="Paste or edit your AI image prompt here…"
                  style={{ ...inp, resize:'vertical', width:'100%', marginBottom:10, fontSize:11, lineHeight:1.7 }}/>
                <button onClick={generateImage} disabled={imgLoading}
                  className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:12, padding:'9px', marginBottom:imgUrl?14:0 }}>
                  {imgLoading ? <><Spinner size={12}/>Generating image…</> : '🖼 Generate Ad Visual'}
                </button>

                {imgUrl && (
                  <div>
                    <img
                      src={imgUrl}
                      alt="Generated ad visual"
                      onLoad={()=>setImgLoading(false)}
                      onError={()=>setImgLoading(false)}
                      style={{ width:'100%', borderRadius:10, border:'0.5px solid var(--border)', display:'block' }}
                    />
                    <div style={{ display:'flex', gap:6, marginTop:10 }}>
                      <a href={imgUrl} download="ad-visual.jpg" target="_blank" rel="noopener noreferrer"
                        className="btn-secondary" style={{ flex:1, fontSize:11, justifyContent:'center', textDecoration:'none' }}>
                        ↓ Download
                      </a>
                      <button onClick={generateImage} className="btn-secondary" style={{ flex:1, fontSize:11 }}>↻ Regenerate</button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </Layout>
    </>
  );
}