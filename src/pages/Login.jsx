import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

const FEATURES = [
  { icon:'📺', title:'Television & Radio',  desc:'Prime-time spots on Channels TV, Cool FM, TVC, Wazobia FM and 60+ stations across Nigeria.' },
  { icon:'🎙', title:'Podcasts',             desc:'Partner with ISWIS, The Honest Bunch, WithChude and Nigeria\'s fastest-growing podcast creators.' },
  { icon:'🏙', title:'Out-of-Home',          desc:'Billboards, LED screens, BRT wraps, airport and mall inventory from Lagos to Abuja.' },
  { icon:'📰', title:'Print & Digital',      desc:'Punch, Guardian, BusinessDay and leading online publishers, display, inserts and sponsored content.' },
  { icon:'👤', title:'Influencers',          desc:'Macro, mid-tier and micro creators across Instagram, TikTok, YouTube and X.' },
  { icon:'📃', title:'One Dashboard',        desc:'Brief, book, approve, pay and track campaign delivery, all in one place.' },
];

const STATS = [
  { value:184, suffix:'+', label:'Media Providers'  },
  { value:6,   suffix:'',  label:'Media Categories' },
  { value:36,  suffix:'+', label:'Cities Covered'   },
];

const STEPS = [
  { n:'01', title:'Create a brief',   desc:'Tell us your brand, goals and target audience. Upload decks, assets and creative direction.' },
  { n:'02', title:'Pick your media',  desc:'Browse 184+ verified providers. Filter by category, city, reach or format.' },
  { n:'03', title:'Book & pay',       desc:'Provider confirms within 24 hours. Pay securely via Paystack once approved.' },
  { n:'04', title:'Track delivery',   desc:'Provider uploads proof of delivery. You review and approve. Campaign closed.' },
];

