import { useState } from 'react';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`,'Content-Type':'application/json'}:{}; };

const TOOLS      = [{key:'brief',label:'Campaign Brief'},{key:'image',label:'Ad Visual Concept'},{key:'audio',label:'Radio Script'},{key:'video',label:'TV/Video Script'}];
const OBJECTIVES = ['Brand Awareness','Product Launch','Sales Conversion','Lead Generation','Event Promotion'];
const MEDIA_OPT  = ['TV','Radio','OOH Billboards','Podcasts','Influencers','Social Media','Print','Live Streaming'];
const AUDIENCES  = ['Youth (18-25)','Young Adults (26-35)','Adults (36-50)','Mass Market','Urban Professional'];

const PROMPTS = {
  brief: f => `Write a comprehensive Nigerian media campaign brief for: Brand: ${f.brand}, Objective: ${f.objective}, Audience: ${f.audience||'General Nigerian market'}, Budget: ${f.budget||'TBD'}, Duration: ${f.duration||'4 weeks'}, Media: ${f.media.join(', ')||'All channels'}. Include: Executive Summary, Objectives, Target Audience Analysis, Media Mix, Creative Direction, KPIs.`,
  image: f => `Write a visual concept and AI image prompt for: Brand: ${f.brand}, Campaign: ${f.objective}, Audience: ${f.audience}. Include: visual concept, art direction, key visual description, and a detailed Midjourney/DALL-E prompt.`,
  audio: f => `Write 30-second and 60-second radio scripts for: Brand: ${f.brand}, Objective: ${f.objective}. Include VOICEOVER, SFX, and TAG lines. Use natural Nigerian English.`,
  video: f => `Write a 30-second Nigerian TVC storyboard for: Brand: ${f.brand}, Objective: ${f.objective}. Include concept, storyboard table, full script, and cast/location notes.`,
};

const inp = {width:'100%',border:'1px solid #e1e4f0',padding:'9px 12px',fontFamily:'Inter,sans-serif',fontSize:12,outline:'none',boxSizing:'border-box',marginBottom:12,borderRadius:0};

export default function BriefGenerator() {
  const [tool, setTool]         = useState('brief');
  const [form, setForm]         = useState({brand:'',objective:'Brand Awareness',audience:'',budget:'',duration:'',media:[],notes:''});
  const [generating, setGen]    = useState(false);
  const [outputs, setOutputs]   = useState({});
  const [error, setError]       = useState('');

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleM = m => setForm(f=>({...f,media:f.media.includes(m)?f.media.filter(x=>x!==m):[...f.media,m]}));

  const generate = async () => {
    if(!form.brand.trim()){setError('Brand name is required');return;}
    setGen(true);setError('');
    try {
      const hd = await h();
      const res = await axios.post(`${API}/ai/generate`,{prompt:PROMPTS[tool](form),max_tokens:1500},{headers:hd});
      setOutputs(prev=>({...prev,[tool]:res.data?.text||''}));
    } catch(e){setError('Generation failed. Please try again.');}
    finally{setGen(false);}
  };

  const currentOutput = outputs[tool]||'';

  return (
    <Layout title="Brief Generator" subtitle="AI Campaign Tools">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'start'}}>

        {/* Left — form */}
        <div>
          {/* Tool selector */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,background:'#e1e4f0',marginBottom:16}}>
            {TOOLS.map(t=>(
              <button key={t.key} onClick={()=>setTool(t.key)}
                style={{padding:'12px',background:tool===t.key?'#4338ca':'white',color:tool===t.key?'white':'#464554',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',textAlign:'left',borderTop:tool===t.key?'2px solid #3730a3':'2px solid transparent'}}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{background:'white',border:'1px solid #e1e4f0',padding:20}}>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#464554',marginBottom:16}}>Campaign Details</div>

            <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Brand Name *</label>
            <input style={inp} placeholder="e.g. Indomie Nigeria" value={form.brand} onChange={e=>setF('brand',e.target.value)}/>

            <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Objective</label>
            <select value={form.objective} onChange={e=>setF('objective',e.target.value)} style={{...inp,background:'white',cursor:'pointer'}}>
              {OBJECTIVES.map(o=><option key={o}>{o}</option>)}
            </select>

            <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Target Audience</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
              {AUDIENCES.map(a=>(
                <button key={a} type="button" onClick={()=>setF('audience',a)}
                  style={{padding:'4px 10px',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer',border:'none',background:form.audience===a?'#eef2ff':'#f2f3ff',color:form.audience===a?'#4338ca':'#464554',outline:form.audience===a?'1px solid #c7d2fe':'none'}}>
                  {a}
                </button>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:0}}>
              <div>
                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Budget</label>
                <input style={inp} placeholder="₦5M – ₦10M" value={form.budget} onChange={e=>setF('budget',e.target.value)}/>
              </div>
              <div>
                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Duration</label>
                <input style={inp} placeholder="4 weeks" value={form.duration} onChange={e=>setF('duration',e.target.value)}/>
              </div>
            </div>

            <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Preferred Media</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
              {MEDIA_OPT.map(m=>(
                <button key={m} type="button" onClick={()=>toggleM(m)}
                  style={{padding:'4px 10px',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer',border:'none',background:form.media.includes(m)?'#eef2ff':'#f2f3ff',color:form.media.includes(m)?'#4338ca':'#464554',outline:form.media.includes(m)?'1px solid #c7d2fe':'none'}}>
                  {m}
                </button>
              ))}
            </div>

            <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Notes</label>
            <textarea rows={2} style={{...inp,resize:'vertical',fontFamily:'Inter,sans-serif'}} placeholder="Tone, constraints, key messages…" value={form.notes} onChange={e=>setF('notes',e.target.value)}/>

            {error&&<div style={{padding:'8px 10px',background:'#fef2f2',border:'1px solid #fecaca',fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#dc2626',marginBottom:10}}>{error}</div>}

            <button onClick={generate} disabled={generating}
              style={{width:'100%',padding:'11px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:'pointer'}}>
              {generating?'Generating…':`Generate ${TOOLS.find(t2=>t2.key===tool)?.label}`}
            </button>
          </div>
        </div>

        {/* Right — output */}
        <div style={{background:'white',border:'1px solid #e1e4f0',padding:20}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#4338ca'}}>{TOOLS.find(t2=>t2.key===tool)?.label||'Output'}</div>
            {currentOutput&&<button onClick={()=>navigator.clipboard?.writeText(currentOutput).then(()=>alert('Copied!'))} style={{padding:'4px 10px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.06em',background:'transparent',cursor:'pointer'}}>Copy</button>}
          </div>
          {!currentOutput&&!generating&&(
            <div style={{border:'1px dashed #e1e4f0',padding:'48px 24px',textAlign:'center'}}>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586',letterSpacing:'0.1em',textTransform:'uppercase'}}>Fill in details and click Generate</div>
            </div>
          )}
          {generating&&(
            <div style={{border:'1px solid #e1e4f0',padding:'48px 24px',textAlign:'center',background:'#faf8ff'}}>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#4338ca',textTransform:'uppercase',letterSpacing:'0.1em'}}>Generating…</div>
            </div>
          )}
          {currentOutput&&!generating&&(
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'#131b2e',lineHeight:1.9,whiteSpace:'pre-wrap',maxHeight:500,overflowY:'auto',padding:4}}>{currentOutput}</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
