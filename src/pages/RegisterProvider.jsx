import { useState } from 'react';
import { Link } from 'react-router-dom';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';
const API  = import.meta.env.VITE_API_URL;

const CATEGORIES = ['TELEVISION','RADIO_AUDIO','PODCASTS','OUT_OF_HOME','PRINT_MEDIA','INFLUENCERS','SOCIAL_MEDIA','MUSIC_PROMOTION','LIVE_STREAMING'];
const CAT_LABELS = {TELEVISION:'Television',RADIO_AUDIO:'Radio / Audio',PODCASTS:'Podcasts',OUT_OF_HOME:'Out of Home',PRINT_MEDIA:'Print Media',INFLUENCERS:'Influencers',SOCIAL_MEDIA:'Social Media',MUSIC_PROMOTION:'Music Promotion',LIVE_STREAMING:'Live Streaming'};
const MARKETS    = ['Lagos','Abuja','Port Harcourt','Kano','Ibadan','Enugu','Kaduna','Nationwide'];
const STEPS      = ['Contact','Organisation','Reach & Audience','Bank Details'];

const inp = {width:'100%',border:'1px solid #e1e4f0',padding:'9px 12px',fontFamily:'Inter,sans-serif',fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:16,borderRadius:0};

export default function RegisterProvider() {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]   = useState({});
  const [form, setForm]       = useState({
    contactName:'',contactEmail:'',contactPhone:'',contactRole:'',
    orgName:'',category:'',website:'',founded:'',description:'',
    markets:[],monthlyReach:'',audienceDemo:'',
    bankName:'',accountName:'',accountNumber:'',
  });

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };
  const toggleMarket = m => setForm(f=>({...f,markets:f.markets.includes(m)?f.markets.filter(x=>x!==m):[...f.markets,m]}));

  const validate = () => {
    const e={};
    if(step===0){ if(!form.contactName.trim())e.contactName='Required'; if(!form.contactEmail.trim())e.contactEmail='Required'; if(!form.contactPhone.trim())e.contactPhone='Required'; }
    if(step===1){ if(!form.orgName.trim())e.orgName='Required'; if(!form.category)e.category='Required'; if(!form.description.trim())e.description='Required'; }
    if(step===2){ if(!form.markets.length)e.markets='Select at least one market'; }
    return e;
  };

  const next = () => { const errs=validate(); if(Object.keys(errs).length){setErrors(errs);return;} setStep(s=>s+1); };

  const submit = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/providers/apply`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,status:'PENDING_REVIEW',appliedAt:new Date().toISOString()})});
      setSubmitted(true);
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };

  if(submitted) return (
    <div style={{minHeight:'100vh',background:'#faf8ff',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{maxWidth:480,width:'100%',textAlign:'center'}}>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:16}}>Application Submitted</div>
        <h1 style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:26,color:'#131b2e',marginBottom:10}}>You are on the list.</h1>
        <p style={{fontSize:13,color:'#464554',lineHeight:1.75,marginBottom:24}}>We have received your application for <strong>{form.orgName}</strong>. Our team will respond to <strong>{form.contactEmail}</strong> within 2–3 business days.</p>
        <Link to="/" style={{padding:'12px 24px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none',display:'inline-block'}}>Back to Home →</Link>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#faf8ff',display:'flex',flexDirection:'column'}}>
      {/* Progress */}
      <div style={{height:3,background:'#e1e4f0'}}>
        <div style={{height:'100%',background:'#4338ca',width:`${((step+1)/STEPS.length)*100}%`,transition:'width 0.5s ease'}}/>
      </div>
      {/* Header */}
      <div style={{padding:'14px 24px',borderBottom:'1px solid #e1e4f0',display:'flex',alignItems:'center',gap:10,background:'white'}}>
        <img src={LOGO} alt="BrandCasta" style={{width:24,height:24,objectFit:'contain'}}/>
        <span style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:14,color:'#131b2e'}}>Brand<span style={{color:'#4d50d6'}}>Casta</span></span>
        <span style={{marginLeft:'auto',fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',textTransform:'uppercase',letterSpacing:'0.1em'}}>Provider Application</span>
      </div>

      <div style={{flex:1,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 20px'}}>
        <div style={{width:'100%',maxWidth:560}}>
          {/* Step header */}
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:4}}>Step {step+1} of {STEPS.length}</div>
            <h2 style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:22,color:'#131b2e',letterSpacing:'-0.4px'}}>{STEPS[step]}</h2>
          </div>

          <div style={{background:'white',border:'1px solid #e1e4f0',padding:28,marginBottom:16}}>
            {/* Step 0 */}
            {step===0&&[['Full Name *','contactName','text','Adaeze Okonkwo'],['Email *','contactEmail','email','adaeze@company.ng'],['Phone *','contactPhone','tel','+234 801 234 5678'],['Role / Title','contactRole','text','Head of Commercial']].map(([label,key,type,ph])=>(
              <div key={key}>
                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>{label}</label>
                <input type={type} style={inp} placeholder={ph} value={form[key]} onChange={e=>set(key,e.target.value)}/>
                {errors[key]&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:-10,marginBottom:8}}>{errors[key]}</div>}
              </div>
            ))}

            {/* Step 1 */}
            {step===1&&(
              <>
                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Organisation Name *</label>
                <input style={inp} placeholder="Cool FM Lagos" value={form.orgName} onChange={e=>set('orgName',e.target.value)}/>
                {errors.orgName&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:-10,marginBottom:8}}>{errors.orgName}</div>}

                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Category *</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:16}}>
                  {CATEGORIES.map(c=>(
                    <button key={c} type="button" onClick={()=>set('category',c)}
                      style={{padding:'8px 6px',textAlign:'center',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:9,letterSpacing:'0.06em',textTransform:'uppercase',border:'none',background:form.category===c?'#eef2ff':'#f2f3ff',color:form.category===c?'#4338ca':'#464554',outline:form.category===c?'1px solid #c7d2fe':'none',borderTop:form.category===c?'2px solid #4338ca':'2px solid transparent'}}>
                      {CAT_LABELS[c]}
                    </button>
                  ))}
                </div>
                {errors.category&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginBottom:8}}>{errors.category}</div>}

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div>
                    <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Website</label>
                    <input style={inp} placeholder="https://coolfm.ng" value={form.website} onChange={e=>set('website',e.target.value)}/>
                  </div>
                  <div>
                    <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Year Founded</label>
                    <input style={inp} placeholder="2001" value={form.founded} onChange={e=>set('founded',e.target.value)}/>
                  </div>
                </div>

                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Description *</label>
                <textarea rows={3} style={{...inp,resize:'vertical',fontFamily:'Inter,sans-serif'}} placeholder="Brief description of your media organisation…" value={form.description} onChange={e=>set('description',e.target.value)}/>
                {errors.description&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:-10,marginBottom:8}}>{errors.description}</div>}
              </>
            )}

            {/* Step 2 */}
            {step===2&&(
              <>
                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:8}}>Markets Covered *</label>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
                  {MARKETS.map(m=>(
                    <button key={m} type="button" onClick={()=>toggleMarket(m)}
                      style={{padding:'6px 12px',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer',border:'none',background:form.markets.includes(m)?'#eef2ff':'#f2f3ff',color:form.markets.includes(m)?'#4338ca':'#464554',outline:form.markets.includes(m)?'1px solid #c7d2fe':'none'}}>
                      {m}
                    </button>
                  ))}
                </div>
                {errors.markets&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginBottom:8}}>{errors.markets}</div>}

                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Monthly Reach</label>
                <input style={inp} placeholder="e.g. 2.5 million listeners" value={form.monthlyReach} onChange={e=>set('monthlyReach',e.target.value)}/>

                <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>Audience Demographics</label>
                <textarea rows={2} style={{...inp,resize:'none',fontFamily:'Inter,sans-serif'}} placeholder="e.g. 18-35 urban professionals, Lagos and Abuja" value={form.audienceDemo} onChange={e=>set('audienceDemo',e.target.value)}/>
              </>
            )}

            {/* Step 3 */}
            {step===3&&(
              <>
                <div style={{padding:'10px 12px',background:'#fffbeb',borderLeft:'2px solid #d97706',marginBottom:20}}>
                  <p style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#d97706',letterSpacing:'0.06em'}}>Bank details are encrypted and used only for payout processing.</p>
                </div>
                {[['Bank Name','bankName','GTBank'],['Account Name','accountName','Cool FM Nigeria Ltd'],['Account Number','accountNumber','0123456789']].map(([label,key,ph])=>(
                  <div key={key}>
                    <label style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6}}>{label}</label>
                    <input style={inp} placeholder={ph} value={form[key]} onChange={e=>set(key,e.target.value)}/>
                  </div>
                ))}
              </>
            )}
          </div>

          <div style={{display:'flex',gap:8}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{padding:'11px 20px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',background:'transparent',cursor:'pointer'}}>← Back</button>}
            {step<3&&<button onClick={next} style={{flex:1,padding:'11px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:'pointer'}}>Next →</button>}
            {step===3&&<button onClick={submit} disabled={loading} style={{flex:1,padding:'11px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:'pointer'}}>{loading?'Submitting…':'Submit Application →'}</button>}
          </div>

          <p style={{textAlign:'center',fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:16,textTransform:'uppercase',letterSpacing:'0.06em'}}>
            Already a provider? <Link to="/" style={{color:'#4338ca',textDecoration:'none'}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}