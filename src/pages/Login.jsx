import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';

const FEATURES = [
  { title:'Television & Radio',  desc:'Prime-time spots on Channels TV, Cool FM, TVC, Wazobia FM and 60+ stations across Nigeria.' },
  { title:'Podcasts',            desc:"Partner with ISWIS, The Honest Bunch, WithChude and Nigeria's fastest-growing podcast creators." },
  { title:'Out-of-Home',         desc:'Billboards, LED screens, BRT wraps, airport and mall inventory from Lagos to Abuja.' },
  { title:'Print & Digital',     desc:'Punch, Guardian, BusinessDay and leading online publishers.' },
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

function useIsMobile(bp = 900) {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return mobile;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  const isMobile = useIsMobile(900);
  const isSmall  = useIsMobile(480);

  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [pw, setPw]             = useState('');
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [activeTest, setActive] = useState(0);
  // Google terms gate
  const [showGoogleTerms, setShowGoogleTerms] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const handle = async fn => {
    if (loading) return;
    setLoading(true); setError('');
    try { const r = await fn(); if (r !== null && r !== undefined) navigate('/dashboard'); }
    catch(e) { setError((e.message || '').replace('Firebase: ', '').replace(/\(auth.*?\)/g, '').trim()); }
    finally { setLoading(false); }
  };

  // Google sign-in — always shows terms confirmation first
  const handleGoogleClick = () => {
    setError('');
    setShowGoogleTerms(true);
  };

  const confirmGoogleSignIn = () => {
    setShowGoogleTerms(false);
    handle(loginWithGoogle);
  };

  const isProvider = mode === 'provider';

  // Shared input style — visible borders
  const inp = {
    width: '100%', border: '1.5px solid #c7c4d7', padding: '10px 12px',
    fontFamily: 'Inter,sans-serif', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', marginBottom: 12, borderRadius: 0,
    background: 'white', color: '#131b2e', transition: 'border-color 0.15s',
  };

  const px = isMobile ? '20px' : '40px';

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff', display: 'flex', flexDirection: 'column' }}>

      {/* ── Google Terms Modal ─────────────────────────────────── */}
      {showGoogleTerms && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(19,27,46,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', border: '1.5px solid #c7c4d7', padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 12px 40px rgba(19,27,46,0.18)' }}>
            <img src={LOGO} alt="BrandCasta" style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', marginBottom: 14 }}/>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 16, color: '#131b2e', marginBottom: 8 }}>Before you continue</div>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: '#464554', lineHeight: 1.75, marginBottom: 18 }}>
              By continuing with Google you confirm that you have read and agree to BrandCasta's{' '}
              <Link to="/terms" target="_blank" style={{ color: '#4338ca', fontWeight: 600 }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" target="_blank" style={{ color: '#4338ca', fontWeight: 600 }}>Privacy Policy</Link>.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowGoogleTerms(false)}
                style={{ flex: 1, padding: '10px', border: '1.5px solid #c7c4d7', background: 'transparent', fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', color: '#464554' }}>
                Cancel
              </button>
              <button onClick={confirmGoogleSignIn}
                style={{ flex: 2, padding: '10px', background: '#4338ca', color: 'white', border: 'none', fontFamily: 'IBM Plex Mono,monospace', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>
                Continue with Google →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e1e4f0', padding: `0 ${px}`, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src={LOGO} alt="BrandCasta" style={{ width: 28, height: 28, objectFit: 'contain' }}/>
          <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 16, color: '#131b2e' }}>
            Brand<span style={{ color: '#4d50d6' }}>Casta</span>
          </span>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 24 }}>
            {['Features', 'How it works', 'Providers'].map(l => (
              <span key={l} style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#464554', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setMode('signup')} style={{ padding: '7px 14px', border: '1.5px solid #c7c4d7', fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', cursor: 'pointer', color: '#464554' }}>Sign Up</button>
          <button onClick={() => setMode('login')}  style={{ padding: '7px 14px', background: '#4338ca', color: 'white', fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', cursor: 'pointer' }}>Sign In</button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${isMobile ? '36px' : '60px'} ${px}`, width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: isMobile ? 32 : 64, alignItems: 'flex-start' }}>

          {/* Left */}
          <div>
            <div style={{ display: 'inline-block', padding: '4px 12px', border: '1px solid #4338ca', fontFamily: 'IBM Plex Mono,monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#4338ca', marginBottom: 24 }}>
              Media Campaigns, Without Borders
            </div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: isSmall ? 40 : isMobile ? 50 : 62, lineHeight: 1.05, letterSpacing: '-2px', color: '#1e1b4b', marginBottom: 8 }}>
              Book media<br/>campaigns.
            </h1>
            <h1 style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: isSmall ? 40 : isMobile ? 50 : 62, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-2px', color: '#4338ca', marginBottom: 24 }}>
              One Platform.
            </h1>
            <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, color: '#464554', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Let's Run It.</p>
            <p style={{ fontSize: 15, color: '#464554', lineHeight: 1.8, marginBottom: 12, maxWidth: 480 }}>
              One platform to discover, book, generate and manage campaigns across Podcasts, Live Streaming Apps, TV, Radio, Billboards, Print and Social-Media Influencers.
            </p>
            <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#777586', letterSpacing: '0.04em', lineHeight: 1.9, marginBottom: 28 }}>
              5Sec Subsidized Ad-Spots · No Delayed Payment · MPO &amp; Invoice · Ad Tracker · Proof of Performance
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <button onClick={() => { setMode('signup'); setTimeout(() => document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' }), 80); }}
                style={{ padding: '13px 26px', background: '#4338ca', color: 'white', fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>
                Start a Campaign →
              </button>
              <button style={{ padding: '13px 26px', border: '1.5px solid #c7c4d7', fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'transparent', color: '#464554', cursor: 'pointer' }}>
                Browse Providers
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid #e1e4f0', paddingTop: 28 }}>
              {[['184+', 'Providers'], ['9', 'Media Types'], ['36+', 'Cities']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: isSmall ? 28 : 36, color: '#1e1b4b', letterSpacing: '-1px', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#464554', marginTop: 5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Card */}
          <div id="auth-card" style={{ background: 'white', border: '1.5px solid #c7c4d7', padding: isMobile ? 20 : 28, boxShadow: '0 4px 24px rgba(67,56,202,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <img src={LOGO} alt="" style={{ width: 30, height: 30, objectFit: 'contain', display: 'block', margin: '0 auto 8px' }}/>
              <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 15, color: '#131b2e', marginBottom: 2 }}>
                {isProvider ? 'Provider Sign In' : mode === 'login' ? 'Welcome back' : 'Get started free'}
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 9, color: '#777586', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isProvider ? 'Provider dashboard' : 'BrandCasta'}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', border: '1.5px solid #c7c4d7', marginBottom: 16 }}>
              {[['login', 'Sign In'], ['signup', 'Sign Up'], ['provider', 'Provider']].map(([m, l]) => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ flex: 1, padding: '9px 4px', border: 'none', borderRight: m !== 'provider' ? '1px solid #c7c4d7' : 'none', fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', background: mode === m ? '#4338ca' : 'transparent', color: mode === m ? 'white' : '#464554', transition: 'all 0.15s' }}>
                  {l}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1.5px solid #fca5a5', fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#dc2626', marginBottom: 12 }}>
                {error}
              </div>
            )}

            {/* Terms checkbox — shown for signup AND always visible for Google on any mode */}
            {(mode === 'signup' || mode === 'login' || isProvider) && (
              <div
                onClick={() => setAgreed(a => !a)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, cursor: 'pointer', padding: '10px 12px', border: `1.5px solid ${agreed ? '#4338ca' : '#c7c4d7'}`, background: agreed ? '#f0f1ff' : '#fafafa', transition: 'all 0.15s' }}>
                <div style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, border: `2px solid ${agreed ? '#4338ca' : '#9ca3af'}`, background: agreed ? '#4338ca' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {agreed && (
                    <svg width="9" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </div>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, color: '#464554', lineHeight: 1.65, margin: 0 }}>
                  I agree to BrandCasta's{' '}
                  <Link to="/terms" target="_blank" onClick={e => e.stopPropagation()} style={{ color: '#4338ca', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" onClick={e => e.stopPropagation()} style={{ color: '#4338ca', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link>
                </p>
              </div>
            )}

            {/* Google button */}
            <button
              onClick={handleGoogleClick}
              disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 12px', background: 'white', border: '1.5px solid #c7c4d7', fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 12, color: '#131b2e', cursor: 'pointer', marginBottom: 14, transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4338ca'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#c7c4d7'}>
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0124 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              </svg>
              {isProvider ? 'Sign in as Provider' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: '#e1e4f0' }}/>
              <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 9, color: '#777586', letterSpacing: '0.08em' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#e1e4f0' }}/>
            </div>

            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inp}
              onFocus={e => e.target.style.borderColor = '#4338ca'}
              onBlur={e => e.target.style.borderColor = '#c7c4d7'}/>

            <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)}
              style={{ ...inp, marginBottom: 16 }}
              onFocus={e => e.target.style.borderColor = '#4338ca'}
              onBlur={e => e.target.style.borderColor = '#c7c4d7'}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if ((mode === 'signup') && !agreed) { setError('Please agree to the Terms & Policy.'); return; }
                  handle(() => mode === 'login' || isProvider ? login(email, pw) : signup(email, pw));
                }
              }}/>

            <button
              onClick={() => {
                if ((mode === 'signup') && !agreed) { setError('Please agree to the Terms & Policy.'); return; }
                handle(() => mode === 'login' || isProvider ? login(email, pw) : signup(email, pw));
              }}
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: isProvider ? '#0d9488' : '#4338ca', color: 'white', fontFamily: 'IBM Plex Mono,monospace', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer', marginBottom: 14, transition: 'opacity 0.15s', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : isProvider ? 'Provider Sign In →' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>

            <div style={{ borderTop: '1px solid #e1e4f0', paddingTop: 12, textAlign: 'center' }}>
              <Link to="/register/provider"
                style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 9, color: '#0d9488', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', border: '1.5px solid #99f6e4', padding: '6px 14px', display: 'inline-block' }}>
                Apply as Provider →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section style={{ background: 'white', borderTop: '1px solid #e1e4f0', borderBottom: '1px solid #e1e4f0', padding: `${isMobile ? '48px' : '72px'} 0` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `0 ${px}` }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#4338ca', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Media Channels</p>
            <h2 style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: isSmall ? 26 : 38, color: '#1e1b4b', letterSpacing: '-0.8px', lineHeight: 1.1 }}>Every channel.<br/>One brief.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 1, background: '#e1e4f0' }}>
            {FEATURES.map(f => (
              <div key={f.title}
                style={{ padding: '24px 22px', background: 'white', transition: 'background 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f2f3ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <div style={{ width: 24, height: 2, background: '#4338ca', marginBottom: 14 }}/>
                <p style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 14, color: '#131b2e', marginBottom: 8 }}>{f.title}</p>
                <p style={{ fontSize: 12, color: '#464554', lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{ padding: `${isMobile ? '48px' : '72px'} 0`, background: '#faf8ff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `0 ${px}` }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#4338ca', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Process</p>
            <h2 style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: isSmall ? 26 : 38, color: '#1e1b4b', letterSpacing: '-0.8px' }}>How it works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 1, background: '#e1e4f0' }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ padding: '24px 20px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 10, right: 14, fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 56, color: '#f0f1ff', lineHeight: 1, userSelect: 'none' }}>{s.n}</div>
                <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#4338ca', letterSpacing: '0.1em', marginBottom: 12 }}>{s.n}</p>
                <p style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 14, color: '#131b2e', marginBottom: 6 }}>{s.title}</p>
                <p style={{ fontSize: 12, color: '#464554', lineHeight: 1.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section style={{ background: 'white', borderTop: '1px solid #e1e4f0', borderBottom: '1px solid #e1e4f0', padding: `${isMobile ? '48px' : '72px'} 0` }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: `0 ${px}` }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#4338ca', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Testimonials</p>
            <h2 style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: isSmall ? 24 : 32, color: '#1e1b4b', letterSpacing: '-0.6px' }}>What our clients say</h2>
          </div>
          <div style={{ minHeight: 160 }}>
            {TESTIMONIALS.map((t, i) => i === activeTest && (
              <div key={i} style={{ padding: '22px 24px', background: '#faf8ff', border: '1px solid #e1e4f0', borderLeft: '3px solid #4338ca' }}>
                <div style={{ width: 20, height: 2, background: '#4338ca', marginBottom: 14 }}/>
                <p style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: isMobile ? 13 : 15, color: '#464554', lineHeight: 1.85, marginBottom: 14 }}>"{t.quote}"</p>
                <p style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 13, color: '#131b2e' }}>{t.name}</p>
                <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 9, color: '#777586', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.role}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                style={{ height: 3, border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: i === activeTest ? '#4338ca' : '#c7c4d7', width: i === activeTest ? 28 : 10 }}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVIDER CTA ─────────────────────────────────────────── */}
      <section style={{ padding: `${isMobile ? '48px' : '72px'} 0`, background: '#faf8ff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `0 ${px}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: isMobile ? 24 : 48, alignItems: 'center', padding: isMobile ? '24px 20px' : '40px 44px', background: 'white', border: '1px solid #e1e4f0', borderLeft: '3px solid #4338ca' }}>
            <div>
              <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#4338ca', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>For Media Organisations</p>
              <h2 style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: isSmall ? 20 : 28, color: '#1e1b4b', letterSpacing: '-0.5px', marginBottom: 10 }}>
                List your inventory<br/>on BrandCasta
              </h2>
              <p style={{ fontSize: 13, color: '#464554', lineHeight: 1.8, maxWidth: 460 }}>
                Receive booking requests from top Nigerian brands. Approve in one click. Get paid directly without chasing clients.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/register/provider"
                style={{ padding: '12px 22px', background: '#4338ca', color: 'white', fontFamily: 'IBM Plex Mono,monospace', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', display: 'block', whiteSpace: 'nowrap' }}>
                Apply as Provider →
              </Link>
              <button onClick={() => { setMode('login'); document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' }); }}
                style={{ padding: '12px 22px', background: 'transparent', border: '1.5px solid #c7c4d7', color: '#464554', fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #e1e4f0', padding: `${isMobile ? '36px' : '52px'} 0 24px`, background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `0 ${px}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : isMobile ? '1fr 1fr' : '1.5fr 1fr 1fr 1fr', gap: isMobile ? 24 : 40, marginBottom: 36 }}>
            <div>
              <div style={{ display: 'flex', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 15, color: '#131b2e' }}>Brand</span>
                <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 15, color: '#4d50d6' }}>Casta</span>
              </div>
              <p style={{ fontSize: 12, color: '#464554', lineHeight: 1.85, maxWidth: 200, marginBottom: 16 }}>Nigeria's leading media campaign operations platform.</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['𝕏', 'https://x.com/brandcasta_ng'], ['in', 'https://linkedin.com/company/brandcasta-nigeria'], ['ig', 'https://instagram.com/brandcasta_ng']].map(([icon, href]) => (
                  <a key={icon} href={href} target="_blank" rel="noreferrer"
                    style={{ width: 28, height: 28, background: '#f2f3ff', border: '1px solid #e1e4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#464554', fontSize: 10, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#4338ca'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f2f3ff'; e.currentTarget.style.color = '#464554'; }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Company', links: ['About Us', 'Newsroom', 'Insights', 'Careers'] },
              { title: 'Support',  links: ['Contact', 'Documentation', 'FAQ', 'hello@brandcasta.co'] },
              { title: 'Legal',    links: ['Terms & Conditions', 'Privacy Policy'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 9, color: '#777586', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12 }}>{col.title}</p>
                {col.links.map(l => (
                  <a key={l} href="#"
                    style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: '#464554', textDecoration: 'none', display: 'block', marginBottom: 8, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.color = '#464554'}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #e1e4f0', paddingTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#777586' }}>© 2026 BrandCasta. All rights reserved.</p>
            <p style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#777586' }}>Media Campaigns, Without Borders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}