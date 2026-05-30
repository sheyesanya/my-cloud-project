import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import { Spinner, Toast } from '../components/UI';
import api from '../services/api';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const CATEGORIES = ['TELEVISION','RADIO_AUDIO','PODCASTS','OUT_OF_HOME','PRINT_MEDIA','INFLUENCERS','SOCIAL_MEDIA','MUSIC_PROMOTION','LIVE_STREAMING'];
const CAT_LABELS = { TELEVISION:'Television', RADIO_AUDIO:'Radio / Audio', PODCASTS:'Podcasts', OUT_OF_HOME:'Out of Home', PRINT_MEDIA:'Print Media', INFLUENCERS:'Influencers', SOCIAL_MEDIA:'Social Media', MUSIC_PROMOTION:'Music Promotion', LIVE_STREAMING:'Live Streaming' };
const MARKETS    = ['Lagos','Abuja','Port Harcourt','Kano','Ibadan','Enugu','Kaduna','Nationwide'];

const STEPS = ['Contact','Organisation','Reach & Audience','Bank Details'];

export default function RegisterProvider() {
  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast]         = useState(null);
  const [errors, setErrors]       = useState({});

  const [form, setForm] = useState({
    contactName:'', contactEmail:'', contactPhone:'', contactRole:'',
    orgName:'', category:'', website:'', founded:'', description:'',
    markets:[], monthlyReach:'', audienceDemo:'',
    bankName:'', accountName:'', accountNumber:'',
  });

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };
  const toggleMarket = (m) => setForm(f=>({...f,markets:f.markets.includes(m)?f.markets.filter(x=>x!==m):[...f.markets,m]}));

  const validate = () => {
    const e={};
    if (step===0){ if(!form.contactName.trim()) e.contactName='Required'; if(!form.contactEmail.trim()) e.contactEmail='Required'; else if(!/\S+@\S+\.\S+/.test(form.contactEmail)) e.contactEmail='Invalid email'; if(!form.contactPhone.trim()) e.contactPhone='Required'; }
    if (step===1){ if(!form.orgName.trim()) e.orgName='Required'; if(!form.category) e.category='Required'; if(!form.description.trim()) e.description='Required'; }
    if (step===2){ if(!form.markets.length) e.markets='Select at least one market'; }
    return e;
  };

  const next = () => { const errs=validate(); if(Object.keys(errs).length){setErrors(errs);return;} setStep(s=>s+1); };

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/providers/apply',{...form,status:'PENDING_REVIEW',appliedAt:new Date().toISOString()});
      setSubmitted(true);
    } catch(e){ setToast({type:'error',message:e.message}); setTimeout(()=>setToast(null),3500); }
    finally{ setLoading(false); }
  };

  const inp = (field) => ({
    width:'100%', background:'transparent', border:'none', borderBottom:`1px solid ${errors[field]?'rgba(239,68,68,0.5)':'var(--border)'}`, padding:'8px 0', fontSize:13, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none', transition:'border-color 0.2s', borderRadius:0,
  });
  const focusAmber = (e) => e.target.style.borderBottomColor='var(--amber)';
  const blurBorder = (e,field) => e.target.style.borderBottomColor=errors[field]?'rgba(239,68,68,0.5)':'var(--border)';

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
        <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:16 }}>Application Submitted</div>
        <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:26, color:'var(--text)', marginBottom:10, letterSpacing:'-0.5px' }}>You are on the list.</h1>
        <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.75, marginBottom:24 }}>
          We have received your application for <strong style={{color:'var(--text)'}}>{form.orgName}</strong>. Our team will review it and respond to <strong style={{color:'var(--text)'}}>{form.contactEmail}</strong> within 2–3 business days.
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration:'none', fontSize:11 }}>Back to Home →</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      <PageTitle title="Apply as Provider"/>
      {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

      {/* Progress bar */}
      <div style={{ height:2, background:'var(--border)' }}>
        <motion.div animate={{ width:`${((step+1)/STEPS.length)*100}%` }} transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ height:'100%', background:'var(--amber)' }}/>
      </div>

      {/* Header */}
      <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
        <img src={LOGO} alt="BrandCasta" style={{ width:24, height:24, objectFit:'contain' }}/>
        <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color:'var(--text)' }}>BrandCasta</span>
        <span style={{ marginLeft:'auto', fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Provider Application</span>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'40px 20px' }}>
        <div style={{ width:'100%', maxWidth:560 }}>

          {/* Step header */}
          <div style={{ marginBottom:28, position:'relative' }}>
            <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:900, fontSize:72, color:'rgba(99,102,241,0.05)', position:'absolute', top:-14, left:-6, lineHeight:1, userSelect:'none', pointerEvents:'none', letterSpacing:'-3px' }}>
              {String(step+1).padStart(2,'0')}
            </div>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:5 }}>
              Step {step+1} of {STEPS.length}
            </div>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:22, color:'var(--text)', letterSpacing:'-0.4px' }}>{STEPS[step]}</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:16 }} transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}>

              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', padding:24, marginBottom:16 }}>

                {/* Step 0 — Contact */}
                {step===0&&(
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    {[['Full Name *','contactName','text','Adaeze Okonkwo'],['Email *','contactEmail','email','adaeze@company.ng'],['Phone *','contactPhone','tel','+234 801 234 5678'],['Role / Title','contactRole','text','Head of Commercial']].map(([label,key,type,ph])=>(
                      <div key={key}>
                        <label className="form-label">{label}</label>
                        <input type={type} style={inp(key)} placeholder={ph} value={form[key]} onChange={e=>set(key,e.target.value)} onFocus={focusAmber} onBlur={e=>blurBorder(e,key)}/>
                        {errors[key]&&<p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#fca5a5',marginTop:3 }}>{errors[key]}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 1 — Organisation */}
                {step===1&&(
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    <div>
                      <label className="form-label">Organisation Name *</label>
                      <input style={inp('orgName')} placeholder="Cool FM Lagos" value={form.orgName} onChange={e=>set('orgName',e.target.value)} onFocus={focusAmber} onBlur={e=>blurBorder(e,'orgName')}/>
                      {errors.orgName&&<p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#fca5a5',marginTop:3 }}>{errors.orgName}</p>}
                    </div>
                    <div>
                      <label className="form-label">Category *</label>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                        {CATEGORIES.map(c=>(
                          <button key={c} type="button" onClick={()=>set('category',c)}
                            style={{ padding:'8px 6px', textAlign:'center', cursor:'pointer', fontFamily:'IBM Plex Mono,monospace', fontSize:9, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all 0.15s', border:'none',
                              background:form.category===c?'var(--amber-dim)':'rgba(255,255,255,0.03)',
                              color:form.category===c?'var(--amber)':'var(--text3)',
                              outline:form.category===c?'1px solid var(--amber-border)':'1px solid var(--border)',
                              borderTop:form.category===c?'2px solid var(--amber)':'2px solid transparent' }}>
                            {CAT_LABELS[c]}
                          </button>
                        ))}
                      </div>
                      {errors.category&&<p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#fca5a5',marginTop:5 }}>{errors.category}</p>}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <div>
                        <label className="form-label">Website</label>
                        <input style={inp('')} placeholder="https://coolfm.ng" value={form.website} onChange={e=>set('website',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}/>
                      </div>
                      <div>
                        <label className="form-label">Year Founded</label>
                        <input style={inp('')} placeholder="2001" value={form.founded} onChange={e=>set('founded',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}/>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Description *</label>
                      <textarea rows={3} style={{ ...inp('description'), resize:'vertical', fontFamily:'Inter,sans-serif' }} placeholder="Brief description of your media organisation and what you offer…" value={form.description} onChange={e=>set('description',e.target.value)} onFocus={focusAmber} onBlur={e=>blurBorder(e,'description')}/>
                      {errors.description&&<p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#fca5a5',marginTop:3 }}>{errors.description}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2 — Reach */}
                {step===2&&(
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    <div>
                      <label className="form-label">Markets Covered *</label>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:6 }}>
                        {MARKETS.map(m=>(
                          <button key={m} type="button" onClick={()=>toggleMarket(m)}
                            style={{ padding:'5px 12px', fontFamily:'IBM Plex Mono,monospace', fontSize:9, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', border:'none', transition:'all 0.15s',
                              background:form.markets.includes(m)?'var(--amber-dim)':'rgba(255,255,255,0.04)',
                              color:form.markets.includes(m)?'var(--amber)':'var(--text3)',
                              outline:form.markets.includes(m)?'1px solid var(--amber-border)':'1px solid var(--border)' }}>
                            {m}
                          </button>
                        ))}
                      </div>
                      {errors.markets&&<p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#fca5a5',marginTop:5 }}>{errors.markets}</p>}
                    </div>
                    <div>
                      <label className="form-label">Monthly Reach</label>
                      <input style={inp('')} placeholder="e.g. 2.5 million listeners" value={form.monthlyReach} onChange={e=>set('monthlyReach',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}/>
                    </div>
                    <div>
                      <label className="form-label">Audience Demographics</label>
                      <textarea rows={2} style={{ ...inp(''), resize:'none', fontFamily:'Inter,sans-serif' }} placeholder="e.g. 18–35 urban professionals, Lagos and Abuja" value={form.audienceDemo} onChange={e=>set('audienceDemo',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}/>
                    </div>
                  </div>
                )}

                {/* Step 3 — Bank */}
                {step===3&&(
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    <div style={{ padding:'10px 12px', background:'var(--amber-dim)', borderLeft:'2px solid var(--amber)' }}>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.08em' }}>Bank details are encrypted and used only for payout processing.</p>
                    </div>
                    {[['Bank Name','bankName','GTBank'],['Account Name','accountName','Cool FM Nigeria Ltd'],['Account Number','accountNumber','0123456789']].map(([label,key,ph])=>(
                      <div key={key}>
                        <label className="form-label">{label}</label>
                        <input style={inp('')} placeholder={ph} value={form[key]} onChange={e=>set(key,e.target.value)} onFocus={focusAmber} onBlur={blurBorder}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div style={{ display:'flex', gap:8 }}>
                {step>0&&<button onClick={()=>setStep(s=>s-1)} className="btn-secondary" style={{ fontSize:11 }}>← Back</button>}
                {step<3&&<button onClick={next} className="btn-primary" style={{ flex:1, justifyContent:'center', fontSize:11 }}>Next →</button>}
                {step===3&&(
                  <button onClick={submit} disabled={loading} className="btn-primary" style={{ flex:1, justifyContent:'center', fontSize:11 }}>
                    {loading?<><Spinner size={12}/>Submitting…</>:'Submit Application →'}
                  </button>
                )}
              </div>

              <p style={{ textAlign:'center', fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:16, letterSpacing:'0.06em' }}>
                Already a provider? <Link to="/" style={{ color:'var(--amber)', textDecoration:'none' }}>Sign in</Link>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}