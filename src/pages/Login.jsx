import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const FEATURES = [
  { title:'Television & Radio',  desc:"Prime-time spots on Channels TV, Cool FM, TVC, Wazobia FM and 60+ stations across Nigeria." },
  { title:'Podcasts',            desc:"Partner with ISWIS, The Honest Bunch, WithChude and Nigeria's fastest-growing podcast creators." },
  { title:'Out-of-Home',         desc:'Billboards, LED screens, BRT wraps, airport and mall inventory from Lagos to Abuja.' },
  { title:'Print & Digital',     desc:'Punch, Guardian, BusinessDay and leading online publishers — display, inserts and sponsored content.' },
  { title:'Influencers',         desc:'Macro, mid-tier and micro creators across Instagram, TikTok, YouTube and X.' },
  { title:'One Dashboard',       desc:'Brief, book, approve, pay and track campaign delivery — all in one place.' },
];

const STATS = [
  { value:184, suffix:'+', label:'Media Providers'  },
  { value:9,   suffix:'',  label:'Media Categories' },
  { value:36,  suffix:'+', label:'Cities Covered'   },
];

const STEPS = [
  { n:'01', title:'Create a brief',  desc:'Tell us your brand, goals and target audience. Upload decks and creative assets.' },
  { n:'02', title:'Pick your media', desc:'Browse 184+ verified providers. Filter by category, city or format.' },
  { n:'03', title:'Book & pay',      desc:'Provider confirms within 24 hours. Pay securely via Paystack.' },
  { n:'04', title:'Track delivery',  desc:'Provider uploads proof. You review and approve. Campaign closed.' },
];

const TESTIMONIALS = [
  { quote:"BrandCasta made it incredibly easy to run a multi-platform campaign across radio and OOH in three cities at once. What used to take weeks now takes hours.", name:'Chukwuemeka Obi', role:'Head of Marketing, Kuda Bank' },
  { quote:"As a media owner, receiving booking requests directly to my inbox with one-click approve or decline has completely changed how I manage ad sales.", name:'Adaeze Nwosu', role:'Sales Director, Cool FM Lagos' },
  { quote:"I booked podcast ads, billboard space and an influencer campaign all in one brief. The transparency on pricing and delivery proof is unmatched.", name:'Tunde Adegoke', role:'Brand Manager, PalmPay' },
];

// Motion variants
const fadeUp    = { hidden:{ opacity:0, y:22 }, show:{ opacity:1, y:0, transition:{ duration:0.55, ease:[0.22,1,0.36,1] } } };
const fadeRight = { hidden:{ opacity:0, x:28 }, show:{ opacity:1, x:0, transition:{ duration:0.55, ease:[0.22,1,0.36,1] } } };
const stagger   = { hidden:{}, show:{ transition:{ staggerChildren:0.1 } } };

