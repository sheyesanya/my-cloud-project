import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';
import api from '../services/api';

import WHITE_LOGO from '../assets/logo.png';

export default function RegisterClient() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  const [step, setStep]         = useState(1); // 1 = account, 2 = brand details
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [firebaseUser, setFirebaseUser] = useState(null);

  const [account, setAccount] = useState({ email: '', password: '', confirmPassword: '' });
  const [brand, setBrand]     = useState({
    brandName: '', industry: '', website: '', phone: '', description: '',
  });

  const setA = (k, v) => setAccount(f => ({ ...f, [k]: v }));
  const setB = (k, v) => setBrand(f => ({ ...f, [k]: v }));

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 13, outline: 'none',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', transition: 'all 0.15s',
  };

  const handleAccountStep = async (e) => {
    e.preventDefault();
    if (account.password !== account.confirmPassword) { setError('Passwords do not match'); return; }
    if (account.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const cred = await signup(account.email, account.password);
      setFirebaseUser(cred.user);
      setStep(2);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleGoogleStep = async () => {
    setLoading(true); setError('');
    try {
      const { loginWithGoogle: lgoog } = useAuth();
      // handled below via loginWithGoogle prop
    } catch(e) { setError(e.message); setLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setLoading(true); setError('');
    try {
      const cred = await loginWithGoogle();
      setFirebaseUser(cred.user);
      // prefill email from Google
      setAccount(f => ({ ...f, email: cred.user.email }));
      setStep(2);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleBrandStep = async (e) => {
    e.preventDefault();
    if (!brand.brandName.trim()) { setError('Brand name is required'); return; }
    setLoading(true); setError('');
    try {
      // Register user in DynamoDB with CLIENT role
      await api.post('/register', {
        userId:      firebaseUser?.uid,
        email:       account.email || firebaseUser?.email,
        name:        brand.brandName,
        role:        'CLIENT',
        brandName:   brand.brandName,
        industry:    brand.industry,
        website:     brand.website,
        phone:       brand.phone,
        description: brand.description,
      });
      navigate('/dashboard');
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div style={{ position:'absolute', top:-180, right:-180, width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-160, left:-160, width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.1),transparent 70%)', pointerEvents:'none' }}/>

      <div className="relative w-full max-w-md" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 24, padding: '36px 40px' }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 }}>
            <img src={WHITE_LOGO} alt="BrandCasta" style={{ width:40, height:40, objectFit:'contain' }}/>
            <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:20, color:'white', letterSpacing:'-0.3px' }}>BrandCasta</span>
          </div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:24, fontWeight:700, color:'white', letterSpacing:'-0.3px' }}>
            {step === 1 ? 'Create your account' : 'Tell us about your brand'}
          </h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:8 }}>
            {step === 1 ? 'Start booking media campaigns across Nigeria' : 'Help us personalize your experience'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
          {[1,2].map((s) => (
            <div key={s} style={{ flex:1, height:3, borderRadius:2, background: s <= step ? 'linear-gradient(90deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.1)', transition:'all 0.3s' }}/>
          ))}
        </div>

        {error && (
          <div style={{ marginBottom:16, padding:'11px 14px', borderRadius:10, background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:13, border:'1px solid rgba(239,68,68,0.18)' }}>
            {error}
          </div>
        )}

        {/* Step 1 — Account */}
        {step === 1 && (
          <>
            <button onClick={handleGoogleSignup} disabled={loading}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'12px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'white', fontWeight:600, fontSize:13, cursor:'pointer', marginBottom:18 }}>
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }}/>
              <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.12em' }}>OR</p>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }}/>
            </div>

            <form onSubmit={handleAccountStep} className="space-y-3">
              <input type="email" placeholder="Email address" value={account.email} onChange={(e) => setA('email', e.target.value)} required style={inp}/>
              <input type="password" placeholder="Password (min 6 characters)" value={account.password} onChange={(e) => setA('password', e.target.value)} required style={inp}/>
              <input type="password" placeholder="Confirm password" value={account.confirmPassword} onChange={(e) => setA('confirmPassword', e.target.value)} required style={inp}/>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ padding:'13px', fontSize:14, borderRadius:12, marginTop:4 }}>
                {loading ? <><Spinner size={14}/> Creating account…</> : 'Continue →'}
              </button>
            </form>
          </>
        )}

        {/* Step 2 — Brand Details */}
        {step === 2 && (
          <form onSubmit={handleBrandStep} className="space-y-3">
            <input placeholder="Brand / Company name *" value={brand.brandName} onChange={(e) => setB('brandName', e.target.value)} required style={inp}/>
            <select value={brand.industry} onChange={(e) => setB('industry', e.target.value)} style={{ ...inp, appearance:'none' }}>
              <option value="">Industry (optional)</option>
              {['FMCG','Telecoms','Banking & Finance','Insurance','Technology','Real Estate','Fashion & Beauty','Food & Beverage','Automotive','Entertainment','Healthcare','Education','Other'].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <input placeholder="Website (optional)" value={brand.website} onChange={(e) => setB('website', e.target.value)} style={inp}/>
            <input placeholder="Phone number (optional)" value={brand.phone} onChange={(e) => setB('phone', e.target.value)} style={inp}/>
            <textarea placeholder="Brief description of your brand (optional)" rows={3} value={brand.description} onChange={(e) => setB('description', e.target.value)} style={{ ...inp, resize:'vertical' }}/>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ padding:'13px', fontSize:14, borderRadius:12, marginTop:4 }}>
              {loading ? <><Spinner size={14}/> Setting up your account…</> : 'Launch Dashboard →'}
            </button>
          </form>
        )}

        <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text-muted)' }}>
          Are you a media organisation?{' '}
          <Link to="/register/provider" style={{ color:'var(--accent-light)', fontWeight:600, textDecoration:'none' }}>
            Apply as a provider
          </Link>
        </p>
        <p style={{ textAlign:'center', marginTop:8, fontSize:13, color:'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--accent-light)', fontWeight:600, textDecoration:'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}