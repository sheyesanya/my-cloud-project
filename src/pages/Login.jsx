import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn, { passive:true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w;
}

function FadeUp({ children, delay=0, style={} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){ setVis(true); obs.disconnect(); }}, { threshold:0.06 });
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(16px)', transition:`opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

const FEATURES = [
  { icon:'📺', title:'TV & Radio',         desc:'Channels TV, Cool FM, TVC, Wazobia FM and 60+ stations across Nigeria.' },
  { icon:'🎙', title:'Podcasts',            desc:'ISWIS, The Honest Bunch, WithChude and the fastest-growing Nigerian podcasts.' },
  { icon:'🏙', title:'Out-of-Home',         desc:'Billboards, LED screens, BRT wraps, airport and mall inventory nationwide.' },
  { icon:'📰', title:'Print & Digital',     desc:'Punch, Guardian, BusinessDay; display, inserts and sponsored content.' },
  { icon:'📱', title:'Influencers & Social',desc:'Macro, mid-tier and micro creators across Instagram, TikTok, YouTube and X.' },
  { icon:'⚡', title:'5Sec Subsidized Spots',desc:'Exclusive subsidized 5-second ad spots unique to BrandCasta.' },
];

const STEPS = [
  { n:'1', title:'Create your brief',  desc:'Tell us your brand, goals and target audience in minutes.' },
  { n:'2', title:'Pick your media',    desc:'Browse 184+ verified providers and build your campaign.' },
  { n:'3', title:'Book & pay',         desc:'Provider confirms within 24hrs. Pay securely via Paystack.' },
  { n:'4', title:'Track & prove',      desc:'Provider uploads proof. You approve. Campaign closed.' },
];

const TESTIMONIALS = [
  { quote:'BrandCasta cut our campaign booking time from weeks to hours. We ran TV, radio and OOH simultaneously from one dashboard.', name:'Chukwuemeka Obi', role:'Head of Marketing, Kuda Bank', initials:'CO' },
  { quote:'As a media owner, one-click approve or decline has completely changed how I manage ad sales. Payouts are instant.', name:'Adaeze Nwosu', role:'Sales Director, Cool FM Lagos', initials:'AN' },
  { quote:'I booked podcast ads, billboards and an influencer campaign in one brief. The proof of performance feature is unmatched.', name:'Tunde Adegoke', role:'Brand Manager, PalmPay', initials:'TA' },
];

const STATS = [
  { value:'184', suf:'+', label:'Media Providers' },
  { value:'9',   suf:'',  label:'Media Categories' },
  { value:'36',  suf:'+', label:'Cities Covered'   },
];

