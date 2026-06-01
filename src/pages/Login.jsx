import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode]     = useState('login');
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handle = async fn => {
    if (loading) return;
    setLoading(true); setError('');
    try { const r = await fn(); if (r!==null&&r!==undefined) navigate('/dashboard'); }
    catch(e) { setError((e.message||'').replace('Firebase: ','').replace(/\(auth.*?\)/g,'').trim()); }
    finally { setLoading(false); }
  };

  const isProvider = mode==='provider';
  const card = {background:'white',border:'1px solid #e1e4f0',padding:32,width:'100%',maxWidth:400};
  const inp  = {width:'100%',border:'1px solid #e1e4f0',padding:'10px 12px',fontFamily:'Inter,sans-serif',fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:12};
  const btn  = (bg,color) => ({width:'100%',padding:'12px',background:bg,color,fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',border:'none',cursor:'pointer',marginBottom:8});

  return (
    <div style={{minHeight:'100vh',background:'#faf8ff',display:'flex',flexDirection:'column'}}>
      {/* Nav */}
      <nav style={{background:'white',borderBottom:'1px solid #e1e4f0',padding:'0 32px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <img src={LOGO} alt="BrandCasta" style={{width:28,height:28,objectFit:'contain'}}/>
          <span style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:16,color:'#131b2e'}}>Brand<span style={{color:'#4d50d6'}}>Casta</span></span>
        </div>
        <div style={{display:'flex',gap:24}}>
          {['Features','How it works','Providers'].map(l=>(
            <span key={l} style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',color:'#464554',cursor:'pointer'}}>{l}</span>
          ))}
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setMode('signup')} style={{padding:'8px 16px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',background:'transparent',cursor:'pointer'}}>Sign Up</button>
          <button onClick={()=>setMode('login')}  style={{padding:'8px 16px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:'pointer'}}>Sign In</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 440px',gap:64,alignItems:'center',maxWidth:1200,margin:'0 auto',padding:'60px 32px',width:'100%'}}>
        <div>
          {/* Grid bg */}
          <div style={{position:'absolute',inset:0,zIndex:0,backgroundImage:'linear-gradient(#e1e4f0 1px,transparent 1px),linear-gradient(90deg,#e1e4f0 1px,transparent 1px)',backgroundSize:'40px 40px',opacity:0.4,pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'inline-block',padding:'4px 12px',border:'1px solid #4338ca',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.2em',color:'#4338ca',marginBottom:24}}>Media Campaigns, Without Borders</div>
            <h1 style={{fontFamily:'Georgia,serif',fontWeight:700,fontSize:60,lineHeight:1.05,letterSpacing:'-2px',color:'#1e1b4b',marginBottom:8}}>
              Book media<br/>campaigns.
            </h1>
            <h1 style={{fontFamily:'Georgia,serif',fontWeight:700,fontSize:60,fontStyle:'italic',lineHeight:1.05,letterSpacing:'-2px',color:'#4338ca',marginBottom:24}}>One Platform.</h1>
            <p style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#464554',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:20}}>Let's Run It.</p>
            <p style={{fontSize:16,color:'#464554',lineHeight:1.75,marginBottom:12,maxWidth:480}}>One platform to discover, book, generate and manage campaigns across Podcasts, Live Streaming Apps, TV, Radio, Billboards, Print and Social-Media Influencers.</p>
            <p style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586',letterSpacing:'0.04em',lineHeight:1.8,marginBottom:32}}>5Sec Subsidized Ad-Spots · No Delayed Payment · MPO & Invoice · Ad Tracker · Proof of Performance</p>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              <button onClick={()=>setMode('signup')} style={{padding:'14px 28px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontSize:11,textTransform:'uppercase',letterSpacing:'0.12em',border:'none',cursor:'pointer'}}>Start a Campaign →</button>
              <button style={{padding:'14px 28px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:11,textTransform:'uppercase',letterSpacing:'0.12em',background:'transparent',color:'#464554',cursor:'pointer'}}>Browse Providers</button>
            </div>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0,borderTop:'1px solid #e1e4f0',marginTop:48,paddingTop:32}}>
              {[['184+','Providers'],['9','Media Types'],['36+','Cities Covered']].map(([v,l])=>(
                <div key={l} style={{paddingRight:24}}>
                  <div style={{fontFamily:'Georgia,serif',fontWeight:700,fontSize:36,color:'#1e1b4b',letterSpacing:'-1px',lineHeight:1}}>{v}</div>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.16em',color:'#464554',marginTop:6}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div style={card}>
          <div style={{textAlign:'center',marginBottom:20}}>
            <img src={LOGO} alt="" style={{width:32,height:32,objectFit:'contain',marginBottom:8,display:'block',margin:'0 auto 8px'}}/>
            <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:15,color:'#131b2e',marginBottom:3}}>{isProvider?'Provider Sign In':mode==='login'?'Welcome back':'Get started free'}</div>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',letterSpacing:'0.08em',textTransform:'uppercase'}}>{isProvider?'Provider dashboard':'BrandCasta'}</div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',border:'1px solid #e1e4f0',marginBottom:16}}>
            {[['login','Sign In'],['signup','Sign Up'],['provider','Provider']].map(([m,l])=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'8px',border:'none',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer',background:mode===m?'#4338ca':'transparent',color:mode===m?'white':'#464554'}}>{l}</button>
            ))}
          </div>

          {error && <div style={{padding:'8px 10px',background:'#fef2f2',border:'1px solid #fecaca',fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#dc2626',marginBottom:12}}>{error}</div>}

          {mode==='signup' && (
            <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:12,cursor:'pointer'}} onClick={()=>setAgreed(a=>!a)}>
              <div style={{width:14,height:14,border:'1px solid #e1e4f0',background:agreed?'#4338ca':'white',flexShrink:0,marginTop:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {agreed&&<svg width="9" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
              </div>
              <p style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#464554',lineHeight:1.6}}>
                I agree to BrandCasta's <Link to="/terms" target="_blank" style={{color:'#4338ca'}}>Terms</Link> and <Link to="/privacy" target="_blank" style={{color:'#4338ca'}}>Privacy Policy</Link>
              </p>
            </div>
          )}

          {/* Google */}
          <button onClick={()=>{ if(mode==='signup'&&!agreed){setError('Please agree to the Terms.');return;} handle(loginWithGoogle); }} disabled={loading}
            style={{...btn('white','#131b2e'),border:'1px solid #e1e4f0',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:12}}>
            <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0124 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
            {isProvider?'Sign in as Provider':'Continue with Google'}
          </button>

          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <div style={{flex:1,height:0.5,background:'#e1e4f0'}}/><span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586'}}>OR</span><div style={{flex:1,height:0.5,background:'#e1e4f0'}}/>
          </div>

          <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
          <input type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}
            style={{...inp,marginBottom:16}}
            onKeyDown={e=>{if(e.key==='Enter'){if(mode==='signup'&&!agreed){setError('Please agree.');return;} handle(()=>mode==='login'||isProvider?login(email,pw):signup(email,pw));}}}/>

          <button onClick={()=>{ if(mode==='signup'&&!agreed){setError('Please agree to the Terms.');return;} handle(()=>mode==='login'||isProvider?login(email,pw):signup(email,pw)); }}
            disabled={loading} style={btn(isProvider?'#0d9488':'#4338ca','white')}>
            {loading?'Signing in…':isProvider?'Provider Sign In →':mode==='login'?'Sign In →':'Create Account →'}
          </button>

          <div style={{borderTop:'1px solid #e1e4f0',marginTop:12,paddingTop:12,textAlign:'center'}}>
            <Link to="/register/provider" style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#0d9488',textDecoration:'none',letterSpacing:'0.08em',textTransform:'uppercase',border:'1px solid #99f6e4',padding:'5px 12px',display:'inline-block'}}>Apply as Provider →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
