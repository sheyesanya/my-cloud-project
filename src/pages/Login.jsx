import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';
const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';

const FEATURES = [
  { title:'Television & Radio',  desc:'Prime-time spots on Channels TV, Cool FM, TVC, Wazobia FM and 60+ stations across Nigeria.' },
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
  { quote:'BrandCasta made it incredibly easy to run a multi-platform campaign across radio and OOH in three cities at once. What used to take weeks now takes hours.', name:'Chukwuemeka Obi', role:'Head of Marketing, Kuda Bank' },
  { quote:'As a media owner, receiving booking requests directly to my inbox with one-click approve or decline has completely changed how I manage ad sales.', name:'Adaeze Nwosu', role:'Sales Director, Cool FM Lagos' },
  { quote:'I booked podcast ads, billboard space and an influencer campaign all in one brief. The transparency on pricing and delivery proof is unmatched.', name:'Tunde Adegoke', role:'Brand Manager, PalmPay' },
];

const STATS = [
  { value:'184+', label:'PROVIDERS' },
  { value:'9',    label:'MEDIA TYPES' },
  { value:'36+',  label:'CITIES COVERED' },
];

function useIsMobile(bp=900) {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return mobile;
}

function FadeUp({ children, delay=0, style={} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting){ setVisible(true); obs.disconnect(); }}, { threshold:0.06, rootMargin:'-20px' });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(18px)', transition:`opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function StaggerWords({ text }) {
  return (
    <span>
      {text.split(' ').map((word, i) => (
        <motion.span key={i}
          initial={{ opacity:0, y:'110%' }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55, ease:[0.22,1,0.36,1], delay:0.08 + i*0.07 }}
          style={{ display:'inline-block', overflow:'hidden' }}>
          {word}{i < text.split(' ').length-1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  const isMobile = useIsMobile(900);
  const isSmall  = useIsMobile(480);

  const [mode, setMode]            = useState('login');
  const [email, setEmail]          = useState('');
  const [password, setPassword]    = useState('');
  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState('');
  const [agreedToTerms, setAgreed] = useState(false);
  const [activeTest, setActiveTest]= useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTest(a => (a+1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handle = async (fn) => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const result = await fn();
      if (result !== null && result !== undefined) navigate('/dashboard');
    } catch(e) {
      const msg = (e.message||'').replace('Firebase: ','').replace(/\(auth.*?\)/g,'').trim();
      if (msg) setError(msg);
    } finally { setLoading(false); }
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  const openAuth = (m='login') => { setMode(m); setTimeout(()=>scrollTo('auth-anchor'),100); };
  const isProvider = mode === 'provider';

  const P = '#6366f1';
  const PB = 'rgba(99,102,241,0.28)';
  const PX = 'rgba(99,102,241,0.1)';
  const px = isMobile ? '20px' : '48px';

  return (
    <div style={{ minHeight:'100vh', background:'#0e0e13', color:'rgba(255,255,255,0.92)', fontFamily:'Inter,sans-serif', overflowX:'hidden' }}>
      <PageTitle title="BrandCasta — Media Campaigns, Without Borders" description="Book TV, radio, billboard, podcast and influencer campaigns across 184+ verified Nigerian media providers."/>

      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        body::before{display:none!important}
        .l-grid-bg{position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);
          background-size:80px 80px;
          mask-image:radial-gradient(ellipse 100% 80% at 50% 0%,black 40%,transparent 100%)}
        .l-inp{width:100%;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,0.12);padding:10px 0;font-size:13px;color:white;font-family:Inter,sans-serif;outline:none;transition:border-color 0.2s}
        .l-inp::placeholder{color:rgba(255,255,255,0.28)}
        .l-inp:focus{border-bottom-color:#6366f1}
        .l-tab{flex:1;padding:8px 4px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;font-family:Inter,sans-serif;border:none;transition:all 0.15s}
        .l-feat-card{padding:24px;background:#0e0e13;border:1px solid transparent;height:100%;transition:border-color 0.25s,background 0.25s;cursor:default}
        .l-feat-card:hover{border-color:rgba(99,102,241,0.3)!important;background:rgba(99,102,241,0.04)!important}
        .l-fl{color:rgba(255,255,255,0.35);text-decoration:none;font-size:12px;transition:color 0.2s;display:block;margin-bottom:9px}
        .l-fl:hover{color:#6366f1}
        .l-sb:hover{border-color:rgba(99,102,241,0.28)!important;color:#6366f1!important}
      `}</style>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(14,14,19,0.97)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding:`0 ${px}`, maxWidth:1200, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', flexShrink:0 }}>
            <img src={LOGO} alt="BrandCasta" style={{ width:26, height:26, objectFit:'contain' }}/>
            <div style={{ display:'flex' }}>
              <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color:'white' }}>Brand</span>
              <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color:'#4d50d6' }}>Casta</span>
            </div>
          </div>
          {!isMobile && (
            <div style={{ display:'flex', gap:24 }}>
              {['features','how-it-works','providers'].map((id,i)=>(
                <button key={id} onClick={()=>scrollTo(id)}
                  style={{ background:'none', border:'none', fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', cursor:'pointer' }}>
                  {['Features','How it works','Providers'][i]}
                </button>
              ))}
            </div>
          )}
          <button onClick={()=>openAuth('login')}
            style={{ padding:'8px 16px', background:`linear-gradient(135deg,${P},#a855f7)`, color:'white', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', border:'none', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:'relative', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div className="l-grid-bg"/>
        <div style={{ padding:`${isMobile?'40px':'80px'} ${px} 0`, maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1, width:'100%' }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, delay:0.1 }}
            style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ width:32, height:1, background:P, flexShrink:0 }}/>
            <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, fontWeight:500, color:P, letterSpacing:'0.2em', textTransform:'uppercase' }}>
              Media Campaigns, Without Borders
            </span>
          </motion.div>

          {/* Hero grid — stacks on mobile */}
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 32 : 64, alignItems:'flex-start' }}>

            {/* Left */}
            <div>
              <h1 style={{ fontFamily:'Georgia,"Times New Roman",serif', fontWeight:700, fontSize: isSmall ? '42px' : isMobile ? '52px' : 'clamp(48px,5.5vw,80px)', lineHeight:1.04, letterSpacing:'-2px', marginBottom:20, color:'white' }}>
                <div style={{ overflow:'visible', paddingBottom:'0.08em' }}><StaggerWords text="Book media"/></div>
                <div style={{ overflow:'visible', paddingBottom:'0.1em' }}><StaggerWords text="campaigns."/></div>
                <div style={{ overflow:'visible', paddingBottom:'0.15em' }}>
                  <motion.span initial={{ opacity:0, y:'110%' }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, ease:[0.22,1,0.36,1], delay:0.4 }}
                    style={{ display:'inline-block', fontStyle:'italic', background:`linear-gradient(135deg,${P},#a855f7)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1.1 }}>
                    One Platform.
                  </motion.span>
                </div>
              </h1>

              <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45, duration:0.5 }} style={{ marginBottom:18 }}>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:12, color:'rgba(255,255,255,0.3)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Let's Run It.</p>
              </motion.div>

              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55, duration:0.5 }} style={{ marginBottom:32 }}>
                <p style={{ fontSize: isMobile ? 15 : 17, color:'rgba(255,255,255,0.62)', lineHeight:1.78, marginBottom:14 }}>
                  One platform to discover, book, generate and manage campaigns across Podcasts, Live Streaming Apps, TV, Radio, Billboards, Print and Social-Media Influencers.
                </p>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize: isMobile ? 11 : 13, color:'rgba(255,255,255,0.45)', letterSpacing:'0.04em', lineHeight:1.8 }}>
                  5Sec Subsidized Ad-Spots · No Delayed Payment · MPO &amp; Invoice · Ad Tracker · Proof of Performance
                </p>
              </motion.div>

              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65, duration:0.5 }}
                style={{ display:'flex', alignItems:'center', gap: isMobile ? 16 : 24, flexWrap:'wrap' }}>
                <button onClick={()=>openAuth('signup')}
                  style={{ padding:'14px 28px', background:`linear-gradient(135deg,${P},#a855f7)`, color:'white', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>
                  Start a Campaign
                </button>
                <button onClick={()=>scrollTo('features')}
                  style={{ fontFamily:'Inter,sans-serif', fontWeight:600, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.38)', background:'none', border:'none', cursor:'pointer' }}>
                  Browse Providers →
                </button>
              </motion.div>

              {/* Auth card inline on mobile */}
              {isMobile && (
                <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7, duration:0.5 }} id="auth-anchor" style={{ marginTop:36 }}>
                  <AuthCard mode={mode} setMode={setMode} error={error} setError={setError} loading={loading} agreedToTerms={agreedToTerms} setAgreed={setAgreed} handle={handle} login={login} signup={signup} loginWithGoogle={loginWithGoogle} P={P} PB={PB} isProvider={isProvider} Spinner={Spinner} Link={Link} />
                </motion.div>
              )}
            </div>

            {/* Right — auth card desktop only */}
            {!isMobile && (
              <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3, duration:0.6, ease:[0.22,1,0.36,1] }} id="auth-anchor">
                <AuthCard mode={mode} setMode={setMode} error={error} setError={setError} loading={loading} agreedToTerms={agreedToTerms} setAgreed={setAgreed} handle={handle} login={login} signup={signup} loginWithGoogle={loginWithGoogle} P={P} PB={PB} isProvider={isProvider} Spinner={Spinner} Link={Link} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,0.1)', marginTop:48, width:'100%' }}>
          <div style={{ padding:`0 ${px}`, maxWidth:1200, margin:'0 auto', display:'flex' }}>
            {STATS.map((s,i) => {
              const num = parseInt(s.value);
              const suf = s.value.replace(String(num),'');
              return (
                <div key={s.label} style={{ flex:1, minWidth:0, padding:`${isMobile?'18px':'26px'} 0`, borderRight:i<STATS.length-1?'1px solid rgba(255,255,255,0.1)':'none', paddingLeft:i>0?'clamp(10px,4vw,40px)':'0', paddingRight:i<STATS.length-1?'clamp(10px,4vw,40px)':'0', overflow:'hidden' }}>
                  <FadeUp delay={i*0.1}>
                    <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(22px,5vw,42px)', letterSpacing:'-1px', color:'white', lineHeight:1, marginBottom:6 }}>
                      {num}<span style={{ fontSize:'clamp(14px,3vw,24px)', color:P }}>{suf}</span>
                    </p>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:'clamp(8px,2vw,10px)', color:'rgba(255,255,255,0.38)', letterSpacing:'0.12em', textTransform:'uppercase' }}>{s.label}</p>
                  </FadeUp>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:`${isMobile?'52px':'80px'} 0` }}>
        <div style={{ padding:`0 ${px}`, maxWidth:1200, margin:'0 auto' }}>
          <FadeUp style={{ marginBottom:36 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:P, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:10 }}>Media Channels</p>
            <h2 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(26px,4vw,44px)', color:'white', letterSpacing:'-1px', lineHeight:1.1 }}>Every channel.<br/>One brief.</h2>
          </FadeUp>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:1, background:'rgba(255,255,255,0.08)' }}>
            {FEATURES.map((f,i)=>(
              <FadeUp key={f.title} delay={i*0.06}>
                <div className="l-feat-card">
                  <div style={{ width:28, height:1, background:P, marginBottom:16 }}/>
                  <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:15, color:'white', marginBottom:9, letterSpacing:'-0.2px' }}>{f.title}</p>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.75 }}>{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:`${isMobile?'52px':'80px'} 0` }}>
        <div style={{ padding:`0 ${px}`, maxWidth:1200, margin:'0 auto' }}>
          <FadeUp style={{ marginBottom:36 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:P, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:10 }}>Process</p>
            <h2 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(26px,4vw,44px)', color:'white', letterSpacing:'-1px' }}>How it works</h2>
          </FadeUp>
          <div style={{ display:'grid', gridTemplateColumns: isSmall ? '1fr' : isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:1, background:'rgba(255,255,255,0.07)' }}>
            {STEPS.map((s,i)=>(
              <FadeUp key={s.n} delay={i*0.08}>
                <div style={{ padding:'24px 20px', background:'#0e0e13', height:'100%', position:'relative', overflow:'hidden', borderRight: (!isSmall && !isMobile && i<3) ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                  <div style={{ position:'absolute', top:12, right:16, fontFamily:'Georgia,serif', fontWeight:700, fontSize:52, color:'rgba(255,255,255,0.04)', letterSpacing:'-2px', lineHeight:1, userSelect:'none' }}>{s.n}</div>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:P, letterSpacing:'0.12em', marginBottom:14 }}>{s.n}</p>
                  <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:15, color:'white', marginBottom:7, letterSpacing:'-0.2px' }}>{s.title}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.75 }}>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:`${isMobile?'52px':'80px'} 0` }}>
        <div style={{ padding:`0 ${px}`, maxWidth:680, margin:'0 auto' }}>
          <FadeUp style={{ marginBottom:28 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:P, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:10 }}>Testimonials</p>
            <h2 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(22px,3vw,34px)', color:'white', letterSpacing:'-0.8px' }}>What our clients say</h2>
          </FadeUp>
          <div style={{ minHeight:140 }}>
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t,i) => i===activeTest && (
                <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.35 }}
                  style={{ padding:'24px 28px', background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.09)`, borderLeft:`2px solid ${P}` }}>
                  <div style={{ width:24, height:1, background:P, marginBottom:16 }}/>
                  <p style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize: isMobile ? 14 : 16, color:'rgba(255,255,255,0.75)', lineHeight:1.8, marginBottom:16 }}>"{t.quote}"</p>
                  <p style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:13, color:'white' }}>{t.name}</p>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:3, letterSpacing:'0.08em', textTransform:'uppercase' }}>{t.role}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ display:'flex', gap:6, marginTop:14 }}>
            {TESTIMONIALS.map((_,i)=>(
              <button key={i} onClick={()=>setActiveTest(i)}
                style={{ height:2, border:'none', cursor:'pointer', transition:'all 0.3s', background:i===activeTest?P:'rgba(255,255,255,0.18)', width:i===activeTest?28:10 }}/>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section id="providers" style={{ padding:`${isMobile?'52px':'80px'} 0` }}>
        <div style={{ padding:`0 ${px}`, maxWidth:1200, margin:'0 auto' }}>
          <FadeUp>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: isMobile ? 24 : 40, alignItems:'center', padding: isMobile ? '28px 24px' : '48px', background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.09)`, borderLeft:`2px solid ${P}` }}>
              <div>
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:P, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:10 }}>For Media Organisations</p>
                <h2 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'clamp(20px,3vw,34px)', color:'white', letterSpacing:'-0.8px', marginBottom:10 }}>
                  List your inventory<br/>on BrandCasta
                </h2>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.75 }}>
                  Receive booking requests from top Nigerian brands. Approve in one click. Get paid directly without chasing clients.
                </p>
              </div>
              <div style={{ display:'flex', flexDirection: isMobile ? 'row' : 'column', gap:8, flexWrap:'wrap' }}>
                <Link to="/register/provider"
                  style={{ padding:'12px 20px', background:`linear-gradient(135deg,${P},#a855f7)`, color:'white', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', textAlign:'center', display:'block' }}>
                  Apply as Provider
                </Link>
                <button onClick={()=>openAuth('login')}
                  style={{ padding:'12px 20px', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.45)', fontFamily:'Inter,sans-serif', fontWeight:500, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>
                  Sign in
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.08)', padding:`${isMobile?'40px':'56px'} 0 28px`, background:'rgba(0,0,0,0.3)' }}>
        <div style={{ padding:`0 ${px}`, maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isSmall ? '1fr' : isMobile ? '1fr 1fr' : '1.5fr 1fr 1fr 1fr', gap: isMobile ? 24 : 40, marginBottom:40 }}>
            <div>
              <div style={{ display:'flex', marginBottom:12 }}>
                <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:15, color:'white' }}>Brand</span>
                <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:15, color:'#4d50d6' }}>Casta</span>
              </div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.28)', lineHeight:1.8, maxWidth:200, marginBottom:16 }}>Nigeria's leading media campaign operations platform.</p>
              <div style={{ display:'flex', gap:6 }}>
                {[['𝕏','https://x.com/brandcasta_ng'],['in','https://linkedin.com/company/brandcasta-nigeria'],['ig','https://instagram.com/brandcasta_ng']].map(([icon,href])=>(
                  <a key={icon} href={href} target="_blank" rel="noreferrer" className="l-sb"
                    style={{ width:28, height:28, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.35)', fontSize:10, fontWeight:700, textDecoration:'none', transition:'all 0.15s' }}>
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
                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:14 }}>{col.title}</p>
                {col.links.map(l=><a key={l} href="#" className="l-fl">{l}</a>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:18, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.2)' }}>© 2026 BrandCasta. All rights reserved.</p>
            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.2)' }}>Media Campaigns, Without Borders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Auth card extracted as a component to avoid duplication
function AuthCard({ mode, setMode, error, setError, loading, agreedToTerms, setAgreed, handle, login, signup, loginWithGoogle, P, PB, isProvider, Spinner, Link }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ background:'#0d0d1a', border:`1px solid ${PB}`, padding:22 }}>
      <div style={{ textAlign:'center', marginBottom:14 }}>
        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'white', marginBottom:3 }}>
          {isProvider ? 'Provider Sign In' : mode==='login' ? 'Welcome back' : 'Get started free'}
        </p>
        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.28)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
          {isProvider ? 'Provider dashboard' : mode==='login' ? 'Sign in to your account' : 'Create your account'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', marginBottom:14, border:'1px solid rgba(255,255,255,0.08)' }}>
        {[['login','Sign In'],['signup','Sign Up'],['provider','Provider']].map(([m,label])=>(
          <button key={m} className="l-tab" onClick={()=>setMode(m)}
            style={{ background:mode===m?`linear-gradient(135deg,${P},#a855f7)`:'transparent', color:mode===m?'white':'rgba(255,255,255,0.38)' }}>
            {label}
          </button>
        ))}
      </div>

      {error && <div style={{ padding:'8px 10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#fca5a5', marginBottom:10 }}>{error}</div>}

      {mode==='signup' && (
        <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:12, cursor:'pointer' }} onClick={()=>setAgreed(a=>!a)}>
          <div style={{ width:14, height:14, flexShrink:0, marginTop:1, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', border:agreedToTerms?'none':'1px solid rgba(255,255,255,0.25)', background:agreedToTerms?P:'rgba(255,255,255,0.04)' }}>
            {agreedToTerms&&<svg width="9" height="9" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
          </div>
          <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.38)', lineHeight:1.6 }}>
            I agree to BrandCasta's{' '}
            <Link to="/terms" target="_blank" onClick={e=>e.stopPropagation()} style={{ color:P, textDecoration:'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" target="_blank" onClick={e=>e.stopPropagation()} style={{ color:P, textDecoration:'underline' }}>Privacy Policy</Link>
          </p>
        </div>
      )}

      {/* Google */}
      <button onClick={()=>{ if(mode==='signup'&&!agreedToTerms){setError('Please agree to the Terms & Conditions.');return;} handle(loginWithGoogle); }} disabled={loading}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)', fontFamily:'Inter,sans-serif', fontWeight:500, fontSize:12, cursor:'pointer', marginBottom:12 }}>
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
        onKeyDown={e=>{ if(e.key==='Enter'){ if(mode==='signup'&&!agreedToTerms){setError('Please agree.');return;} handle(()=>mode==='login'||isProvider?login(email,password):signup(email,password)); }}}/>

      <button onClick={()=>{ if(mode==='signup'&&!agreedToTerms){setError('Please agree to the Terms & Conditions.');return;} handle(()=>mode==='login'||isProvider?login(email,password):signup(email,password)); }}
        disabled={loading}
        style={{ width:'100%', padding:'12px', background:isProvider?'linear-gradient(135deg,#14b8a6,#06b6d4)':`linear-gradient(135deg,${P},#a855f7)`, color:'white', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        {loading?<><Spinner size={12}/>{mode==='login'||isProvider?'Signing in…':'Creating account…'}</>:isProvider?'Provider Sign In →':mode==='login'?'Sign In →':'Create Account →'}
      </button>

      <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.06em', marginBottom:7 }}>
          {isProvider ? 'Not yet a provider?' : 'Media organisation?'}
        </p>
        <Link to="/register/provider" style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#5eead4', textDecoration:'none', letterSpacing:'0.08em', textTransform:'uppercase', border:'1px solid rgba(20,184,166,0.25)', padding:'5px 12px', display:'inline-block' }}>
          Apply as Provider →
        </Link>
      </div>
    </div>
  );
}