function AuthPanel({ mode, setMode, navigate }) {
  const { login, signup, loginWithGoogle } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [agreed, setAgreed]     = useState(false);
  const isProvider = mode === 'provider';

  const handle = async (fn) => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const r = await fn();
      if (r !== null && r !== undefined) navigate('/dashboard');
    } catch(e) {
      const m = (e.message||'').replace('Firebase: ','').replace(/\(auth.*?\)/g,'').trim();
      if (m) setError(m);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', overflow:'hidden' }}>
      {/* Tab header */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--bg2)' }}>
        {[['login','Sign In'],['signup','Sign Up'],['provider','Provider']].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{ flex:1, padding:'12px 8px', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, transition:'all 0.15s',
              background: mode===m ? 'white' : 'transparent',
              color: mode===m ? 'var(--accent)' : 'var(--text3)',
              borderBottom: mode===m ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom:-1,
            }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding:24 }}>
        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:17, color:'var(--text)', marginBottom:4 }}>
          {isProvider ? 'Provider Sign In' : mode==='login' ? 'Welcome back' : 'Get started free'}
        </p>
        <p style={{ fontSize:13, color:'var(--text3)', marginBottom:20 }}>
          {isProvider ? 'Access your provider dashboard' : mode==='login' ? 'Sign in to your BrandCasta account' : 'Create your account in seconds'}
        </p>

        {error && (
          <div style={{ padding:'10px 12px', background:'rgba(223,27,65,0.06)', border:'1px solid rgba(223,27,65,0.2)', borderRadius:6, fontSize:13, color:'var(--red)', marginBottom:14 }}>
            {error}
          </div>
        )}

        {/* Google */}
        <button onClick={()=>{ if(mode==='signup'&&!agreed){setError('Please agree to our Terms.');return;} handle(loginWithGoogle); }} disabled={loading}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'11px', background:'white', border:'1px solid var(--border)', borderRadius:6, fontSize:14, fontWeight:500, color:'var(--text)', cursor:'pointer', marginBottom:16, boxShadow:'var(--shadow-sm)', transition:'box-shadow 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow-sm)'}>
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0124 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
          Continue with Google
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:'var(--border)' }}/>
          <span style={{ fontSize:12, color:'var(--text4)' }}>or</span>
          <div style={{ flex:1, height:1, background:'var(--border)' }}/>
        </div>

        <div style={{ marginBottom:12 }}>
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'){ if(mode==='signup'&&!agreed){setError('Please agree to our Terms.');return;} handle(()=>mode==='login'||isProvider?login(email,password):signup(email,password)); }}}/>
        </div>

        {mode==='signup' && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:16, cursor:'pointer' }} onClick={()=>setAgreed(a=>!a)}>
            <div style={{ width:16, height:16, flexShrink:0, marginTop:1, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', border:agreed?'none':'1px solid var(--border)', background:agreed?'var(--accent)':'white', boxShadow:agreed?'none':'var(--shadow-sm)' }}>
              {agreed && <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
            </div>
            <p style={{ fontSize:12, color:'var(--text3)', lineHeight:1.5 }}>
              I agree to BrandCasta's{' '}
              <Link to="/terms" target="_blank" onClick={e=>e.stopPropagation()} style={{ color:'var(--accent)' }}>Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" target="_blank" onClick={e=>e.stopPropagation()} style={{ color:'var(--accent)' }}>Privacy Policy</Link>
            </p>
          </div>
        )}

        <button onClick={()=>{ if(mode==='signup'&&!agreed){setError('Please agree to our Terms.');return;} handle(()=>mode==='login'||isProvider?login(email,password):signup(email,password)); }}
          disabled={loading} className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:14 }}>
          {loading ? <><Spinner size={14}/>{isProvider||mode==='login'?'Signing in…':'Creating account…'}</> : isProvider?'Provider Sign In →':mode==='login'?'Sign In →':'Create Account →'}
        </button>

        <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid var(--border)', textAlign:'center' }}>
          <p style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>Media organisation?</p>
          <Link to="/register/provider" style={{ fontSize:13, color:'var(--accent)', fontWeight:500 }}>Apply as a Provider →</Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate   = useNavigate();
  const width      = useWidth();
  const isMobile   = width <= 768;
  const isTablet   = width <= 1024;
  const [mode, setMode]         = useState('login');
  const [activeTest, setActiveTest] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTest(a=>(a+1)%TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const P = '#635bff';
  const pad = isMobile ? '0 20px' : '0 40px';

  return (
    <div style={{ minHeight:'100vh', background:'white', color:'var(--text)', fontFamily:'Inter,sans-serif', overflowX:'hidden' }}>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ padding:pad, maxWidth:1200, margin:'0 auto', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', flexShrink:0 }}>
            <img src={LOGO} alt="BrandCasta" style={{ width:28, height:28, objectFit:'contain', borderRadius:6, background:P, padding:2 }} onError={e=>e.target.style.display='none'}/>
            <div style={{ display:'flex' }}>
              <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color:'var(--text)' }}>Brand</span>
              <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color:'#4d50d6' }}>Casta</span>
            </div>
          </div>

          {!isMobile && (
            <div style={{ display:'flex', gap:28 }}>
              {[['#features','Features'],['#how-it-works','How it works'],['#providers','For Providers']].map(([href,label])=>(
                <a key={href} href={href} style={{ fontSize:14, fontWeight:500, color:'var(--text2)', textDecoration:'none', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color=P} onMouseLeave={e=>e.currentTarget.style.color='var(--text2)'}>
                  {label}
                </a>
              ))}
            </div>
          )}

          <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            {!isMobile && (
              <button onClick={()=>setMode('login')}
                style={{ padding:'8px 16px', background:'none', border:'1px solid var(--border)', borderRadius:6, fontSize:13, fontWeight:500, color:'var(--text2)', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=P; e.currentTarget.style.color=P; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)'; }}>
                Sign in
              </button>
            )}
            <button onClick={()=>{ setMode('signup'); document.getElementById('auth')?.scrollIntoView({behavior:'smooth'}); }}
              className="btn-primary" style={{ fontSize:13, padding:'8px 16px' }}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: isMobile ? '56px 20px 48px' : '80px 40px 72px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 440px', gap: isMobile ? 40 : 64, alignItems:'center' }}>

          {/* Left */}
          <div style={{ maxWidth: isTablet && !isMobile ? 640 : undefined, margin: isTablet && !isMobile ? '0 auto' : undefined, textAlign: isTablet && !isMobile ? 'center' : undefined }}>
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 12px', background:'rgba(99,91,255,0.06)', border:'1px solid rgba(99,91,255,0.2)', borderRadius:100, marginBottom:24 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:P, flexShrink:0 }}/>
              <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:11, color:P, fontWeight:500, letterSpacing:'0.08em' }}>MEDIA CAMPAIGNS, WITHOUT BORDERS</span>
            </motion.div>

            <motion.h1 initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.08 }}
              style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize: isMobile ? 36 : isTablet ? 44 : 52, lineHeight:1.1, letterSpacing:'-1.5px', marginBottom:20, color:'var(--text)' }}>
              Book media campaigns<br/>
              <span style={{ background:`linear-gradient(135deg,${P},#7c3aed)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                across Nigeria.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.18 }}
              style={{ fontSize: isMobile ? 15 : 17, color:'var(--text2)', lineHeight:1.75, marginBottom:12 }}>
              One platform to discover, book, generate and manage campaigns across Podcasts, Live Streaming, TV, Radio, Billboards, Print and Influencers.
            </motion.p>

            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5, delay:0.28 }}
              style={{ fontFamily:'IBM Plex Mono,monospace', fontSize: isMobile ? 11 : 12, color:'var(--text3)', marginBottom:32, lineHeight:1.8 }}>
              5Sec Subsidized Ad-Spots · No Delayed Payment · MPO &amp; Invoice · Ad Tracker · Proof of Performance
            </motion.p>

            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.35 }}
              style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent: isTablet && !isMobile ? 'center' : 'flex-start' }}>
              <button onClick={()=>{ setMode('signup'); document.getElementById('auth')?.scrollIntoView({behavior:'smooth'}); }}
                className="btn-primary" style={{ fontSize:15, padding:'12px 28px' }}>
                Start a campaign →
              </button>
              <Link to="/register/provider" className="btn-secondary" style={{ fontSize:15, padding:'12px 24px' }}>
                List your inventory
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
              style={{ display:'flex', gap: isMobile ? 20 : 32, marginTop:40, paddingTop:32, borderTop:'1px solid var(--border)', flexWrap:'wrap' }}>
              {STATS.map(s=>(
                <div key={s.label}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize: isMobile ? 24 : 28, color:'var(--text)', lineHeight:1, marginBottom:3 }}>
                    {s.value}<span style={{ color:P }}>{s.suf}</span>
                  </p>
                  <p style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Auth panel */}
          <motion.div initial={{ opacity:0, y: isMobile ? 16 : 0, x: isMobile ? 0 : 20 }} animate={{ opacity:1, y:0, x:0 }} transition={{ duration:0.55, delay:0.2 }} id="auth">
            <AuthPanel mode={mode} setMode={setMode} navigate={navigate}/>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background:'var(--bg2)', borderTop:'1px solid var(--border)', padding: isMobile ? '52px 20px' : '80px 40px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <FadeUp style={{ marginBottom:48, textAlign: isMobile ? 'center' : 'left' }}>
            <p className="eyebrow" style={{ marginBottom:10 }}>Media Channels</p>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize: isMobile ? 28 : 36, letterSpacing:'-0.8px', marginBottom:10 }}>
              Every channel. One brief.
            </h2>
            <p style={{ fontSize:16, color:'var(--text2)', maxWidth:480, margin: isMobile ? '0 auto' : undefined }}>
              184+ verified Nigerian media providers across 9 categories, all bookable from a single dashboard.
            </p>
          </FadeUp>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap:16 }}>
            {FEATURES.map((f,i)=>(
              <FadeUp key={f.title} delay={i*0.06}>
                <div style={{ padding:24, background:'white', borderRadius:10, border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)', transition:'box-shadow 0.2s, transform 0.2s', height:'100%' }}
                  onMouseEnter={e=>{ e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='translateY(0)'; }}>
                  <div style={{ fontSize:24, marginBottom:14 }}>{f.icon}</div>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:7 }}>{f.title}</p>
                  <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.7 }}>{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: isMobile ? '52px 20px' : '80px 40px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <FadeUp style={{ marginBottom:48, textAlign: isMobile ? 'center' : 'left' }}>
            <p className="eyebrow" style={{ marginBottom:10 }}>Process</p>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize: isMobile ? 28 : 36, letterSpacing:'-0.8px' }}>
              How it works
            </h2>
          </FadeUp>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 16 : 24 }}>
            {STEPS.map((s,i)=>(
              <FadeUp key={s.n} delay={i*0.08}>
                <div style={{ position:'relative', padding:24, background:'white', borderRadius:10, border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${P},#7c3aed)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color:'white', marginBottom:16 }}>
                    {s.n}
                  </div>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'var(--text)', marginBottom:7 }}>{s.title}</p>
                  <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.7 }}>{s.desc}</p>
                  {i < STEPS.length-1 && !isMobile && !isTablet && (
                    <div style={{ position:'absolute', top:42, right:-16, zIndex:1, fontSize:20, color:'var(--border)' }}>→</div>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background:'var(--bg2)', borderTop:'1px solid var(--border)', padding: isMobile ? '52px 20px' : '80px 40px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <FadeUp style={{ marginBottom:40, textAlign:'center' }}>
            <p className="eyebrow" style={{ marginBottom:10 }}>What clients say</p>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize: isMobile ? 26 : 32, letterSpacing:'-0.8px' }}>
              Trusted by Nigerian brands
            </h2>
          </FadeUp>
          <div style={{ minHeight:180 }}>
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t,i) => i===activeTest && (
                <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.3 }}
                  style={{ padding: isMobile ? '24px' : '32px 40px', background:'white', borderRadius:12, border:'1px solid var(--border)', boxShadow:'var(--shadow-md)' }}>
                  <div style={{ display:'flex', gap:4, marginBottom:16 }}>
                    {[...Array(5)].map((_,j)=><span key={j} style={{ color:'#f5a623', fontSize:16 }}>★</span>)}
                  </div>
                  <p style={{ fontSize: isMobile ? 15 : 17, color:'var(--text)', lineHeight:1.75, marginBottom:24, fontWeight:500 }}>"{t.quote}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:`linear-gradient(135deg,${P},#7c3aed)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, color:'white', flexShrink:0 }}>
                      {t.initials}
                    </div>
                    <div>
                      <p style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{t.name}</p>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:20 }}>
            {TESTIMONIALS.map((_,i)=>(
              <button key={i} onClick={()=>setActiveTest(i)}
                style={{ width:i===activeTest?24:8, height:8, borderRadius:4, border:'none', cursor:'pointer', transition:'all 0.3s', background:i===activeTest?P:'var(--border)' }}/>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section id="providers" style={{ padding: isMobile ? '52px 20px' : '80px 40px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <FadeUp>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: isMobile ? 28 : 48, alignItems:'center', padding: isMobile ? '32px 24px' : '52px 56px', background:`linear-gradient(135deg,rgba(99,91,255,0.04),rgba(124,58,237,0.06))`, borderRadius:16, border:'1px solid rgba(99,91,255,0.15)' }}>
              <div>
                <p className="eyebrow" style={{ marginBottom:12 }}>For Media Organisations</p>
                <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize: isMobile ? 24 : 32, letterSpacing:'-0.8px', marginBottom:12 }}>
                  List your inventory on BrandCasta
                </h2>
                <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.7, maxWidth:460 }}>
                  Receive booking requests from top Nigerian brands. Approve in one click. Get paid directly without chasing clients.
                </p>
              </div>
              <div style={{ display:'flex', flexDirection: isMobile ? 'row' : 'column', gap:10, flexWrap:'wrap', flexShrink:0 }}>
                <Link to="/register/provider" className="btn-primary" style={{ fontSize:14, padding:'12px 24px', textAlign:'center', textDecoration:'none', whiteSpace:'nowrap' }}>
                  Apply as Provider →
                </Link>
                <button onClick={()=>{ setMode('provider'); document.getElementById('auth')?.scrollIntoView({behavior:'smooth'}); }}
                  className="btn-secondary" style={{ fontSize:14, padding:'12px 20px', whiteSpace:'nowrap' }}>
                  Provider sign in
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'var(--text)', padding: isMobile ? '48px 20px 28px' : '64px 40px 32px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'isTablet ? "1fr 1fr 1fr" : "2fr 1fr 1fr 1fr"', gap: isMobile ? 28 : 48, marginBottom:48 }}>
            <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <img src={LOGO} alt="BrandCasta" style={{ width:26, height:26, objectFit:'contain', borderRadius:5, background:P, padding:2 }} onError={e=>e.target.style.display='none'}/>
                <div style={{ display:'flex' }}>
                  <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:15, color:'white' }}>Brand</span>
                  <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:15, color:'#a5b4fc' }}>Casta</span>
                </div>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:200, marginBottom:18 }}>
                Nigeria's leading media campaign operations platform. Let's Run It.
              </p>
              <div style={{ display:'flex', gap:8 }}>
                {[['𝕏','https://x.com/brandcasta_ng'],['in','https://linkedin.com/company/brandcasta-nigeria'],['ig','https://instagram.com/brandcasta_ng']].map(([icon,href])=>(
                  <a key={icon} href={href} target="_blank" rel="noreferrer"
                    style={{ width:32, height:32, borderRadius:6, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:700, textDecoration:'none', transition:'all 0.15s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.15)'; e.currentTarget.style.color='white'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            {[
              { title:'Product', links:['Features','How it works','Pricing','Analytics','Brief Generator'] },
              { title:'Company', links:['About','Newsroom','Careers','hello@brandcasta.co'] },
              { title:'Legal',   links:['Terms','Privacy Policy'] },
            ].map(col=>(
              <div key={col.title}>
                <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>{col.title}</p>
                {col.links.map(l=>(
                  <a key={l} href="#" style={{ display:'block', fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none', marginBottom:9, transition:'color 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:24, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>© 2026 BrandCasta. All rights reserved.</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Media Campaigns, Without Borders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}