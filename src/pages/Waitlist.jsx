import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';

const SELLS_OPTIONS = [
  'Television & Radio Ads',
  'Out-of-Home / Billboards',
  'Podcasts',
  'Print Media',
  'Influencer Marketing',
  'Social Media Promotion',
  'Music Promotion',
  'Live Streaming',
  'Other',
];

function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  if (typeof window !== 'undefined') {
    window.onresize = () => setMobile(window.innerWidth <= bp);
  }
  return mobile;
}

export default function Waitlist() {
  const isMobile = useIsMobile(768);
  const [form, setForm] = useState({ name:'', email:'', businessName:'', phone:'', sells:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    if (!form.name.trim())       { setError('Please enter your name'); return; }
    if (!form.email.trim())      { setError('Please enter your email'); return; }
    if (!form.businessName.trim()){ setError('Please enter your business name'); return; }
    if (!form.phone.trim())      { setError('Please enter your phone number'); return; }
    if (!form.sells)             { setError('Please select what you sell'); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/waitlist`, form);
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', border: '1.5px solid #c7c4d7', padding: '11px 14px',
    fontFamily: 'Inter,sans-serif', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', marginBottom: 14, borderRadius: 0,
    background: 'white', color: '#131b2e',
  };
  const label = { fontFamily:'IBM Plex Mono,monospace', fontSize:9, textTransform:'uppercase', letterSpacing:'0.12em', color:'#464554', display:'block', marginBottom:6 };

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e1e4f0', padding: `0 ${isMobile?'20px':'40px'}`, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={LOGO} alt="BrandCasta" style={{ width: 28, height: 28, objectFit: 'contain' }}/>
          <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 16, color: '#131b2e' }}>
            Brand<span style={{ color: '#4d50d6' }}>Casta</span>
          </span>
        </Link>
        <Link to="/" style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#464554', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.08em' }}>
          ← Back to Home
        </Link>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '32px 20px' : '60px 40px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>

          {!done ? (
            <>
              <div style={{ display: 'inline-block', padding: '4px 12px', border: '1px solid #4338ca', fontFamily: 'IBM Plex Mono,monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#4338ca', marginBottom: 20 }}>
                Early Access
              </div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: isMobile ? 32 : 40, lineHeight: 1.1, letterSpacing: '-1px', color: '#1e1b4b', marginBottom: 12 }}>
                Join the BrandCasta waitlist
              </h1>
              <p style={{ fontSize: 14, color: '#464554', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
                Are you a media salesperson or business owner with advertising inventory to sell? Join the waitlist to get early access as we onboard new providers.
              </p>

              <div style={{ background: 'white', border: '1.5px solid #c7c4d7', padding: isMobile ? 20 : 28 }}>
                <label style={label}>Full Name *</label>
                <input style={inp} placeholder="e.g. Adaeze Nwosu" value={form.name} onChange={e=>set('name', e.target.value)}/>

                <label style={label}>Email Address *</label>
                <input type="email" style={inp} placeholder="you@company.com" value={form.email} onChange={e=>set('email', e.target.value)}/>

                <label style={label}>Business Name *</label>
                <input style={inp} placeholder="e.g. Cool FM Lagos" value={form.businessName} onChange={e=>set('businessName', e.target.value)}/>

                <label style={label}>Phone Number *</label>
                <input type="tel" style={inp} placeholder="080X XXX XXXX" value={form.phone} onChange={e=>set('phone', e.target.value)}/>

                <label style={label}>What do you sell? *</label>
                <select style={{...inp, cursor:'pointer'}} value={form.sells} onChange={e=>set('sells', e.target.value)}>
                  <option value="">Select an option</option>
                  {SELLS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>

                {error && (
                  <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1.5px solid #fca5a5', fontFamily: 'IBM Plex Mono,monospace', fontSize: 10, color: '#dc2626', marginBottom: 14 }}>
                    {error}
                  </div>
                )}

                <button onClick={submit} disabled={loading}
                  style={{ width: '100%', padding: '13px', background: '#4338ca', color: 'white', fontFamily: 'IBM Plex Mono,monospace', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Joining…' : 'Join Waitlist →'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ background: 'white', border: '1.5px solid #c7c4d7', padding: isMobile ? 28 : 40, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: '#f0fdf4', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', borderRadius: '50%' }}>
                <svg width="22" height="22" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 20, color: '#131b2e', marginBottom: 10 }}>You're on the list!</h2>
              <p style={{ fontSize: 13, color: '#464554', lineHeight: 1.7, marginBottom: 24 }}>
                Thanks for joining, {form.name.split(' ')[0]}. We'll reach out to {form.email} as soon as a spot opens up.
              </p>
              <Link to="/" style={{ display: 'inline-block', padding: '11px 24px', background: '#4338ca', color: 'white', fontFamily: 'IBM Plex Mono,monospace', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
