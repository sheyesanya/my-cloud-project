import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { useSubscription } from '../context/SubscriptionContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' };
};

const PLANS = [
  {
    key:'FREE', name:'Free', price:'₦0', per:'forever',
    features:['Campaign dashboard','184+ media providers','Create & manage campaigns'],
    missing:['Analytics','AI brief generator','AI insights','Campaign Assistant'],
  },
  {
    key:'PREMIUM', name:'Premium', price:'₦25,000', per:'per 15 days',
    badge:'Most popular',
    features:['Everything in Free','Campaign analytics','Proof of performance','Priority support'],
    missing:['AI brief generator','AI insights'],
  },
  {
    key:'PRO', name:'Pro', price:'₦45,000', per:'per month',
    badge:'Full access',
    features:['Everything in Premium','AI brief generator','AI campaign insights','Campaign Assistant','Dedicated account manager'],
    missing:[],
  },
];

const COMPARE = [
  ['Campaign dashboard',       true,  true,  true ],
  ['184+ media providers',     true,  true,  true ],
  ['Create campaigns',         true,  true,  true ],
  ['Campaign analytics',       false, true,  true ],
  ['Proof of performance',     false, true,  true ],
  ['Priority support',         false, true,  true ],
  ['AI brief generator',       false, false, true ],
  ['AI campaign insights',     false, false, true ],
  ['Campaign Assistant',       false, false, true ],
  ['Dedicated account manager',false, false, true ],
];

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const fadeUp  = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ duration:0.45, ease:[0.22,1,0.36,1] } } };

