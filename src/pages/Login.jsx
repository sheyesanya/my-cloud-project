import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const FEATURES = [
  { title:'Television & Radio',  desc:'Prime-time spots on Channels TV, Cool FM, TVC, Wazobia FM and 60+ stations across Nigeria.' },
  { title:'Podcasts',             desc:'Partner with ISWIS, The Honest Bunch, WithChude and Nigeria\'s fastest-growing podcast creators.' },
  { title:'Out-of-Home',          desc:'Billboards, LED screens, BRT wraps, airport and mall inventory from Lagos to Abuja.' },
  { title:'Print & Digital',      desc:'Punch, Guardian, BusinessDay and leading online publishers — display, inserts and sponsored content.' },
  { title:'Influencers',          desc:'Macro, mid-tier and micro creators across Instagram, TikTok, YouTube and X.' },
  { title:'One Dashboard',        desc:'Brief, book, approve, pay and track campaign delivery — all in one place.' },
];

const STATS = [
  { value:184, suffix:'+', label:'Media Providers'  },
  { value:6,   suffix:'',  label:'Media Categories' },
  { value:36,  suffix:'+', label:'Cities Covered'   },
];

const STEPS = [
  { n:'01', title:'Create a brief',   desc:'Tell us your brand, goals and target audience. Upload decks and creative assets.' },
  { n:'02', title:'Pick your media',  desc:'Browse 184+ verified providers. Filter by category, city or format.' },
  { n:'03', title:'Book & pay',       desc:'Provider confirms within 24 hours. Pay securely via Paystack.' },
  { n:'04', title:'Track delivery',   desc:'Provider uploads proof. You review and approve. Campaign closed.' },
];

const TESTIMONIALS = [
  { quote:'BrandCasta made it incredibly easy to run a multi-platform campaign across radio and OOH in three cities at once. What used to take weeks now takes hours.', name:'Chukwuemeka Obi', role:'Head of Marketing, Kuda Bank' },
  { quote:'As a media owner, receiving booking requests directly to my inbox with one-click approve or decline has completely changed how I manage ad sales.', name:'Adaeze Nwosu', role:'Sales Director, Cool FM Lagos' },
  { quote:'I booked podcast ads, billboard space and an influencer campaign all in one brief. The transparency on pricing and delivery proof is unmatched.', name:'Tunde Adegoke', role:'Brand Manager, PalmPay' },
];

