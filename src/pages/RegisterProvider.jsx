import { useState } from 'react';
import PageTitle from '../components/PageTitle';
import { Spinner, Toast } from '../components/UI';
import api from '../services/api';

const CATEGORIES = ['TELEVISION','RADIO_AUDIO','PODCASTS','OUT_OF_HOME','PRINT_MEDIA','INFLUENCERS','SOCIAL_MEDIA','MUSIC_PROMOTION','LIVE_STREAMING'];
const CAT_LABELS = { TELEVISION:'Television', RADIO_AUDIO:'Radio / Audio', PODCASTS:'Podcasts', OUT_OF_HOME:'Out of Home', PRINT_MEDIA:'Print Media', INFLUENCERS:'Influencers', SOCIAL_MEDIA:'Social Media', MUSIC_PROMOTION:'Music Promotion', LIVE_STREAMING:'Live Streaming' };
const MARKETS    = ['Lagos','Abuja','Port Harcourt','Kano','Ibadan','Enugu','Kaduna','Nationwide'];
const LOGO       = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const STEPS = ['Contact','Organisation','Reach & Audience','Bank Details'];

export default function RegisterProvider() {
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast]       = useState(null);
  const [errors, setErrors]     = useState({});

  const [form, setForm] = useState({
    contactName:'', contactEmail:'', contactPhone:'', contactRole:'',
    orgName:'', category:'', website:'', founded:'', description:'',
    markets:[], monthlyReach:'', audienceDemo:'',
    bankName:'', accountName:'', accountNumber:'',
  });

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };
  const toggleMarket = (m) => setForm(f=>({ ...f, markets: f.markets.includes(m)?f.markets.filter(x=>x!==m):[...f.markets,m] }));

  const validate = () => {
    const e={};
    if(step===0){ if(!form.contactName.trim()) e.contactName='Required'; if(!form.contactEmail.trim()) e.contactEmail='Required'; else if(!/\S+@\S+\.\S+/.test(form.contactEmail)) e.contactEmail='Invalid email'; if(!form.contactPhone.trim()) e.contactPhone='Required'; }
    if(step===1){ if(!form.orgName.trim()) e.orgName='Required'; if(!form.category) e.category='Required'; if(!form.description.trim()) e.description='Required'; }
    if(step===2){ if(!form.markets.length) e.markets='Select at least one market'; }
    return e;
  };

  const next = () => { const errs=validate(); if(Object.keys(errs).length){setErrors(errs);return;} setStep(s=>s+1); };

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/providers/apply', { ...form, status:'PENDING_REVIEW', appliedAt:new Date().toISOString() });
      setSubmitted(true);
    } catch(e){ setToast({type:'error',message:e.message}); setTimeout(()=>setToast(null),3500); }
    finally{ setLoading(false); }
  };

  const inp = (field) => ({
    width:'100%', padding:'9px 12px', borderRadius:8, fontSize:13, outline:'none', fontFamily:'Inter,sans-serif',
    background:errors[field]?'rgba(239,68,68,0.06)':'rgba(255,255,255,0.04)',
    border:`0.5px solid ${errors[field]?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.1)'}`,
    color:'white',
  });

  if(submitted) return (
    <div style={{ minHeight:'100vh', background:'#07070e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(34,197,94,0.1)', border:'0.5px solid rgba(34,197,94,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:24 }}>✅</div>
        <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:22, color:'white', marginBottom:10 }}>Application Submitted!</h1>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:24 }}>
          We've received your application for <strong style={{color:'white'}}>{form.orgName}</strong>. Our team will review it and get back to you at <strong style={{color:'white'}}>{form.contactEmail}</strong> within 2–3 business days.
        </p>
        <a href="/" style={{ display:'inline-block', padding:'10px 24px', borderRadius:8, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', textDecoration:'none', fontSize:13, fontWeight:600, fontFamily:'Manrope,sans-serif' }}>Back to Home →</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#07070e', display:'flex', flexDirection:'column' }}>
      <PageTitle title="Apply as Provider" description="List your media inventory on BrandCasta and start receiving direct bookings."/>
      {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

      {/* Header */}
      <div style={{ padding:'16px 24px', borderBottom:'0.5px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10 }}>
        <img src={LOGO} alt="BrandCasta" style={{ width:26, height:26, objectFit:'contain' }}/>
        <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color:'white' }}>BrandCasta</span>
        <span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,0.35)' }}>Provider Application</span>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'32px 20px' }}>
        <div style={{ width:'100%', maxWidth:560 }}>

          {/* Hero */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:24, color:'white', letterSpacing:'-0.5px', marginBottom:8 }}>List your media inventory</h1>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>Join 184+ verified providers on Nigeria's media campaign platform</p>
          </div>

          {/* Steps */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
            {STEPS.map((label,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', flex:i<STEPS.length-1?1:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  <div style={{ width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,
                    background:i<step?'linear-gradient(135deg,#6366f1,#a855f7)':i===step?'rgba(99,102,241,0.15)':'rgba(255,255,255,0.05)',
                    color:i<step?'white':i===step?'#a5b4fc':'rgba(255,255,255,0.3)',
                    border:i===step?'0.5px solid rgba(99,102,241,0.4)':'none' }}>
                    {i<step?'✓':i+1}
                  </div>
                  <span style={{ fontSize:10, fontWeight:500, color:i===step?'white':i<step?'#a5b4fc':'rgba(255,255,255,0.3)', whiteSpace:'nowrap' }}>{label}</span>
                </div>
                {i<STEPS.length-1&&<div style={{ flex:1, height:'0.5px', background:i<step?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.08)', margin:'0 8px' }}/>}
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{ background:'rgba(255,255,255,0.025)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:24 }}>

            {/* Step 0 — Contact */}
            {step===0&&(
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color:'white', marginBottom:4 }}>Contact Information</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:18 }}>Tell us about the person managing this account</p>
                <div style={{ display:'grid', gap:12 }}>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Full Name *</label><input style={inp('contactName')} placeholder="Adaeze Okonkwo" value={form.contactName} onChange={e=>set('contactName',e.target.value)}/>{errors.contactName&&<p style={{color:'#fca5a5',fontSize:11,marginTop:3}}>{errors.contactName}</p>}</div>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Email *</label><input type="email" style={inp('contactEmail')} placeholder="adaeze@coolFM.ng" value={form.contactEmail} onChange={e=>set('contactEmail',e.target.value)}/>{errors.contactEmail&&<p style={{color:'#fca5a5',fontSize:11,marginTop:3}}>{errors.contactEmail}</p>}</div>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Phone *</label><input style={inp('contactPhone')} placeholder="+234 801 234 5678" value={form.contactPhone} onChange={e=>set('contactPhone',e.target.value)}/>{errors.contactPhone&&<p style={{color:'#fca5a5',fontSize:11,marginTop:3}}>{errors.contactPhone}</p>}</div>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Role / Title</label><input style={inp('contactRole')} placeholder="Head of Commercial" value={form.contactRole} onChange={e=>set('contactRole',e.target.value)}/></div>
                </div>
              </div>
            )}

            {/* Step 1 — Org */}
            {step===1&&(
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color:'white', marginBottom:4 }}>Organisation Details</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:18 }}>Tell us about your media organisation</p>
                <div style={{ display:'grid', gap:12 }}>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Organisation Name *</label><input style={inp('orgName')} placeholder="Cool FM Lagos" value={form.orgName} onChange={e=>set('orgName',e.target.value)}/>{errors.orgName&&<p style={{color:'#fca5a5',fontSize:11,marginTop:3}}>{errors.orgName}</p>}</div>
                  <div>
                    <label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Category *</label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                      {CATEGORIES.map(c=>(
                        <button key={c} type="button" onClick={()=>{set('category',c);}}
                          style={{ padding:'8px 6px', borderRadius:8, textAlign:'center', cursor:'pointer', fontSize:10, fontWeight:500, border:'none', fontFamily:'Inter,sans-serif',
                            background:form.category===c?'rgba(99,102,241,0.14)':'rgba(255,255,255,0.04)',
                            color:form.category===c?'#a5b4fc':'rgba(255,255,255,0.45)',
                            outline:form.category===c?'0.5px solid rgba(99,102,241,0.3)':'0.5px solid rgba(255,255,255,0.07)',
                          }}>{CAT_LABELS[c]}</button>
                      ))}
                    </div>
                    {errors.category&&<p style={{color:'#fca5a5',fontSize:11,marginTop:5}}>{errors.category}</p>}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Website</label><input style={inp('website')} placeholder="https://coolfm.ng" value={form.website} onChange={e=>set('website',e.target.value)}/></div>
                    <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Year Founded</label><input style={inp('founded')} placeholder="2001" value={form.founded} onChange={e=>set('founded',e.target.value)}/></div>
                  </div>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Description *</label><textarea rows={3} style={{ ...inp('description'), resize:'vertical' }} placeholder="Brief description of your media organisation and what you offer…" value={form.description} onChange={e=>set('description',e.target.value)}/>{errors.description&&<p style={{color:'#fca5a5',fontSize:11,marginTop:3}}>{errors.description}</p>}</div>
                </div>
              </div>
            )}

            {/* Step 2 — Reach */}
            {step===2&&(
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color:'white', marginBottom:4 }}>Reach & Audience</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:18 }}>Help brands understand who you reach</p>
                <div style={{ display:'grid', gap:14 }}>
                  <div>
                    <label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Markets Covered *</label>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {MARKETS.map(m=>(
                        <button key={m} type="button" onClick={()=>toggleMarket(m)}
                          style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                            background:form.markets.includes(m)?'rgba(99,102,241,0.14)':'rgba(255,255,255,0.04)',
                            color:form.markets.includes(m)?'#a5b4fc':'rgba(255,255,255,0.45)',
                            outline:form.markets.includes(m)?'0.5px solid rgba(99,102,241,0.3)':'0.5px solid rgba(255,255,255,0.07)',
                          }}>{m}</button>
                      ))}
                    </div>
                    {errors.markets&&<p style={{color:'#fca5a5',fontSize:11,marginTop:5}}>{errors.markets}</p>}
                  </div>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Monthly Reach</label><input style={inp('monthlyReach')} placeholder="e.g. 2.5 million listeners" value={form.monthlyReach} onChange={e=>set('monthlyReach',e.target.value)}/></div>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Audience Demographics</label><textarea rows={2} style={{ ...inp('audienceDemo'), resize:'none' }} placeholder="e.g. 18–35 urban professionals, Lagos and Abuja" value={form.audienceDemo} onChange={e=>set('audienceDemo',e.target.value)}/></div>
                </div>
              </div>
            )}

            {/* Step 3 — Bank */}
            {step===3&&(
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color:'white', marginBottom:4 }}>Bank Details</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:18 }}>For payout processing once campaigns complete</p>
                <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(245,158,11,0.06)', border:'0.5px solid rgba(245,158,11,0.18)', marginBottom:14 }}>
                  <p style={{ fontSize:11, color:'#fcd34d' }}>🔒 Bank details are encrypted and used only for payout processing.</p>
                </div>
                <div style={{ display:'grid', gap:12 }}>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Bank Name</label><input style={inp('bankName')} placeholder="GTBank" value={form.bankName} onChange={e=>set('bankName',e.target.value)}/></div>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Account Name</label><input style={inp('accountName')} placeholder="Cool FM Nigeria Ltd" value={form.accountName} onChange={e=>set('accountName',e.target.value)}/></div>
                  <div><label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Account Number</label><input style={inp('accountNumber')} placeholder="0123456789" value={form.accountNumber} onChange={e=>set('accountNumber',e.target.value)}/></div>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div style={{ display:'flex', gap:8, marginTop:22 }}>
              {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ padding:'9px 18px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', fontFamily:'Manrope,sans-serif' }}>← Back</button>}
              {step<3&&<button onClick={next} style={{ flex:1, padding:'10px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'linear-gradient(135deg,#6366f1,#a855f7)', border:'none', color:'white', fontFamily:'Manrope,sans-serif' }}>Next →</button>}
              {step===3&&<button onClick={submit} disabled={loading} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'linear-gradient(135deg,#22c55e,#16a34a)', border:'none', color:'white', fontFamily:'Manrope,sans-serif' }}>
                {loading?<><Spinner size={13}/>Submitting…</>:'Submit Application →'}
              </button>}
            </div>
          </div>

          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:16 }}>
            Already a provider? <a href="/" style={{ color:'rgba(165,180,252,0.7)', textDecoration:'none' }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}