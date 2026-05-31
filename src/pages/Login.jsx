import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';
const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';

const FEATURES = [
  { title:'Television & Radio',  desc:"Prime-time spots on Channels TV, Cool FM, TVC, Wazobia FM and 60+ stations across Nigeria." },
  { title:'Podcasts',            desc:"Partner with ISWIS, The Honest Bunch, WithChude and Nigeria's fastest-growing podcast creators." },
  { title:'Out-of-Home',         desc:'Billboards, LED screens, BRT wraps, airport and mall inventory from Lagos to Abuja.' },
  { title:'Print & Digital',     desc:'Punch, Guardian, BusinessDay and leading online publishers; display, inserts and sponsored content.' },
  { title:'Influencers',         desc:'Macro, mid-tier and micro creators across Instagram, TikTok, YouTube and X.' },
  { title:'One Dashboard',       desc:'Brief, book, approve, pay and track campaign delivery, all in one place.' },
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

const STATS = [
  { value:'184+', label:'PROVIDERS' },
  { value:'9',    label:'MEDIA TYPES' },
  { value:'36+',  label:'CITIES COVERED' },
];

// Count-up hook
function useCountUp(target, duration=1400) {
  const [count, setCount] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const num = parseInt(target);
    if (isNaN(num)) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let v = 0;
        const step = num / (duration / 16);
        const t = setInterval(() => {
          v = Math.min(v + step, num);
          setCount(Math.floor(v));
          if (v >= num) clearInterval(t);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return [count, ref];
}

// Scroll-triggered fade up
function FadeUp({ children, delay=0, style={}, className='' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold:0.08, rootMargin:'-30px' });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// Word-by-word stagger
function StaggerWords({ text, style={} }) {
  const words = text.split(' ');
  return (
    <span>
      {words.map((word, i) => (
        <motion.span key={i}
          initial={{ opacity:0, y:'110%' }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1], delay:0.1 + i*0.07 }}
          style={{ display:'inline-block', overflow:'hidden', ...style }}>
          {word}{i < words.length-1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
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
  const [activeTest, setActiveTest]  = useState(0);
  const [showAuth, setShowAuth]      = useState(false);
  const [menuOpen, setMenuOpen]      = useState(false);

  useEffect(() => {
    const t = setInterval(() => setActiveTest(a => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handle = async (fn) => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const result = await fn();
      if (result !== null && result !== undefined) navigate('/dashboard');
    }
    catch(e) {
      const msg = (e.message||'').replace('Firebase: ','').replace(/\(auth.*?\)/g,'').trim();
      if (msg) setError(msg);
    }
    finally { setLoading(false); }
  };

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setMenuOpen(false); };
  const openAuth = (m='login') => { setMode(m); setShowAuth(true); setTimeout(()=>scrollTo('auth-anchor'),100); };
  const isProvider = mode==='provider';

  // Gold accent colour (from screenshot)
  const GOLD = '#6366f1';
  const GOLD_DIM = 'rgba(99,102,241,0.1)';
  const GOLD_BORDER = 'rgba(99,102,241,0.28)';

  return (
    <div style={{ minHeight:'100vh', background:'#0e0e13', color:'rgba(255,255,255,0.92)', fontFamily:'Inter,sans-serif', overflowX:'hidden' }}>
      <PageTitle title="BrandCasta — Media Campaigns, Without Borders" description="Book TV, radio, billboard, podcast and influencer campaigns across 184+ verified Nigerian media providers."/>

      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        body::before{display:none!important}
        .l-cta-pri:hover{background:linear-gradient(135deg,#4f51d4,#7c3aed) !important}
        .l-cta-sec:hover{color:rgba(255,255,255,0.7) !important}
        .l-google-btn:hover{border-color:rgba(99,102,241,0.28) !important}
        .l-prov-btn:hover{background:#b8932e !important}
        .l-prov-btn2:hover{border-color:rgba(255,255,255,0.4) !important;color:rgba(255,255,255,0.7) !important}
        .l-social-btn:hover{border-color:rgba(99,102,241,0.28) !important;color:#6366f1 !important}

        /* Grid lines background */
        .l-grid-bg {
          position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 100% 80% at 50% 0%, black 40%, transparent 100%);
        }

        .l-px { padding-left:48px; padding-right:48px; max-width:1200px; margin:0 auto; }
        @media(max-width:768px){ .l-px { padding-left:24px; padding-right:24px; } }

        .l-nav-btn { background:none; border:none; font-family:Inter,sans-serif; font-size:11px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.45); cursor:pointer; transition:color 0.2s; padding:0; }
        .l-nav-btn:hover { color:rgba(255,255,255,0.85); }

        .l-feat-card { transition:border-color 0.25s, background 0.25s; cursor:default; }
        .l-feat-card:hover { border-color:${GOLD_BORDER}!important; background:rgba(99,102,241,0.06)!important; }

        .l-footer-link { color:rgba(255,255,255,0.35); text-decoration:none; font-size:12px; transition:color 0.2s; display:block; margin-bottom:9px; }
        .l-footer-link:hover { color:${GOLD}; }

        .l-stat-divider { width:1px; background:rgba(255,255,255,0.1); align-self:stretch; }

        /* Auth panel input */
        .l-inp {
          width:100%; background:transparent; border:none;
          border-bottom:1px solid rgba(255,255,255,0.12);
          padding:10px 0; font-size:13px; color:white;
          font-family:Inter,sans-serif; outline:none;
          transition:border-color 0.2s;
        }
        .l-inp::placeholder { color:rgba(255,255,255,0.28); }
        .l-inp:focus { border-bottom-color:${GOLD}; }

        .l-tab-btn {
          flex:1; padding:8px 4px; font-size:10px; font-weight:700;
          letter-spacing:0.08em; text-transform:uppercase;
          cursor:pointer; font-family:Inter,sans-serif;
          border:none; transition:all 0.15s;
        }
      `}</style>

      {/* ── NAV ── */}
      <motion.nav initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }}
        style={{ position:'sticky', top:0, zIndex:100, background:'rgba(14,14,19,0.95)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div className="l-px" style={{ height:56, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', flexShrink:0 }}>
            <img src={LOGO} alt="BrandCasta" style={{ width:26, height:26, objectFit:"contain" }}/>
            <div style={{ display:'flex' }}>
              <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color:'white', letterSpacing:'-0.2px' }}>Brand</span><span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color:'#4d50d6', letterSpacing:'-0.2px' }}>Casta</span>
            </div>
          </div>
          <div className="l-nav-links-desktop">
            <button className="l-nav-btn" onClick={()=>scrollTo('features')}>Features</button>
            <button className="l-nav-btn" onClick={()=>scrollTo('how-it-works')}>How it works</button>
            <button className="l-nav-btn" onClick={()=>scrollTo('providers')}>Providers</button>
          </div>
          <button onClick={()=>openAuth('login')}
            style={{ padding:'8px 14px', background:GOLD, color:'white', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', border:'none', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
            Sign In
          </button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div className="l-grid-bg"/>

        <div className="l-px" style={{ position:'relative', zIndex:1, paddingTop:96, paddingBottom:0, flex:1 }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, delay:0.1 }}
            style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
            <div style={{ width:32, height:1, background:GOLD }}/>
            <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, fontWeight:500, color:GOLD, letterSpacing:'0.2em', textTransform:'uppercase' }}>
              Media Campaigns, Without Borders
            </span>
          </motion.div>

          {/* Hero grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', gap:64, alignItems:'flex-start' }}>

            {/* Left — headline + CTA */}
            <div>
              <h1 style={{ fontFamily:'Georgia,"Times New Roman",serif', fontWeight:700, fontSize:'clamp(48px,5.5vw,80px)', lineHeight:1.04, letterSpacing:'-2px', marginBottom:28, color:'white' }}>
                <div style={{ overflow:'visible', paddingBottom:'0.08em' }}>
                  <StaggerWords text="Book media"/>
                </div>
                <div style={{ overflow:'visible', paddingBottom:'0.12em' }}>
                  <StaggerWords text="campaigns."/>
                </div>
                <div style={{ overflow:'visible', paddingBottom:'0.12em' }}>
                  <motion.span
                    initial={{ opacity:0, y:'110%' }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.7, ease:[0.22,1,0.36,1], delay:0.42 }}
                    style={{ display:'inline-block', fontStyle:'italic', background:`linear-gradient(135deg,${GOLD},#a855f7)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', paddingBottom:'0.15em', lineHeight:1.1 }}>
                    One Platform.
                  </motion.span>
                </div>
              </h1>

              <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.48, duration:0.5 }}
                style={{ marginBottom:24 }}>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.35)', letterSpacing:'0.14em', textTransform:'uppercase' }}>
                  Let's Run It.
                </p>
              </motion.div>

              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55, duration:0.5 }}
                style={{ maxWidth:480, marginBottom:36 }}>
                <p style={{ fontSize:17, color:'rgba(255,255,255,0.65)', lineHeight:1.78, marginBottom:16 }}>
                  One platform to discover, book, generate and manage campaigns across Podcasts, Live Streaming Apps, TV, Radio, Billboards, Print and Social-Media Influencers.
                </p>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:13, color:'rgba(255,255,255,0.5)', letterSpacing:'0.04em', lineHeight:1.8 }}>
                  5Sec Subsidized Ad-Spots · No Delayed Payment · MPO &amp; Invoice · Ad Tracker · Proof of Performance
                </p>
              </motion.div>

              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65, duration:0.5 }}
                style={{ display:'flex', alignItems:'center', gap:24 }}>
                <button onClick={()=>openAuth('signup')}
                  style={{ padding:'16px 32px', background:`linear-gradient(135deg,${GOLD},#a855f7)`, color:'white', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', border:'none', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:10 }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='#4f51d4'; e.currentTarget.style.paddingRight='38px'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=GOLD; e.currentTarget.style.paddingRight='32px'; }}>
                  Start a Campaign
                </button>
                <button onClick={()=>scrollTo('features')}
                  style={{ fontFamily:'Inter,sans-serif', fontWeight:600, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.38)', background:'none', border:'none', cursor:'pointer', transition:'color 0.2s', display:'flex', alignItems:'center', gap:8 }}
                  className="l-cta-sec">
                  Browse Providers →
                </button>
              </motion.div>
            </div>

            {/* Right — auth panel */}
            <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3, duration:0.6, ease:[0.22,1,0.36,1] }} id="auth-anchor" style={{ width:'100%', minWidth:0 }}>
              <div style={{ background:'#0d0d1a', border:`1px solid ${GOLD_BORDER}`, padding:24 }}>

                <div style={{ textAlign:'center', marginBottom:16 }}>
                  <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:16, color:'white', marginBottom:3 }}>
                    {isProvider ? 'Provider Sign In' : mode==='login' ? 'Welcome back' : 'Get started free'}
                  </p>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                    {isProvider ? 'Access your provider dashboard' : mode==='login' ? 'Sign in to your account' : 'Create your BrandCasta account'}
                  </p>
                </div>

                {/* Tabs */}
                <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', marginBottom:16, border:'1px solid rgba(255,255,255,0.08)' }}>
                  {[['login','Sign In'],['signup','Sign Up'],['provider','Provider']].map(([m,label])=>(
                    <button key={m} className="l-tab-btn" onClick={()=>setMode(m)}
                      style={{ background:mode===m?`linear-gradient(135deg,${GOLD},#a855f7)`:'transparent', color:mode===m?'white':'rgba(255,255,255,0.38)' }}>
                      {label}
                    </button>
                  ))}
                </div>

                {error && (
                  <div style={{ padding:'8px 10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#fca5a5', marginBottom:10 }}>
                    {error}
                  </div>
                )}

                {mode==='signup' && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:12, cursor:'pointer' }} onClick={()=>setAgreed(a=>!a)}>
                    <div style={{ width:14, height:14, flexShrink:0, marginTop:1, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                      border:agreedToTerms?'none':'1px solid rgba(255,255,255,0.25)',
                      background:agreedToTerms?GOLD:'rgba(255,255,255,0.04)' }}>
                      {agreedToTerms&&<svg width="9" height="9" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.38)', lineHeight:1.6, letterSpacing:'0.04em' }}>
                      I agree to BrandCasta's{' '}
                      <Link to="/terms" target="_blank" onClick={e=>e.stopPropagation()} style={{ color:GOLD, textDecoration:'underline' }}>Terms</Link>
                      {' '}and{' '}
                      <Link to="/privacy" target="_blank" onClick={e=>e.stopPropagation()} style={{ color:GOLD, textDecoration:'underline' }}>Privacy Policy</Link>
                    </p>
                  </div>
                )}

                {/* Google */}
                <button onClick={()=>{ if(mode==='signup'&&!agreedToTerms){setError('Please agree to the Terms & Conditions.');return;} handle(loginWithGoogle); }} disabled={loading}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)', fontFamily:'Inter,sans-serif', fontWeight:500, fontSize:12, cursor:'pointer', marginBottom:12, transition:'all 0.15s' }}
                  className="l-google-btn">
                  <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0124 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
                  {isProvider ? 'Sign in as Provider' : 'Continue with Google'}
                </button>

                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.1)' }}/>
                  <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.22)', letterSpacing:'0.1em' }}>OR</span>
                  <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.1)' }}/>
                </div>

                <input className="l-inp" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={{ marginBottom:8 }}/>
                <input className="l-inp" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
                  style={{ marginBottom:14 }}
                  onKeyDown={e=>{ if(e.key==='Enter'){ if(mode==='signup'&&!agreedToTerms){setError('Please agree to the Terms & Conditions.');return;} handle(()=>mode==='login'||isProvider?login(email,password):signup(email,password)); }}}/>

                <button onClick={()=>{ if(mode==='signup'&&!agreedToTerms){setError('Please agree to the Terms & Conditions.');return;} handle(()=>mode==='login'||isProvider?login(email,password):signup(email,password)); }}
                  disabled={loading}
                  style={{ width:'100%', padding:'12px', background:isProvider?'linear-gradient(135deg,#14b8a6,#06b6d4)':`linear-gradient(135deg,${GOLD},#a855f7)`, color:'white', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.2s' }}>
                  {loading?<><Spinner size={12}/>{mode==='login'||isProvider?'Signing in…':'Creating account…'}</>:isProvider?'Provider Sign In →':mode==='login'?'Sign In →':'Create Account →'}
                </button>

                <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.06em', marginBottom:8 }}>
                    {isProvider ? 'Not yet a provider?' : 'Media organisation?'}
                  </p>
                  <Link to="/register/provider" style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#5eead4', textDecoration:'none', letterSpacing:'0.08em', textTransform:'uppercase', border:'1px solid rgba(20,184,166,0.25)', padding:'6px 14px', display:'inline-block', transition:'all 0.15s' }}>
                    Apply as Provider →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats row — bottom of hero */}
        <div style={{ position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,0.1)', marginTop:40 }}>
          <div className="l-px stats-row-inner" style={{ display:'flex', width:'100%' }}>
            {STATS.map((s, i) => {
              const num = parseInt(s.value);
              const suffix = s.value.replace(num.toString(), '');
              return (
                <div key={s.label} className="stat-cell" style={{ flex:1, minWidth:0, overflow:'hidden', padding:'24px 0', borderRight: i < STATS.length-1 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingLeft: i > 0 ? 'clamp(12px,4%,40px)' : 0, paddingRight: i < STATS.length-1 ? 'clamp(12px,4%,40px)' : 0 }}>
                  <FadeUp delay={i * 0.1}>
                    <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(26px,5vw,42px)', letterSpacing:'-1.5px', color:'white', lineHeight:1, marginBottom:8 }}>
                      {num}<span style={{ fontSize:24, color:GOLD }}>{suffix}</span>
                    </p>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.38)', letterSpacing:'0.16em', textTransform:'uppercase' }}>{s.label}</p>
                  </FadeUp>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'80px 0' }}>
        <div className="l-px">
          <FadeUp style={{ marginBottom:48 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:GOLD, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>Media Channels</p>
            <h2 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(28px,4vw,44px)', color:'white', letterSpacing:'-1px', lineHeight:1.1 }}>
              Every channel.<br/>One brief.
            </h2>
          </FadeUp>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(255,255,255,0.08)' }}>
            {FEATURES.map((f,i)=>(
              <FadeUp key={f.title} delay={i*0.07}>
                <div className="l-feat-card" style={{ padding:'28px 26px', background:'#0e0e13', border:'1px solid transparent', height:'100%' }}>
                  <div style={{ width:28, height:1, background:GOLD, marginBottom:18 }}/>
                  <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:15, color:'white', marginBottom:10, letterSpacing:'-0.2px' }}>{f.title}</p>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.75 }}>{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:'80px 0' }}>
        <div className="l-px">
          <FadeUp style={{ marginBottom:48 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:GOLD, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>Process</p>
            <h2 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(28px,4vw,44px)', color:'white', letterSpacing:'-1px' }}>How it works</h2>
          </FadeUp>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, background:'rgba(255,255,255,0.07)' }}>
            {STEPS.map((s,i)=>(
              <FadeUp key={s.n} delay={i*0.09}>
                <div style={{ padding:'28px 24px', background:'#0e0e13', height:'100%', borderRight:i<3?'1px solid rgba(255,255,255,0.07)':'none', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:16, right:20, fontFamily:'Georgia,serif', fontWeight:700, fontSize:56, color:'rgba(255,255,255,0.04)', letterSpacing:'-2px', lineHeight:1, userSelect:'none' }}>{s.n}</div>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:GOLD, letterSpacing:'0.12em', marginBottom:16 }}>{s.n}</p>
                  <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:15, color:'white', marginBottom:8, letterSpacing:'-0.2px' }}>{s.title}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.75 }}>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'80px 0' }}>
        <div className="l-px" style={{ maxWidth:720, margin:'0 auto' }}>
          <FadeUp style={{ marginBottom:36 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:GOLD, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>Testimonials</p>
            <h2 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(24px,3vw,36px)', color:'white', letterSpacing:'-0.8px' }}>What our clients say</h2>
          </FadeUp>
          <div style={{ minHeight:150 }}>
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t,i) => i===activeTest && (
                <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.35 }}
                  style={{ padding:'28px 32px', background:'rgba(255,255,255,0.03)', borderLeft:`2px solid ${GOLD}`, border:`1px solid rgba(255,255,255,0.09)`, borderLeft:`2px solid ${GOLD}` }}>
                  <div style={{ width:24, height:1, background:GOLD, marginBottom:20 }}/>
                  <p style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize:16, color:'rgba(255,255,255,0.75)', lineHeight:1.8, marginBottom:20 }}>"{t.quote}"</p>
                  <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:13, color:'white' }}>{t.name}</p>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:3, letterSpacing:'0.08em', textTransform:'uppercase' }}>{t.role}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ display:'flex', gap:6, marginTop:18 }}>
            {TESTIMONIALS.map((_,i)=>(
              <button key={i} onClick={()=>setActiveTest(i)}
                style={{ height:2, border:'none', cursor:'pointer', transition:'all 0.3s', background:i===activeTest?GOLD:'rgba(255,255,255,0.18)', width:i===activeTest?28:10 }}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVIDER CTA ── */}
      <section id="providers" style={{ padding:'80px 0' }}>
        <div className="l-px">
          <FadeUp>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:40, alignItems:'center', padding:'48px', background:'rgba(255,255,255,0.03)', borderLeft:`2px solid ${GOLD}`, border:`1px solid rgba(255,255,255,0.09)`, borderLeft:`2px solid ${GOLD}` }}>
              <div>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:GOLD, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>For Media Organisations</p>
                <h2 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(22px,3vw,36px)', color:'white', letterSpacing:'-0.8px', marginBottom:10 }}>
                  List your inventory<br/>on BrandCasta
                </h2>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.75, maxWidth:420 }}>
                  Receive booking requests from top Nigerian brands. Approve in one click. Get paid directly without chasing clients.
                </p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:180 }}>
                <Link to="/register/provider"
                  style={{ padding:'13px 22px', background:GOLD, color:'#0a0a0a', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', textAlign:'center', display:'block', transition:'background 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#4f51d4'}
                  onMouseLeave={e=>e.currentTarget.style.background=GOLD}>
                  Apply as Provider
                </Link>
                <button onClick={()=>openAuth('login')}
                  style={{ padding:'13px 22px', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.38)', fontFamily:'Inter,sans-serif', fontWeight:500, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.35)'; e.currentTarget.style.color='rgba(255,255,255,0.65)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.38)'; }}>
                  Sign in
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.08)', padding:'56px 0 28px', background:'rgba(0,0,0,0.3)' }}>
        <div className="l-px">
          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr', gap:40, marginBottom:48 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:14 }}>
                <span style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:16, color:'white' }}>Brand</span>
                <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color:'#4d50d6' }}>Casta</span>
              </div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.8, maxWidth:200, marginBottom:20 }}>Nigeria's leading media campaign operations platform.</p>
              <div style={{ display:'flex', gap:6 }}>
                {[['𝕏','https://x.com/brandcasta_ng'],['in','https://linkedin.com/company/brandcasta-nigeria'],['ig','https://instagram.com/brandcasta_ng']].map(([icon,href])=>(
                  <a key={icon} href={href} target="_blank" rel="noreferrer"
                    style={{ width:28, height:28, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.35)', fontSize:10, fontWeight:700, textDecoration:'none', transition:'all 0.15s' }}
                    className="l-social-btn">
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            {[
              { title:'Company', links:['About Us','Newsroom','Insights','Careers'] },
              { title:'Support',  links:['Contact','Documentation','FAQ','hello@brandcasta.co'] },
              { title:'Legal',    links:['Terms & Conditions','Privacy Policy'] },
            ].map(col=>(
              <div key={col.title}>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:16 }}>{col.title}</p>
                {col.links.map(l=><a key={l} href="#" className="l-footer-link">{l}</a>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.06em' }}>© 2026 BrandCasta. All rights reserved.</p>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.06em' }}>Nigeria's media campaign operations platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}