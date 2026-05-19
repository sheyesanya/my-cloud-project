import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const WHITE_LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1779215588/Brandcasta_White_Logo_ekjvew.png';

export default function Login() {
  const navigate                = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mode, setMode]         = useState('login');

  const handle = async (fn) => {
    try { setLoading(true); setError(''); await fn(); navigate('/dashboard'); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, outline: 'none',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', transition: 'all 0.15s',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      <div style={{ position:'absolute', top:-180, right:-180, width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.18),transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:-180, left:-180, width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.12),transparent 70%)', pointerEvents:'none' }}/>

      <div
        className="relative w-full max-w-md"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 24, padding: '36px 40px' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:20 }}>
            <img
              src={WHITE_LOGO}
              alt="BrandCasta"
              style={{ width: 48, height: 48, objectFit: 'contain' }}
            />
            <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:22, color:'white', letterSpacing:'-0.5px' }}>BrandCasta</span>
          </div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:26, fontWeight:700, color:'white', letterSpacing:'-0.5px', lineHeight:1.1 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:8, lineHeight:1.6 }}>
            {mode === 'login' ? 'Sign in to your campaign operations dashboard' : 'Join BrandCasta and start managing campaigns'}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom:18, padding:'11px 14px', borderRadius:10, background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:13, border:'1px solid rgba(239,68,68,0.18)' }}>
            {error}
          </div>
        )}

        {/* Google */}
        <button
          onClick={() => handle(loginWithGoogle)}
          disabled={loading}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'12px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'white', fontWeight:600, fontSize:14, cursor:'pointer', marginBottom:20, transition:'all 0.15s' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }}/>
          <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.12em' }}>OR</p>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }}/>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor='rgba(99,102,241,0.5)'; e.target.style.background='rgba(99,102,241,0.06)'; }}
            onBlur={(e)  => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='rgba(255,255,255,0.05)'; }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handle(() => login(email, password))}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor='rgba(99,102,241,0.5)'; e.target.style.background='rgba(99,102,241,0.06)'; }}
            onBlur={(e)  => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='rgba(255,255,255,0.05)'; }}
          />
          <button
            onClick={() => handle(() => mode === 'login' ? login(email, password) : signup(email, password))}
            disabled={loading}
            className="btn-primary w-full justify-center"
            style={{ padding: '13px', fontSize: 14, borderRadius: 12, marginTop: 4 }}
          >
            {loading ? <><Spinner size={14}/> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color:'var(--accent-light)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}