function CountUp({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          setCount(start);
          if (start >= target) clearInterval(timer);
        }, 35);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode]                 = useState('login');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [activeTestimonial, setActive]  = useState(0);
  const [menuOpen, setMenuOpen]         = useState(false);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handle = async (fn) => {
    setLoading(true); setError('');
    try { await fn(); navigate('/dashboard'); }
    catch(e) { setError(e.message.replace('Firebase: ','').replace(/\(auth.*?\)/g,'').trim()); }
    finally { setLoading(false); }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
    setMenuOpen(false);
  };

  const inp = {
    width:'100%', padding:'12px 14px', borderRadius:10, fontSize:14, outline:'none',
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    color:'white', fontFamily:'Manrope,sans-serif', boxSizing:'border-box',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080810', color:'white', fontFamily:'Manrope,sans-serif', overflowX:'hidden', width:'100%' }}>

      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        .grad{background:linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#06b6d4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .grad-teal{background:linear-gradient(135deg,#14b8a6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .feat-card{transition:border-color 0.2s,transform 0.2s}
        .feat-card:hover{border-color:rgba(99,102,241,0.35)!important}
        .step-num{background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .fl:hover{color:white!important}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fadeIn 0.4s ease forwards}

        /* nav */
        .nav-desktop{display:flex}
        .nav-mobile{display:none}
        @media(max-width:768px){
          .nav-desktop{display:none}
          .nav-mobile{display:flex}
        }

        /* hero */
        .hero-wrap{display:grid;grid-template-columns:1fr 400px;gap:64px;align-items:center}
        @media(max-width:900px){
          .hero-wrap{grid-template-columns:1fr;gap:36px}
        }

        /* features */
        .feat-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        @media(max-width:900px){.feat-wrap{grid-template-columns:1fr 1fr}}
        @media(max-width:560px){.feat-wrap{grid-template-columns:1fr}}

        /* steps */
        .steps-wrap{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        @media(max-width:900px){.steps-wrap{grid-template-columns:1fr 1fr;gap:20px}}
        @media(max-width:560px){.steps-wrap{grid-template-columns:1fr;gap:16px}}

        /* provider cta */
        .prov-wrap{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:center}
        @media(max-width:768px){.prov-wrap{grid-template-columns:1fr;gap:24px}}

        /* footer */
        .foot-wrap{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:40px}
        @media(max-width:900px){.foot-wrap{grid-template-columns:1fr 1fr;gap:28px}}
        @media(max-width:560px){.foot-wrap{grid-template-columns:1fr;gap:24px}}

        /* stats */
        .stats-wrap{display:flex;gap:32px;flex-wrap:wrap}

        /* padding helpers */
        .px{padding-left:40px;padding-right:40px}
        @media(max-width:560px){.px{padding-left:20px;padding-right:20px}}

        /* h1 size */
        .hero-h1{font-size:52px;letter-spacing:-1.8px}
        @media(max-width:560px){.hero-h1{font-size:36px;letter-spacing:-1px}}

        /* section h2 */
        .sec-h2{font-size:36px;letter-spacing:-0.7px}
        @media(max-width:560px){.sec-h2{font-size:26px}}

        /* bottom bar */
        .foot-bot{display:flex;align-items:center;justify-content:space-between}
        @media(max-width:560px){.foot-bot{flex-direction:column;align-items:flex-start;gap:4px}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:200, background:'rgba(8,8,16,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="px" style={{ height:60, display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:1160, margin:'0 auto' }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:30, height:30, objectFit:'contain' }}/>
            <span style={{ fontWeight:800, fontSize:17, letterSpacing:'-0.3px' }}>BrandCasta</span>
          </div>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ alignItems:'center', gap:28 }}>
            {[['Features','features'],['How it works','how-it-works'],['For Providers','providers']].map(([l,id]) => (
              <button key={l} onClick={() => scrollTo(id)}
                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>{l}</button>
            ))}
          </div>

          {/* Desktop right buttons */}
          <div className="nav-desktop" style={{ alignItems:'center', gap:8 }}>
            <Link to="/register/provider" style={{ fontSize:13, color:'rgba(255,255,255,0.55)', textDecoration:'none', fontWeight:600, padding:'7px 14px', borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)' }}>
              List your media
            </Link>
            <button onClick={() => scrollTo('auth-panel')} style={{ fontSize:13, fontWeight:700, padding:'7px 18px', borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
              Sign In
            </button>
          </div>

          {/* Mobile right */}
          <div className="nav-mobile" style={{ alignItems:'center', gap:8 }}>
            <button onClick={() => scrollTo('auth-panel')} style={{ fontSize:13, fontWeight:700, padding:'7px 16px', borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
              Sign In
            </button>
            <button onClick={() => setMenuOpen(o => !o)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, display:'flex', flexDirection:'column', gap:5, alignItems:'center', justifyContent:'center' }}>
              <span style={{ display:'block', width:22, height:2, background:'rgba(255,255,255,0.7)', borderRadius:2, transition:'0.2s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }}/>
              <span style={{ display:'block', width:22, height:2, background:'rgba(255,255,255,0.7)', borderRadius:2, opacity: menuOpen ? 0 : 1, transition:'0.2s' }}/>
              <span style={{ display:'block', width:22, height:2, background:'rgba(255,255,255,0.7)', borderRadius:2, transition:'0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }}/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background:'rgba(8,8,16,0.98)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'8px 0 16px' }}>
            {[['Features','features'],['How it works','how-it-works'],['For Providers','providers']].map(([l,id]) => (
              <button key={l} onClick={() => scrollTo(id)}
                style={{ display:'block', width:'100%', textAlign:'left', padding:'13px 20px', background:'none', border:'none', borderBottom:'1px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.75)', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
                {l}
              </button>
            ))}
            <Link to="/register/provider" onClick={() => setMenuOpen(false)}
              style={{ display:'block', padding:'13px 20px', color:'#5eead4', fontSize:15, fontWeight:700, textDecoration:'none' }}>
              List your media →
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="px" style={{ maxWidth:1160, margin:'0 auto', padding:'64px 40px 56px' }}>
        <div className="hero-wrap">

          {/* Left copy */}
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 13px', borderRadius:20, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.22)', marginBottom:22 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#86efac', flexShrink:0 }}/>
              <span style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.05em' }}>Nigeria's Media Campaign Platform</span>
            </div>

            <h1 className="hero-h1" style={{ fontWeight:800, lineHeight:1.08, marginBottom:18 }}>
              Book media campaigns<br/>
              <span className="grad">across Nigeria</span>
            </h1>

            <p style={{ fontSize:16, color:'rgba(255,255,255,0.5)', lineHeight:1.75, marginBottom:28 }}>
              One platform to discover, book and manage campaigns across TV, radio, podcasts, billboards, print and influencers.
            </p>

            {/* Stats */}
            <div className="stats-wrap" style={{ marginBottom:28, padding:'18px 22px', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="grad" style={{ fontWeight:800, fontSize:26, lineHeight:1, marginBottom:4 }}><CountUp target={s.value} suffix={s.suffix}/></p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={() => { setMode('signup'); scrollTo('auth-panel'); }}
                style={{ padding:'12px 26px', borderRadius:12, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontWeight:700, fontSize:15, border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
                Start for free →
              </button>
              <Link to="/register/provider"
                style={{ padding:'12px 20px', borderRadius:12, background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.65)', fontWeight:600, fontSize:14, border:'1px solid rgba(255,255,255,0.1)', textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
                List your inventory
              </Link>
            </div>
          </div>

          {/* Auth panel */}
          <div id="auth-panel" style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:26, position:'relative', overflow:'hidden', width:'100%' }}>
            <div style={{ position:'absolute', top:-70, right:-70, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)', pointerEvents:'none' }}/>

            <div style={{ textAlign:'center', marginBottom:20 }}>
              <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:38, height:38, objectFit:'contain', marginBottom:10 }}/>
              <p style={{ fontWeight:800, fontSize:18, letterSpacing:'-0.3px', marginBottom:3 }}>{mode==='login' ? 'Welcome back' : 'Get started free'}</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{mode==='login' ? 'Sign in to your dashboard' : 'Create your BrandCasta account'}</p>
            </div>

            {/* Mode tabs */}
            <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.04)', borderRadius:10, padding:3, marginBottom:16, border:'1px solid rgba(255,255,255,0.07)' }}>
              {['login','signup'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'9px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.15s', border:'none',
                  background: mode===m ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent',
                  color:       mode===m ? 'white' : 'rgba(255,255,255,0.4)',
                }}>{m==='login' ? 'Sign In' : 'Sign Up'}</button>
              ))}
            </div>

            {error && <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#fca5a5', fontSize:12, marginBottom:12 }}>{error}</div>}

            <button onClick={() => handle(loginWithGoogle)} disabled={loading}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:9, padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontWeight:600, fontSize:14, cursor:'pointer', marginBottom:14, fontFamily:'Manrope,sans-serif' }}>
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
              Continue with Google
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:700, letterSpacing:'0.1em' }}>OR</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handle(()=>mode==='login'?login(email,password):signup(email,password))} style={inp}/>
              <button onClick={()=>handle(()=>mode==='login'?login(email,password):signup(email,password))} disabled={loading}
                style={{ width:'100%', padding:'13px', borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading?<><Spinner size={13}/>{mode==='login'?'Signing in…':'Creating account…'}</>:mode==='login'?'Sign In →':'Create Free Account →'}
              </button>
            </div>

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:16, paddingTop:14, textAlign:'center' }}>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginBottom:10 }}>Media organisation? Join as a provider</p>
              <Link to="/register/provider"
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, background:'rgba(20,184,166,0.07)', border:'1px solid rgba(20,184,166,0.2)', color:'#5eead4', fontWeight:700, fontSize:12, textDecoration:'none' }}>
                Apply as a Service Provider →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'64px 40px' }} className="px">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>Everything in one place</p>
            <h2 className="sec-h2 grad" style={{ fontWeight:800, marginBottom:10 }}>Nigeria's full media landscape</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', maxWidth:420, margin:'0 auto', lineHeight:1.7 }}>
              From a 30-second radio spot to a full-page newspaper spread — book it all through BrandCasta.
            </p>
          </div>
          <div className="feat-wrap">
            {FEATURES.map(f => (
              <div key={f.title} className="feat-card" style={{ padding:'20px', borderRadius:14, background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:26, marginBottom:10 }}>{f.icon}</div>
                <p style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{f.title}</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:'64px 40px' }} className="px">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>Simple by design</p>
            <h2 className="sec-h2" style={{ fontWeight:800 }}>How <span className="grad">BrandCasta</span> works</h2>
          </div>
          <div className="steps-wrap">
            {STEPS.map(s => (
              <div key={s.n} style={{ padding:'20px', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.22)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                  <span className="step-num" style={{ fontWeight:800, fontSize:13 }}>{s.n}</span>
                </div>
                <p style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{s.title}</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'64px 40px' }} className="px">
        <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>What users say</p>
          <h2 className="sec-h2" style={{ fontWeight:800, marginBottom:36 }}>Real stories, <span className="grad">real results</span></h2>
          <div style={{ minHeight:180 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="fi" style={{ display:i===activeTestimonial?'block':'none', padding:'24px', borderRadius:16, background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.08)', textAlign:'left' }}>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.8, marginBottom:18, fontStyle:'italic' }}>"{t.quote}"</p>
                <p style={{ fontWeight:700, fontSize:13 }}>{t.name}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{t.role}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:18 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ width:i===activeTestimonial?22:8, height:8, borderRadius:20, background:i===activeTestimonial?'linear-gradient(135deg,#6366f1,#a855f7)':'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', transition:'all 0.3s' }}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVIDER CTA ── */}
      <section id="providers" style={{ padding:'64px 40px' }} className="px">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div className="prov-wrap" style={{ borderRadius:20, background:'linear-gradient(135deg,rgba(20,184,166,0.08),rgba(6,182,212,0.05))', border:'1px solid rgba(20,184,166,0.15)', padding:'44px 40px' }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'#5eead4', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:10 }}>Media organisations</p>
              <h2 className="sec-h2" style={{ fontWeight:800, marginBottom:10 }}>
                List your inventory on <span className="grad-teal">BrandCasta</span>
              </h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.75 }}>
                Receive booking requests from top Nigerian brands. Approve in one click. Get paid directly — no chasing clients.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, minWidth:200 }}>
              <Link to="/register/provider" style={{ padding:'13px 24px', borderRadius:12, background:'rgba(20,184,166,0.15)', border:'1px solid rgba(20,184,166,0.35)', color:'#5eead4', fontWeight:700, fontSize:14, textDecoration:'none', textAlign:'center', whiteSpace:'nowrap' }}>
                Apply as a Provider →
              </Link>
              <button onClick={() => scrollTo('auth-panel')} style={{ padding:'13px 24px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
                Already have an account?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'48px 40px 28px' }} className="px">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div className="foot-wrap" style={{ marginBottom:40 }}>

            <div>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:12 }}>
                <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:26, height:26, objectFit:'contain' }}/>
                <span style={{ fontWeight:800, fontSize:15 }}>BrandCasta</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.75, marginBottom:18, maxWidth:220 }}>
                Nigeria's leading media campaign operations platform.
              </p>
              <div style={{ display:'flex', gap:8 }}>
                {[['𝕏','https://x.com/brandcasta_ng'],['in','https://linkedin.com/company/brandcasta-nigeria'],['ig','https://instagram.com/brandcasta_ng']].map(([icon,href]) => (
                  <a key={icon} href={href} target="_blank" rel="noreferrer"
                    style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, textDecoration:'none' }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Company</p>
              {[['About Us','#'],['Newsroom','#'],['Insights','#'],['Careers','#']].map(([l,h]) => (
                <a key={l} href={h} className="fl" style={{ display:'block', fontSize:13, color:'rgba(255,255,255,0.45)', textDecoration:'none', marginBottom:9, fontWeight:500, transition:'color 0.15s' }}>{l}</a>
              ))}
            </div>

            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Support</p>
              {[['Contact','#'],['Docs','#'],['FAQ','#'],['hello@brandcasta.co','mailto:hello@brandcasta.co']].map(([l,h]) => (
                <a key={l} href={h} className="fl" style={{ display:'block', fontSize:13, color:'rgba(255,255,255,0.45)', textDecoration:'none', marginBottom:9, fontWeight:500, transition:'color 0.15s', wordBreak:'break-all' }}>{l}</a>
              ))}
            </div>

            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Legal</p>
              <Link to="/terms" className="fl" style={{ display:'block', fontSize:13, color:'rgba(255,255,255,0.45)', textDecoration:'none', marginBottom:9, fontWeight:500, transition:'color 0.15s' }}>Terms & Conditions</Link>
              <Link to="/privacy" className="fl" style={{ display:'block', fontSize:13, color:'rgba(255,255,255,0.45)', textDecoration:'none', marginBottom:9, fontWeight:500, transition:'color 0.15s' }}>Privacy Policy</Link>
            </div>
          </div>

          <div className="foot-bot" style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:18 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.22)' }}>© 2026 BrandCasta. All rights reserved.</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.22)' }}>Nigeria's media campaign operations platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}