// Scroll-triggered fade up
function FadeUp({ children, delay=0, style={}, className='' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting){ setVisible(true); obs.disconnect(); }}, { threshold:0.1, rootMargin:'-40px' });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(18px)', transition:`opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// Count up
function CountUp({ target, suffix='' }) {
  const [count, setCount] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let v = 0;
        const step = target / 50;
        const t = setInterval(() => {
          v = Math.min(v + step, target);
          setCount(Math.floor(v));
          if (v >= target) clearInterval(t);
        }, 28);
      }
    }, { threshold:0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode]              = useState('login');
  const [email, setEmail]            = useState('');
  const [password, setPassword]      = useState('');
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState('');
  const [agreedToTerms, setAgreed]   = useState(false);
  const [activeTestimonial, setActive] = useState(0);
  const [menuOpen, setMenuOpen]      = useState(false);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handle = async (fn) => {
    setLoading(true); setError('');
    try { await fn(); navigate('/dashboard'); }
    catch(e) { setError(e.message.replace('Firebase: ', '').replace(/\(auth.*?\)/g, '').trim()); }
    finally { setLoading(false); }
  };

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setMenuOpen(false); };
  const isProvider = mode === 'provider';

  // Purple palette
  const P = '#6366f1';
  const P2 = '#a855f7';
  const PDIM = 'rgba(99,102,241,0.1)';
  const PBORDER = 'rgba(99,102,241,0.28)';

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', color:'rgba(255,255,255,0.92)', fontFamily:'Inter,sans-serif', overflowX:'hidden' }}>
      <PageTitle title="" description="Book TV, radio, billboard and influencer campaigns across Nigeria. 184+ verified media providers."/>

      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        .l-nav-link{font-size:12px;color:rgba(255,255,255,0.45);cursor:pointer;letter-spacing:0.06em;text-transform:uppercase;background:none;border:none;font-family:Inter,sans-serif;transition:color 0.2s}
        .l-nav-link:hover{color:rgba(255,255,255,0.85)}
        .l-feat-card{transition:border-color 0.2s,transform 0.2s}
        .l-feat-card:hover{border-color:rgba(99,102,241,0.4)!important;transform:translateY(-2px)}
        .l-step-card{transition:border-color 0.2s}
        .l-step-card:hover{border-color:rgba(99,102,241,0.3)!important}
        .l-footer-link{color:rgba(255,255,255,0.35);text-decoration:none;font-size:12px;transition:color 0.2s;display:block;margin-bottom:8px}
        .l-footer-link:hover{color:rgba(255,255,255,0.7)}
        .l-px{padding-left:40px;padding-right:40px;max-width:1120px;margin:0 auto}
        @media(max-width:560px){.l-px{padding-left:20px;padding-right:20px}}
        .l-hero-grid{display:grid;grid-template-columns:1fr 380px;gap:56px;align-items:start}
        @media(max-width:900px){.l-hero-grid{grid-template-columns:1fr;gap:36px}}
        .l-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.07)}
        @media(max-width:900px){.l-feat-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:560px){.l-feat-grid{grid-template-columns:1fr}}
        .l-steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,0.07)}
        @media(max-width:900px){.l-steps-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:560px){.l-steps-grid{grid-template-columns:1fr}}
        .l-prov-grid{display:grid;grid-template-columns:1fr auto;gap:36px;align-items:center}
        @media(max-width:768px){.l-prov-grid{grid-template-columns:1fr;gap:20px}}
        .l-foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:36px}
        @media(max-width:900px){.l-foot-grid{grid-template-columns:1fr 1fr;gap:24px}}
        .l-stats-row{display:flex;gap:28px;flex-wrap:wrap}
        .l-mode-btn{flex:1;padding:8px 4px;font-size:11px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;letter-spacing:0.04em;text-transform:uppercase;border:none;transition:all 0.15s}
        body::before{display:none!important}
      `}</style>

      {/* NAV */}
      <motion.nav initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        style={{ position:'sticky', top:0, zIndex:200, background:'rgba(10,10,15,0.96)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="l-px" style={{ height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:26, height:26, objectFit:'contain' }}/>
            <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:15, letterSpacing:'-0.2px' }}>BrandCasta</span>
          </div>
          <div style={{ display:'flex', gap:28, alignItems:'center' }}>
            {[['Features','features'],['How it works','how-it-works'],['For Providers','providers']].map(([l,id])=>(
              <button key={l} onClick={()=>scrollTo(id)} className="l-nav-link">{l}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <Link to="/register/provider" style={{ fontSize:11, color:'rgba(255,255,255,0.45)', textDecoration:'none', fontWeight:500, padding:'6px 12px', border:'1px solid rgba(255,255,255,0.1)', letterSpacing:'0.04em', textTransform:'uppercase', fontFamily:'Inter,sans-serif' }}>
              List Media
            </Link>
            <button onClick={()=>scrollTo('auth-panel')} style={{ fontSize:11, fontWeight:700, padding:'7px 16px', background:`linear-gradient(135deg,${P},${P2})`, color:'white', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Sign In
            </button>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="l-px" style={{ padding:'64px 40px 56px' }}>
        <div className="l-hero-grid">

          {/* Left — stagger */}
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Eyebrow */}
            <motion.div variants={fadeUp}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', background:PDIM, border:`1px solid ${PBORDER}`, marginBottom:22 }}>
              <span style={{ width:5, height:5, background:'#86efac', flexShrink:0 }}/>
              <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, fontWeight:500, color:P, letterSpacing:'0.1em', textTransform:'uppercase' }}>Nigeria's Media Campaign Platform</span>
            </motion.div>

            <motion.h1 variants={fadeUp}
              style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:52, lineHeight:1.06, letterSpacing:'-1.8px', marginBottom:18 }}>
              Book media campaigns<br/>
              <span style={{ background:`linear-gradient(135deg,${P},${P2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>across Nigeria</span>
            </motion.h1>

            <motion.p variants={fadeUp}
              style={{ fontSize:15, color:'rgba(255,255,255,0.48)', lineHeight:1.75, maxWidth:460, marginBottom:28 }}>
              One platform to discover, book and manage campaigns across TV, radio, podcasts, billboards, print and influencers — 184+ verified providers.
            </motion.p>

            {/* Stats */}
            <motion.div variants={fadeUp}
              style={{ marginBottom:28, padding:'16px 20px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:`2px solid ${P}` }}>
              <div className="l-stats-row">
                {STATS.map(s => (
                  <div key={s.label}>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, color:'rgba(255,255,255,0.92)', lineHeight:1, marginBottom:4 }}>
                      <CountUp target={s.value} suffix={s.suffix}/>
                    </p>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={()=>{ setMode('signup'); scrollTo('auth-panel'); }}
                style={{ padding:'12px 26px', background:`linear-gradient(135deg,${P},${P2})`, color:'white', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif', letterSpacing:'0.04em', transition:'all 0.2s' }}>
                Start for free →
              </button>
              <Link to="/register/provider"
                style={{ padding:'12px 18px', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.55)', fontWeight:500, fontSize:12, border:'1px solid rgba(255,255,255,0.1)', textDecoration:'none', display:'inline-flex', alignItems:'center', fontFamily:'Inter,sans-serif', letterSpacing:'0.04em' }}>
                List your inventory
              </Link>
            </motion.div>
          </motion.div>

          {/* AUTH PANEL */}
          <motion.div variants={fadeRight} initial="hidden" animate="show" id="auth-panel"
            style={{ background:'#0d0d1a', border:`1px solid ${PBORDER}`, padding:24, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:160, height:160, borderRadius:'50%', background:`radial-gradient(circle,${PDIM},transparent 70%)`, pointerEvents:'none' }}/>

            <div style={{ textAlign:'center', marginBottom:16 }}>
              <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:32, height:32, objectFit:'contain', marginBottom:8 }}/>
              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, marginBottom:3 }}>
                {isProvider ? 'Provider Sign In' : mode==='login' ? 'Welcome back' : 'Get started free'}
              </p>
              <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.32)', letterSpacing:'0.06em' }}>
                {isProvider ? 'Provider dashboard' : mode==='login' ? 'Brand dashboard' : 'Create your account'}
              </p>
            </div>

            {/* Mode tabs */}
            <div style={{ display:'flex', gap:0, background:'rgba(255,255,255,0.04)', padding:2, marginBottom:14, border:'1px solid rgba(255,255,255,0.07)' }}>
              {[['login','Sign In'],['signup','Sign Up'],['provider','Provider']].map(([m,label])=>(
                <button key={m} onClick={()=>setMode(m)} className="l-mode-btn"
                  style={{ background:mode===m?`linear-gradient(135deg,${P},${P2})`:'transparent', color:mode===m?'white':'rgba(255,255,255,0.35)', borderRadius:0 }}>
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ padding:'8px 12px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#fca5a5', fontFamily:'IBM Plex Mono,monospace', fontSize:10, marginBottom:10 }}>
                {error}
              </div>
            )}

            {mode==='signup' && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:10 }}
                onClick={()=>setAgreed(a=>!a)}>
                <div style={{ width:16, height:16, flexShrink:0, marginTop:1, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                  border:agreedToTerms?'none':'1px solid rgba(255,255,255,0.2)',
                  background:agreedToTerms?`linear-gradient(135deg,${P},${P2})`:'rgba(255,255,255,0.04)' }}>
                  {agreedToTerms&&<svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.45)', lineHeight:1.6, cursor:'pointer', letterSpacing:'0.04em' }}>
                  I agree to BrandCasta's{' '}
                  <Link to="/terms" target="_blank" onClick={e=>e.stopPropagation()} style={{ color:P, textDecoration:'underline' }}>Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" onClick={e=>e.stopPropagation()} style={{ color:P, textDecoration:'underline' }}>Privacy Policy</Link>
                </p>
              </div>
            )}

            {/* Google */}
            <button onClick={()=>{
                if (mode==='signup'&&!agreedToTerms){ setError('Please agree to the Terms & Conditions before continuing.'); return; }
                handle(loginWithGoogle);
              }} disabled={loading}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.75)', fontWeight:500, fontSize:12, cursor:'pointer', marginBottom:12, fontFamily:'Inter,sans-serif', transition:'all 0.15s' }}>
              <svg width="15" height="15" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0124 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
              {isProvider ? 'Sign in as Provider with Google' : 'Continue with Google'}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.08)' }}/>
              <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.1em' }}>OR</span>
              <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.08)' }}/>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:0, borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:8 }}>
              <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}
                style={{ background:'transparent', border:'none', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 0', fontSize:13, color:'white', fontFamily:'Inter,sans-serif', outline:'none', marginBottom:8 }}
                onFocus={e=>e.target.style.borderBottomColor=P} onBlur={e=>e.target.style.borderBottomColor='rgba(255,255,255,0.08)'}/>
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
                style={{ background:'transparent', border:'none', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 0', fontSize:13, color:'white', fontFamily:'Inter,sans-serif', outline:'none', marginBottom:12 }}
                onFocus={e=>e.target.style.borderBottomColor=P} onBlur={e=>e.target.style.borderBottomColor='rgba(255,255,255,0.08)'}
                onKeyDown={e=>{ if(e.key==='Enter'){ if(mode==='signup'&&!agreedToTerms){setError('Please agree to the Terms & Conditions.');return;} handle(()=>mode==='login'||isProvider?login(email,password):signup(email,password)); }}}/>
            </div>

            <button onClick={()=>{ if(mode==='signup'&&!agreedToTerms){setError('Please agree to the Terms & Conditions.');return;} handle(()=>mode==='login'||isProvider?login(email,password):signup(email,password)); }}
              disabled={loading}
              style={{ width:'100%', padding:'12px', border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'white', transition:'all 0.2s', letterSpacing:'0.04em',
                background:isProvider?`linear-gradient(135deg,#14b8a6,#06b6d4)`:`linear-gradient(135deg,${P},${P2})` }}>
              {loading ? <><Spinner size={13}/>{isProvider||mode==='login'?'Signing in…':'Creating account…'}</> : isProvider?'Sign In as Provider →':mode==='login'?'Sign In →':'Create Account →'}
            </button>

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:14, paddingTop:12, textAlign:'center' }}>
              {!isProvider ? (
                <>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.22)', letterSpacing:'0.06em', marginBottom:8 }}>Media organisation? Join as a provider</p>
                  <Link to="/register/provider" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', background:'rgba(20,184,166,0.07)', border:'1px solid rgba(20,184,166,0.2)', color:'#5eead4', fontWeight:600, fontSize:11, textDecoration:'none', fontFamily:'Inter,sans-serif', letterSpacing:'0.04em' }}>
                    Apply as a Provider →
                  </Link>
                </>
              ) : (
                <>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.22)', letterSpacing:'0.06em', marginBottom:8 }}>Not yet a provider?</p>
                  <Link to="/register/provider" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', background:'rgba(20,184,166,0.07)', border:'1px solid rgba(20,184,166,0.2)', color:'#5eead4', fontWeight:600, fontSize:11, textDecoration:'none', fontFamily:'Inter,sans-serif', letterSpacing:'0.04em' }}>
                    Apply to join BrandCasta →
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'64px 0' }}>
        <div className="l-px">
          <FadeUp style={{ textAlign:'center', marginBottom:36 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:P, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10 }}>Everything in one place</p>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:34, letterSpacing:'-0.8px', color:'white', marginBottom:8 }}>
              Nigeria's full <span style={{ background:`linear-gradient(135deg,${P},${P2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>media landscape</span>
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.38)', maxWidth:400, margin:'0 auto', lineHeight:1.7 }}>
              From a 30-second radio spot to a full-page spread — book it all through BrandCasta.
            </p>
          </FadeUp>
          <div className="l-feat-grid">
            {FEATURES.map((f,i)=>(
              <FadeUp key={f.title} delay={i*0.06}>
                <div className="l-feat-card" style={{ padding:'22px', background:'#0a0a0f', border:'1px solid rgba(255,255,255,0.07)', height:'100%', borderTop:`2px solid transparent` }}>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, marginBottom:8, color:'white' }}>{f.title}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.7 }}>{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:'64px 0' }}>
        <div className="l-px">
          <FadeUp style={{ textAlign:'center', marginBottom:36 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:P, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10 }}>Simple by design</p>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:34, letterSpacing:'-0.8px', color:'white' }}>
              How <span style={{ background:`linear-gradient(135deg,${P},${P2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>BrandCasta</span> works
            </h2>
          </FadeUp>
          <div className="l-steps-grid">
            {STEPS.map((s,i)=>(
              <FadeUp key={s.n} delay={i*0.08}>
                <div className="l-step-card" style={{ padding:'22px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', height:'100%' }}>
                  <div style={{ position:'relative', marginBottom:14 }}>
                    <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:900, fontSize:56, color:`${PDIM}`, lineHeight:1, position:'absolute', top:-8, left:-4, letterSpacing:'-2px', userSelect:'none' }}>{s.n}</div>
                    <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:11, fontWeight:500, color:P, letterSpacing:'0.08em', paddingTop:8 }}>{s.n}</div>
                  </div>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, marginBottom:6, color:'white' }}>{s.title}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.7 }}>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'64px 0' }}>
        <div className="l-px" style={{ maxWidth:680, margin:'0 auto' }}>
          <FadeUp style={{ textAlign:'center', marginBottom:32 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:P, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10 }}>What users say</p>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:30, letterSpacing:'-0.6px', color:'white' }}>
              Real stories, <span style={{ background:`linear-gradient(135deg,${P},${P2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>real results</span>
            </h2>
          </FadeUp>
          <div style={{ minHeight:160 }}>
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t,i) => i===activeTestimonial && (
                <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.35 }}
                  style={{ padding:'22px 24px', background:'#0d0d1a', border:`1px solid ${PBORDER}`, borderLeft:`2px solid ${P}` }}>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.72)', lineHeight:1.8, marginBottom:16, fontStyle:'italic' }}>"{t.quote}"</p>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:12, color:'white' }}>{t.name}</p>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.32)', marginTop:2, letterSpacing:'0.06em' }}>{t.role}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:7, marginTop:16 }}>
            {TESTIMONIALS.map((_,i)=>(
              <button key={i} onClick={()=>setActive(i)}
                style={{ height:3, border:'none', cursor:'pointer', transition:'all 0.3s', borderRadius:0,
                  width: i===activeTestimonial?24:8,
                  background: i===activeTestimonial?P:'rgba(255,255,255,0.15)' }}/>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section id="providers" style={{ padding:'64px 0' }}>
        <div className="l-px">
          <FadeUp>
            <div className="l-prov-grid" style={{ padding:'40px', background:'rgba(20,184,166,0.04)', border:'1px solid rgba(20,184,166,0.14)', borderLeft:'2px solid #14b8a6' }}>
              <div>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#5eead4', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10 }}>Media organisations</p>
                <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, letterSpacing:'-0.6px', color:'white', marginBottom:10 }}>
                  List your inventory on <span style={{ color:'#5eead4' }}>BrandCasta</span>
                </h2>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.75 }}>
                  Receive booking requests from top Nigerian brands. Approve in one click. Get paid directly — no chasing clients.
                </p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:190 }}>
                <Link to="/register/provider" style={{ padding:'12px 20px', background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.3)', color:'#5eead4', fontWeight:700, fontSize:12, textDecoration:'none', textAlign:'center', fontFamily:'Manrope,sans-serif', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
                  Apply as a Provider →
                </Link>
                <button onClick={()=>scrollTo('auth-panel')} style={{ padding:'12px 20px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', fontWeight:500, fontSize:11, cursor:'pointer', fontFamily:'Inter,sans-serif', letterSpacing:'0.04em' }}>
                  Already have an account?
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'48px 0 28px' }}>
        <div className="l-px">
          <div className="l-foot-grid" style={{ marginBottom:36 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:22, height:22, objectFit:'contain' }}/>
                <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:14 }}>BrandCasta</span>
              </div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.32)', lineHeight:1.75, maxWidth:200, marginBottom:16 }}>Nigeria's leading media campaign operations platform.</p>
              <div style={{ display:'flex', gap:7 }}>
                {[['𝕏','https://x.com/brandcasta_ng'],['in','https://linkedin.com/company/brandcasta-nigeria'],['ig','https://instagram.com/brandcasta_ng']].map(([icon,href])=>(
                  <a key={icon} href={href} target="_blank" rel="noreferrer"
                    style={{ width:28, height:28, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)', fontSize:10, fontWeight:700, textDecoration:'none', transition:'all 0.15s' }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, fontWeight:500, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Company</p>
              {['About Us','Newsroom','Insights','Careers'].map(l=><a key={l} href="#" className="l-footer-link">{l}</a>)}
            </div>
            <div>
              <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, fontWeight:500, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Support</p>
              {['Contact','Documentation','FAQ'].map(l=><a key={l} href="#" className="l-footer-link">{l}</a>)}
              <a href="mailto:hello@brandcasta.co" className="l-footer-link">hello@brandcasta.co</a>
            </div>
            <div>
              <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, fontWeight:500, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Legal</p>
              <Link to="/terms" className="l-footer-link">Terms & Conditions</Link>
              <Link to="/privacy" className="l-footer-link">Privacy Policy</Link>
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:16, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.04em' }}>© 2026 BrandCasta. All rights reserved.</p>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.04em' }}>Nigeria's media campaign operations platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}