const TESTIMONIALS = [
  { quote:'BrandCasta made it incredibly easy to run a multi-platform campaign across radio and OOH in three cities at once. What used to take weeks of back-and-forth now takes hours.', name:'Chukwuemeka Obi', role:'Head of Brand and Marketing, Annex Bank' },
  { quote:'As a media owner, receiving booking requests directly to my inbox with one-click approve or decline has completely changed how I manage ad sales.', name:'Adaeze Nwosu', role:'Sales Director, Metaletry Lagos' },
  { quote:'I was able to book podcast ads, billboard space and an influencer campaign all in one brief. The transparency on pricing and delivery proof is unmatched.', name:'Tunde Adegoke', role:'Brand Manager, RealPay' },
  { quote:'BrandCasta helped us simplify our nationwide campaign rollout without the usual stress of chasing multiple vendors. From radio to digital billboards, everything was seamless.', name:'Ifeanyi Okonkwo', role:'Marketing Lead, Vetra Energy' },
  { quote:'What impressed me most was the speed. We launched our campaign in less than 48 hours and had real-time updates throughout the process.', name:'Mariam Bello', role:'Communications Manager, Nova Mobility' },
  { quote:'Managing outdoor advertising used to involve endless calls and paperwork. BrandCasta centralized everything for us in one dashboard.', name:'Seyi Alade', role:'Operations Director, UrbanNiche Media' },
  { quote:'The ability to compare pricing, locations and audience reach before booking gave our team a level of confidence we never had before.', name:'Kenechi Ubah', role:'Growth Marketing Manager, SwiftCart' },
  { quote:'BrandCasta feels like the future of media buying in Africa. Transparent, fast and surprisingly easy to use even for first-time advertisers.', name:'Amina Yusuf', role:'Founder, Glow Beauty Africa' },
  { quote:'Our agency was able to coordinate influencer campaigns, radio mentions and LED billboard placements for a client from one platform. That efficiency is game-changing.', name:'David Ekanem', role:'Creative Director, BlueHouse Agency' },
  { quote:'I loved how straightforward the approval system was. We received booking requests, reviewed creatives and confirmed placements without unnecessary delays.', name:'Temitope Martins', role:'Commercial Manager, CityPoint Media' },
  { quote:'The proof-of-delivery feature gave our clients peace of mind. They could actually verify campaign execution instead of relying on manual reports.', name:'Chioma Eze', role:'Account Director, Peaklite Communications' },
  { quote:'As a startup with limited marketing resources, BrandCasta gave us access to premium advertising opportunities we normally wouldn’t have been able to coordinate ourselves.', name:'Johnson Idahome', role:'Co-Founder, FastChop NG' },
  { quote:'We ran simultaneous campaigns across Lagos, Abuja and Port Harcourt with zero operational headaches. BrandCasta made campaign management feel effortless.', name:'Rukayat Lawal', role:'Brand Strategist, Horizon Telecoms' },
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

  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [activeTestimonial, setActive] = useState(0);

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

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  const inp = {
    width:'100%', padding:'11px 14px', borderRadius:10, fontSize:13, outline:'none',
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    color:'white', transition:'border-color 0.15s', fontFamily:'Manrope,sans-serif',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080810', color:'white', fontFamily:'Manrope,sans-serif', overflowX:'hidden' }}>

      <style>{`
        .grad { background: linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#06b6d4 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .grad-teal { background: linear-gradient(135deg,#14b8a6,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .feat-card:hover { border-color: rgba(99,102,241,0.35) !important; transform: translateY(-2px); }
        .feat-card { transition: border-color 0.2s, transform 0.2s; }
        .step-num { background: linear-gradient(135deg,#6366f1,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .nav-link:hover { color: white !important; }
        .footer-link:hover { color: white !important; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(8,8,16,0.88)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:34, height:34, objectFit:'contain' }}/>
          <span style={{ fontWeight:800, fontSize:18, letterSpacing:'-0.3px' }}>BrandCasta</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:28 }}>
          {[
            ['Features',      'features'],
            ['How it works',  'how-it-works'],
            ['For Providers', 'providers'],
          ].map(([label, id]) => (
            <button key={label} onClick={() => scrollTo(id)} className="nav-link"
              style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'color 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Link to="/register/provider" style={{ fontSize:13, color:'rgba(255,255,255,0.55)', textDecoration:'none', fontWeight:600, padding:'8px 16px', borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)' }}>
            List your media
          </Link>
          <button onClick={() => scrollTo('auth-panel')} style={{ fontSize:13, fontWeight:700, padding:'8px 20px', borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth:1160, margin:'0 auto', padding:'96px 40px 72px', display:'grid', gridTemplateColumns:'1fr 400px', gap:72, alignItems:'center' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:20, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.22)', marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#86efac' }}/>
            <span style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.06em' }}>Nigeria's Media Campaign Platform</span>
          </div>
          <h1 style={{ fontSize:56, fontWeight:800, lineHeight:1.06, letterSpacing:'-2px', marginBottom:22 }}>
            Book media campaigns<br/>
            <span className="grad">across Nigeria</span>
          </h1>
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.5)', lineHeight:1.75, marginBottom:36, maxWidth:500 }}>
            One platform to discover, book and manage campaigns across TV, radio, podcasts, billboards, print and influencers, from Lagos to Abuja.
          </p>
          <div style={{ display:'flex', gap:40, marginBottom:40, padding:'24px 28px', borderRadius:16, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <p style={{ fontWeight:800, fontSize:30, letterSpacing:'-1px', lineHeight:1 }} className="grad">
                  <CountUp target={s.value} suffix={s.suffix}/>
                </p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:600, marginTop:4 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => { setMode('signup'); scrollTo('auth-panel'); }}
              style={{ padding:'14px 30px', borderRadius:12, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontWeight:700, fontSize:15, border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
              Start for free →
            </button>
            <Link to="/register/provider"
              style={{ padding:'14px 24px', borderRadius:12, background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.65)', fontWeight:600, fontSize:14, border:'1px solid rgba(255,255,255,0.1)', textDecoration:'none', display:'flex', alignItems:'center' }}>
              List your inventory
            </Link>
          </div>
        </div>

        {/* AUTH PANEL */}
        <div id="auth-panel" style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.09)', borderRadius:22, padding:30, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-80, right:-80, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-60, left:-60, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.08),transparent 70%)', pointerEvents:'none' }}/>

          <div style={{ textAlign:'center', marginBottom:24 }}>
            <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:42, height:42, objectFit:'contain', marginBottom:12 }}/>
            <p style={{ fontWeight:800, fontSize:20, letterSpacing:'-0.4px', marginBottom:4 }}>
              {mode==='login' ? 'Welcome back' : 'Get started free'}
            </p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>
              {mode==='login' ? 'Sign in to your dashboard' : 'Create your BrandCasta account'}
            </p>
          </div>

          <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', borderRadius:10, padding:4, marginBottom:20, border:'1px solid rgba(255,255,255,0.07)' }}>
            {['login','signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'8px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.15s',
                background: mode===m ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'none',
                color:       mode===m ? 'white' : 'rgba(255,255,255,0.4)',
                border:      'none',
              }}>{m==='login' ? 'Sign In' : 'Sign Up'}</button>
            ))}
          </div>

          {error && (
            <div style={{ padding:'10px 13px', borderRadius:9, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#fca5a5', fontSize:12, marginBottom:14 }}>{error}</div>
          )}

          <button onClick={() => handle(loginWithGoogle)} disabled={loading}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:9, padding:'11px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontWeight:600, fontSize:13, cursor:'pointer', marginBottom:16, fontFamily:'Manrope,sans-serif' }}>
            <svg width="15" height="15" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Continue with Google
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:700, letterSpacing:'0.1em' }}>OR</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handle(()=>mode==='login'?login(email,password):signup(email,password))} style={inp}/>
            <button onClick={()=>handle(()=>mode==='login'?login(email,password):signup(email,password))} disabled={loading}
              style={{ padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading?<><Spinner size={13}/>{mode==='login'?'Signing in…':'Creating account…'}</>:mode==='login'?'Sign In →':'Create Free Account →'}
            </button>
          </div>

          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:20, paddingTop:18, textAlign:'center' }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginBottom:10 }}>Media organisation? Join as a provider</p>
            <Link to="/register/provider"
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, background:'rgba(20,184,166,0.07)', border:'1px solid rgba(20,184,166,0.2)', color:'#5eead4', fontWeight:700, fontSize:12, textDecoration:'none' }}>
              Apply as a Service Provider →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'80px 40px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>Everything in one place</p>
            <h2 style={{ fontSize:40, fontWeight:800, letterSpacing:'-1px', marginBottom:14 }}>
              Nigeria's full <span className="grad">media landscape</span>
            </h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.4)', maxWidth:480, margin:'0 auto', lineHeight:1.7 }}>
              From a 30-second radio spot in Port-Harcourt to a full-page spread in the Newspapers or Magazines, book it all through BrandCasta.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feat-card" style={{ padding:'24px', borderRadius:16, background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:30, marginBottom:14 }}>{f.icon}</div>
                <p style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{f.title}</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ maxWidth:1160, margin:'0 auto', padding:'80px 40px' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>Simple by design</p>
          <h2 style={{ fontSize:40, fontWeight:800, letterSpacing:'-1px' }}>
            How <span className="grad">BrandCasta</span> works
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:28 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ position:'relative' }}>
              {i < 3 && <div style={{ position:'absolute', top:20, left:'calc(100% - 14px)', width:'28px', height:1, background:'linear-gradient(90deg,rgba(99,102,241,0.4),transparent)', zIndex:1 }}/>}
              <div style={{ width:44, height:44, borderRadius:13, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.22)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                <span className="step-num" style={{ fontWeight:800, fontSize:14 }}>{s.n}</span>
              </div>
              <p style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{s.title}</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'80px 40px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <p style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>What users say</p>
          <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:'-0.8px', marginBottom:48 }}>Real stories, <span className="grad">real results</span></h2>
          <div style={{ position:'relative', minHeight:180 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="fade-in" style={{ display: i===activeTestimonial ? 'block' : 'none', padding:'32px', borderRadius:18, background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize:16, color:'rgba(255,255,255,0.75)', lineHeight:1.8, marginBottom:24, fontStyle:'italic' }}>"{t.quote}"</p>
                <div>
                  <p style={{ fontWeight:700, fontSize:14, color:'white' }}>{t.name}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:24 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ width: i===activeTestimonial?24:8, height:8, borderRadius:20, background: i===activeTestimonial?'linear-gradient(135deg,#6366f1,#a855f7)':'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', transition:'all 0.3s' }}/>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section id="providers" style={{ maxWidth:1160, margin:'0 auto', padding:'80px 40px' }}>
        <div style={{ borderRadius:24, background:'linear-gradient(135deg,rgba(20,184,166,0.08),rgba(6,182,212,0.05))', border:'1px solid rgba(20,184,166,0.15)', padding:'56px 64px', display:'grid', gridTemplateColumns:'1fr auto', gap:48, alignItems:'center' }}>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#5eead4', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:14 }}>Media organisations</p>
            <h2 style={{ fontSize:34, fontWeight:800, letterSpacing:'-0.8px', marginBottom:14 }}>
              List your inventory on <span className="grad-teal">BrandCasta</span>
            </h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:520 }}>
              Receive booking requests from top Nigerian brands. Approve in one click. Get paid directly; No chasing clients, no spreadsheets.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, flexShrink:0 }}>
            <Link to="/register/provider"
              style={{ padding:'14px 28px', borderRadius:12, background:'rgba(20,184,166,0.15)', border:'1px solid rgba(20,184,166,0.35)', color:'#5eead4', fontWeight:700, fontSize:14, textDecoration:'none', textAlign:'center', whiteSpace:'nowrap' }}>
              Apply as a Provider →
            </Link>
            <button onClick={() => scrollTo('auth-panel')}
              style={{ padding:'14px 28px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
              Already have an account?
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'56px 40px 32px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr', gap:48, marginBottom:56 }}>

            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:30, height:30, objectFit:'contain' }}/>
                <span style={{ fontWeight:800, fontSize:16 }}>BrandCasta</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.75, marginBottom:24, maxWidth:260 }}>
                Nigeria's leading media campaign operations platform. Book TV, radio, OOH, print and influencer campaigns, all in one place.
              </p>
              <div style={{ display:'flex', gap:12 }}>
                {[
                  { icon:'𝕏',  href:'https://x.com/brandcasta_ng' },
                  { icon:'in', href:'https://linkedin.com/company/brandcasta-nigeria' },
                  { icon:'ig', href:'https://instagram.com/brandcasta_ng' },
                ].map(s => (
                  <a key={s.icon} href={s.href} target="_blank" rel="noreferrer"
                    style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, textDecoration:'none' }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:18 }}>Company</p>
              {[['About Us','#'],['Newsroom','#'],['Insights','#'],['Careers','#']].map(([label,href]) => (
                <a key={label} href={href} className="footer-link" style={{ display:'block', fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none', marginBottom:12, fontWeight:500, transition:'color 0.15s' }}>{label}</a>
              ))}
            </div>

            {/* Support */}
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:18 }}>Support</p>
              {[['Contact','#'],['Docs','#'],['FAQ','#'],['hello@brandcasta.co','mailto:hello@brandcasta.co']].map(([label,href]) => (
                <a key={label} href={href} className="footer-link" style={{ display:'block', fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none', marginBottom:12, fontWeight:500, transition:'color 0.15s' }}>{label}</a>
              ))}
            </div>

            {/* Legal */}
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:18 }}>Legal</p>
              {[['Terms & Conditions','/terms'],['Privacy Policy','/privacy']].map(([label,href]) => (
                <Link key={label} to={href} className="footer-link" style={{ display:'block', fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none', marginBottom:12, fontWeight:500, transition:'color 0.15s' }}>{label}</Link>
              ))}
            </div>
          </div>

          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.22)' }}>© 2026 BrandCasta. All rights reserved.</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.22)' }}>Nigeria's media campaign operations platform.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}