export default function Subscription() {
  const [params]    = useSearchParams();
  const { subscription, loading, isPremium, isPro, refetch } = useSubscription();
  const [paying, setPaying]         = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [verifying, setVerifying]   = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (type, message) => { setToast({type,message}); setTimeout(()=>setToast(null),4000); };

  useEffect(() => {
    const ref  = params.get('reference') || params.get('trxref');
    const tier = params.get('tier') || params.get('plan');
    if (ref && tier) verifyPayment(ref, tier);
  }, []);

  const verifyPayment = async (reference, tier) => {
    setVerifying(true);
    try {
      const headers = await authHeader();
      const res = await axios.post(`${API}/subscription/verify`, { reference, tier }, { headers });
      if (res.data.success) {
        await refetch();
        showToast('success', `🎉 Welcome to BrandCasta ${tier}! Your subscription is active.`);
        window.history.replaceState({},'','/subscription');
      }
    } catch(e) { showToast('error', e.response?.data?.error || 'Verification failed'); }
    finally { setVerifying(false); }
  };

  const subscribe = async (plan) => {
    if (plan === 'FREE') return;
    setPaying(true);
    try {
      const headers = await authHeader();
      const res = await axios.post(`${API}/subscription/initialize`, { tier:plan }, { headers });
      window.location.href = res.data.paymentUrl;
    } catch(e) { showToast('error', e.response?.data?.error || 'Could not initialize payment'); }
    finally { setPaying(false); }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel your subscription? You keep access until the current period expires.')) return;
    setCancelling(true);
    try {
      const headers = await authHeader();
      await axios.post(`${API}/subscription/cancel`, {}, { headers });
      await refetch();
      showToast('success', 'Subscription cancelled');
    } catch(e) { showToast('error', e.response?.data?.error || 'Could not cancel'); }
    finally { setCancelling(false); }
  };

  const currentTier = subscription?.tier || 'FREE';
  const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d; }};

  if (loading || verifying) return (
    <Layout title="Plans & Pricing" subtitle="Subscription">
      <PageTitle title="Plans & Pricing"/>
      <div style={{ display:'flex', gap:10, color:'var(--text3)', padding:'40px 0', alignItems:'center' }}>
        <Spinner size={14}/>{verifying ? 'Activating your subscription…' : 'Loading…'}
      </div>
    </Layout>
  );

  return (
    <>
      <PageTitle title="Plans & Pricing"/>
      <Layout title="Plans & Pricing" subtitle="Subscription">
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Active plan banner */}
        {(isPremium || isPro) && subscription && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            style={{ padding:'14px 20px', background:'var(--amber-dim)', border:'1px solid var(--amber-border)', borderLeft:'3px solid var(--amber)', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:3 }}>
                {isPro ? '◈ Pro Plan Active' : '◈ Premium Plan Active'}
              </div>
              <p style={{ fontSize:11, color:'var(--text3)', fontFamily:'IBM Plex Mono,monospace' }}>Expires {fmtDate(subscription.expiresAt)}</p>
            </div>
            <button onClick={cancel} disabled={cancelling} className="btn-secondary" style={{ fontSize:10 }}>
              {cancelling ? <><Spinner size={10}/>Cancelling…</> : 'Cancel Subscription'}
            </button>
          </motion.div>
        )}

        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

          {/* Plan cards */}
          <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:1, background:'var(--border)' }}>
            {PLANS.map(plan => {
              const isCurrent = currentTier === plan.key || (plan.key === 'FREE' && !isPremium && !isPro);
              return (
                <div key={plan.key}
                  style={{ padding:'22px', background: plan.badge ? 'var(--bg2)' : 'var(--bg)', position:'relative', display:'flex', flexDirection:'column', borderTop: plan.key === 'PREMIUM' ? '2px solid var(--amber)' : plan.key === 'PRO' ? '2px solid #5eead4' : '2px solid transparent' }}>
                  {plan.badge && (
                    <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--amber)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>{plan.badge}</div>
                  )}
                  <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, color:'var(--text)', marginBottom:4 }}>{plan.name}</div>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, color: plan.key === 'PRO' ? '#5eead4' : plan.key === 'PREMIUM' ? 'var(--amber)' : 'var(--text)', letterSpacing:'-1px', lineHeight:1, marginBottom:4 }}>{plan.price}</div>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginBottom:18 }}>{plan.per}</div>

                  <div style={{ flex:1, marginBottom:18 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7, fontSize:11, color:'var(--text2)' }}>
                        <span style={{ color: plan.key==='PRO' ? '#5eead4' : 'var(--amber)', fontSize:10, flexShrink:0 }}>✓</span>{f}
                      </div>
                    ))}
                    {plan.missing.map(f => (
                      <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7, fontSize:11, color:'var(--text3)', opacity:0.4 }}>
                        <span style={{ fontSize:10, flexShrink:0 }}>—</span>{f}
                      </div>
                    ))}
                  </div>

                  {isCurrent ? (
                    <div style={{ padding:'8px', textAlign:'center', border:'1px solid var(--border)', fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                      Current Plan
                    </div>
                  ) : (
                    <button onClick={() => subscribe(plan.key)} disabled={paying}
                      style={{ padding:'10px', border:'none', fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:11, cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                        background: plan.key === 'PRO' ? '#5eead4' : 'var(--amber)',
                        color: '#0a0a0f',
                      }}>
                      {paying ? <><Spinner size={11}/>…</> : `Get ${plan.name} →`}
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Comparison table */}
          <motion.div variants={fadeUp} className="page-card" style={{ padding:'20px 22px' }}>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16 }}>Feature Comparison</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  <th style={{ padding:'8px 0', textAlign:'left', fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', width:'55%' }}>Feature</th>
                  {PLANS.map(p => (
                    <th key={p.key} style={{ padding:'8px 12px', textAlign:'center', fontFamily:'Manrope,sans-serif', fontSize:11, fontWeight:700, color: p.key==='PRO' ? '#5eead4' : p.key==='PREMIUM' ? 'var(--amber)' : 'var(--text3)' }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([feat,...vals]) => (
                  <tr key={feat} style={{ borderBottom:'1px solid var(--border2)' }}>
                    <td style={{ padding:'9px 0', fontSize:12, color:'var(--text2)' }}>{feat}</td>
                    {vals.map((v,i) => (
                      <td key={i} style={{ padding:'9px 12px', textAlign:'center' }}>
                        {v ? <span style={{ color: i===2 ? '#5eead4' : 'var(--amber)', fontSize:12 }}>✓</span> : <span style={{ color:'var(--text3)', opacity:0.3, fontSize:11 }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

        </motion.div>
      </Layout>
    </>
  );
}