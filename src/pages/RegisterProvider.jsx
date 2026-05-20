import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Toast } from '../components/UI';
import api from '../services/api';

const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const CATEGORIES = [
  { value:'TELEVISION',   label:'Television & Streaming' },
  { value:'RADIO_AUDIO',  label:'Radio & Audio' },
  { value:'PODCASTS',     label:'Podcasts' },
  { value:'OUT_OF_HOME',  label:'Out-of-Home (Billboards, LED)' },
  { value:'PRINT_MEDIA',  label:'Print Media' },
  { value:'INFLUENCERS',  label:'Influencer & Content Marketing' },
  { value:'DIGITAL',      label:'Digital / Online Media' },
];

const MARKETS = ['Lagos','Abuja','Port Harcourt','Kano','Onitsha','Enugu','Ibadan','Kaduna','Nationwide'];

const STEPS = ['Your details','Organisation','Reach & Markets','Review'];

export default function RegisterProvider() {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast]     = useState(null);
  const [errors, setErrors]   = useState({});

  const [form, setForm] = useState({
    // Step 0 — contact
    contactName:  '',
    contactEmail: '',
    contactPhone: '',
    contactRole:  '',
    // Step 1 — org
    orgName:      '',
    category:     '',
    website:      '',
    founded:      '',
    description:  '',
    // Step 2 — reach
    markets:      [],
    monthlyReach: '',
    audienceDemo: '',
    // Step 3 — bank
    bankName:     '',
    accountName:  '',
    accountNumber:'',
  });

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const toggleMarket = (m) => {
    setForm(f => ({
      ...f,
      markets: f.markets.includes(m) ? f.markets.filter(x => x !== m) : [...f.markets, m],
    }));
  };

  const inp = (field) => ({
    width:'100%', padding:'12px 16px', borderRadius:12, fontSize:13, outline:'none',
    background: errors[field] ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)',
    border: errors[field] ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.1)',
    color:'white', transition:'all 0.15s',
  });

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.contactName.trim())  e.contactName  = 'Required';
      if (!form.contactEmail.trim()) e.contactEmail = 'Required';
      else if (!/\S+@\S+\.\S+/.test(form.contactEmail)) e.contactEmail = 'Invalid email';
      if (!form.contactPhone.trim()) e.contactPhone = 'Required';
    }
    if (step === 1) {
      if (!form.orgName.trim())  e.orgName  = 'Required';
      if (!form.category)        e.category = 'Required';
      if (!form.description.trim()) e.description = 'Required';
    }
    if (step === 2) {
      if (!form.markets.length) e.markets = 'Select at least one market';
    }
    return e;
  };

  const next = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(s => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/providers/apply', {
        ...form,
        status: 'PENDING_REVIEW',
        appliedAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch(e) {
      setToast({ type:'error', message: e.message });
      setTimeout(() => setToast(null), 3500);
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'var(--bg-base)' }}>
        <div className="text-center max-w-md">
          <div style={{ width:64, height:64, borderRadius:20, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <svg width="28" height="28" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:26, fontWeight:700, color:'white', marginBottom:12 }}>Application submitted!</h1>
          <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.7, marginBottom:24 }}>
            Thank you for applying to join BrandCasta as a media provider. Our team will review your application and reach out to <strong style={{ color:'white' }}>{form.contactEmail}</strong> within 48 hours.
          </p>
          <Link to="/login" className="btn-primary" style={{ padding:'12px 24px', fontSize:14 }}>
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden" style={{ background:'var(--bg-base)' }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      <div style={{ position:'absolute', top:-180, right:-180, width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(20,184,166,0.12),transparent 70%)', pointerEvents:'none' }}/>

      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 }}>
            <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:40, height:40, objectFit:'contain' }}/>
            <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:20, color:'white' }}>BrandCasta</span>
          </div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:24, fontWeight:700, color:'white', marginBottom:8 }}>Become a Media Provider</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>Join Nigeria's leading campaign operations platform</p>
        </div>

        {/* Step Pills */}
        <div style={{ display:'flex', gap:6, marginBottom:28 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ flex:1, textAlign:'center' }}>
              <div style={{ height:3, borderRadius:2, background: i <= step ? 'linear-gradient(90deg,#14b8a6,#06b6d4)' : 'rgba(255,255,255,0.1)', marginBottom:6, transition:'all 0.3s' }}/>
              <p style={{ fontSize:10, fontWeight:600, color: i === step ? '#5eead4' : 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="page-card" style={{ padding:28 }}>

          {/* Step 0 — Contact */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:17, color:'white', marginBottom:4 }}>Your contact details</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Who should we contact about this application?</p>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Full Name *</label>
                <input style={inp('contactName')} placeholder="e.g. Chidi Okafor" value={form.contactName} onChange={(e) => set('contactName', e.target.value)}/>
                {errors.contactName && <p style={{ color:'#fca5a5', fontSize:11, marginTop:4 }}>{errors.contactName}</p>}
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Work Email *</label>
                <input type="email" style={inp('contactEmail')} placeholder="you@yourorg.com" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)}/>
                {errors.contactEmail && <p style={{ color:'#fca5a5', fontSize:11, marginTop:4 }}>{errors.contactEmail}</p>}
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Phone Number *</label>
                <input style={inp('contactPhone')} placeholder="e.g. +234 801 234 5678" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)}/>
                {errors.contactPhone && <p style={{ color:'#fca5a5', fontSize:11, marginTop:4 }}>{errors.contactPhone}</p>}
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Your Role / Title</label>
                <input style={inp('contactRole')} placeholder="e.g. Head of Sales, GM, Marketing Director" value={form.contactRole} onChange={(e) => set('contactRole', e.target.value)}/>
              </div>
            </div>
          )}

          {/* Step 1 — Organisation */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:17, color:'white', marginBottom:4 }}>About your organisation</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Tell us about the media organisation you represent.</p>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Organisation Name *</label>
                <input style={inp('orgName')} placeholder="e.g. Cool FM, Channels TV, XL Billboards" value={form.orgName} onChange={(e) => set('orgName', e.target.value)}/>
                {errors.orgName && <p style={{ color:'#fca5a5', fontSize:11, marginTop:4 }}>{errors.orgName}</p>}
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Media Category *</label>
                <select style={{ ...inp('category'), appearance:'none' }} value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Select your media type</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.category && <p style={{ color:'#fca5a5', fontSize:11, marginTop:4 }}>{errors.category}</p>}
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Website</label>
                <input style={inp('website')} placeholder="https://yourorganisation.com" value={form.website} onChange={(e) => set('website', e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Year Founded</label>
                <input style={inp('founded')} placeholder="e.g. 2002" value={form.founded} onChange={(e) => set('founded', e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Brief Description *</label>
                <textarea rows={4} style={{ ...inp('description'), resize:'vertical' }} placeholder="Tell us about your organisation, your audience, and what makes you unique..." value={form.description} onChange={(e) => set('description', e.target.value)}/>
                {errors.description && <p style={{ color:'#fca5a5', fontSize:11, marginTop:4 }}>{errors.description}</p>}
              </div>
            </div>
          )}

          {/* Step 2 — Reach & Markets */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:17, color:'white', marginBottom:4 }}>Your reach & markets</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Help clients understand your coverage and audience.</p>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:10 }}>Markets Covered *</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {MARKETS.map((m) => {
                    const active = form.markets.includes(m);
                    return (
                      <button key={m} type="button" onClick={() => toggleMarket(m)}
                        style={{ padding:'8px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                          background: active ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.04)',
                          color:       active ? '#5eead4' : 'var(--text-muted)',
                          border:      active ? '1px solid rgba(20,184,166,0.4)' : '1px solid var(--border)',
                        }}>{m}</button>
                    );
                  })}
                </div>
                {errors.markets && <p style={{ color:'#fca5a5', fontSize:11, marginTop:6 }}>{errors.markets}</p>}
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Monthly Reach / Audience Size</label>
                <input style={inp('monthlyReach')} placeholder="e.g. 500,000 listeners, 2M impressions" value={form.monthlyReach} onChange={(e) => set('monthlyReach', e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>Primary Audience Demographics</label>
                <input style={inp('audienceDemo')} placeholder="e.g. Adults 18-45, ABC1, Urban professionals" value={form.audienceDemo} onChange={(e) => set('audienceDemo', e.target.value)}/>
              </div>
              <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.15)' }}>
                <p style={{ fontSize:12, color:'#5eead4', fontWeight:600, marginBottom:4 }}>Bank details (for payouts)</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>We need your bank details to process campaign payouts once deliveries are confirmed.</p>
              </div>
              <input style={inp('bankName')} placeholder="Bank name (e.g. GTBank, Access Bank)" value={form.bankName} onChange={(e) => set('bankName', e.target.value)}/>
              <input style={inp('accountName')} placeholder="Account name" value={form.accountName} onChange={(e) => set('accountName', e.target.value)}/>
              <input style={inp('accountNumber')} placeholder="Account number" value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)}/>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:17, color:'white', marginBottom:4 }}>Review your application</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Please confirm your details before submitting.</p>
              </div>
              {[
                { label:'Contact', value:`${form.contactName} · ${form.contactEmail} · ${form.contactPhone}` },
                { label:'Organisation', value: form.orgName },
                { label:'Category', value: CATEGORIES.find(c => c.value === form.category)?.label || form.category },
                { label:'Markets', value: form.markets.join(', ') || '—' },
                { label:'Monthly Reach', value: form.monthlyReach || '—' },
                { label:'Bank', value: form.bankName ? `${form.bankName} · ${form.accountName} · ${form.accountNumber}` : '—' },
              ].map((row) => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{row.label}</p>
                  <p style={{ fontSize:12, color:'white', fontWeight:500, textAlign:'right', maxWidth:'60%' }}>{row.value}</p>
                </div>
              ))}
              <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)', marginTop:16 }}>
                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.7 }}>
                  By submitting this application, you confirm that the information provided is accurate. BrandCasta will review your application and contact you within <strong style={{ color:'white' }}>48 hours</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary" style={{ padding:'11px 20px' }}>← Back</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={next} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'11px' }}>
                Continue →
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={loading} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'11px' }}>
                {loading ? <><Spinner size={14}/> Submitting…</> : 'Submit Application'}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text-muted)' }}>
          Are you a brand?{' '}
          <Link to="/register/client" style={{ color:'var(--accent-light)', fontWeight:600, textDecoration:'none' }}>Register as a client</Link>
          {' · '}
          <Link to="/login" style={{ color:'var(--accent-light)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}