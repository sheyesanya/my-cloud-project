import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { useSubscription } from '../context/SubscriptionContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' };
};

const PLANS = [
  {
    key: 'FREE', name: 'Free', price: '₦0', per: 'forever',
    color: 'var(--text-secondary)', borderColor: 'var(--border)',
    features: ['Campaign dashboard','184+ media providers','Create & manage campaigns'],
    missing: ['Analytics','AI brief generator','AI insights'],
  },
  {
    key: 'PREMIUM', name: 'Premium', price: '₦25,000', per: 'per 15 days',
    color: 'var(--accent-light)', borderColor: 'var(--accent-border)',
    badge: 'Most popular',
    features: ['Everything in Free','Campaign analytics','Proof of performance','Priority support'],
    missing: ['AI brief generator','AI insights'],
  },
  {
    key: 'PRO', name: 'Pro', price: '₦45,000', per: 'per month',
    color: '#fcd34d', borderColor: 'rgba(245,158,11,0.3)',
    badge: 'Full access',
    features: ['Everything in Premium','AI brief generator','AI campaign insights','Dedicated account manager'],
    missing: [],
  },
];

export default function Subscription() {
  const [params]    = useSearchParams();
  const { subscription, loading, isPremium, isPro, refetch } = useSubscription();
  const [paying, setPaying]       = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast]         = useState(null);
  const [verifying, setVerifying] = useState(false);

  const showToast = (type, message) => { setToast({type,message}); setTimeout(()=>setToast(null),4000); };

  useEffect(() => {
    const ref  = params.get('reference')||params.get('trxref');
    const tier = params.get('tier')||params.get('plan');
    if(ref&&tier) verifyPayment(ref,tier);
  }, []);

  const verifyPayment = async (reference, tier) => {
    setVerifying(true);
    try {
      const headers = await authHeader();
      const res = await axios.post(`${API}/subscription/verify`, {reference,tier}, {headers});
      if(res.data.success){
        await refetch();
        showToast('success', `🎉 Welcome to BrandCasta ${tier}! Your subscription is active.`);
        window.history.replaceState({},'','/subscription');
      }
    } catch(e){ showToast('error', e.response?.data?.error||'Verification failed'); }
    finally{ setVerifying(false); }
  };

  const subscribe = async (plan) => {
    if(plan==='FREE') return;
    setPaying(true);
    try {
      const headers = await authHeader();
      const res = await axios.post(`${API}/subscription/initialize`, {tier:plan}, {headers});
      window.location.href = res.data.paymentUrl;
    } catch(e){ showToast('error', e.response?.data?.error||'Could not initialize payment'); }
    finally{ setPaying(false); }
  };

  const cancel = async () => {
    if(!window.confirm('Cancel your subscription? You keep access until the current period expires.')) return;
    setCancelling(true);
    try {
      const headers = await authHeader();
      await axios.post(`${API}/subscription/cancel`, {}, {headers});
      await refetch();
      showToast('success', 'Subscription cancelled');
    } catch(e){ showToast('error', e.response?.data?.error||'Could not cancel'); }
    finally{ setCancelling(false); }
  };

  const currentTier = subscription?.tier || 'FREE';
  const fmtDate = (d) => { try{ return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}); }catch{ return d; }};

  if(loading||verifying) return (
    <Layout title="Plans & Pricing">
      <PageTitle title="Plans & Pricing" description="Upgrade to Premium or Pro for advanced analytics and AI tools."/>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'40px 0', color:'var(--text-muted)' }}>
        <Spinner size={16}/>{verifying?'Activating your subscription…':'Loading…'}
      </div>
    </Layout>
  );

  return (
    <>
      <PageTitle title="Plans & Pricing" description="Upgrade to Premium or Pro for advanced analytics and AI tools."/>
      <Layout title="Plans & Pricing" subtitle="Start free, upgrade when you need more">
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        {/* Current plan banner */}
        {(isPremium||isPro) && subscription && (
          <div style={{ padding:'14px 18px', borderRadius:10, background:isPro?'rgba(245,158,11,0.07)':'var(--accent-soft)', border:`0.5px solid ${isPro?'rgba(245,158,11,0.25)':'var(--accent-border)'}`, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:10 }}>
            <div>
              <p style={{ fontWeight:600, fontSize:13, color:isPro?'#fcd34d':'var(--accent-light)' }}>
                {isPro?'◈ Pro Plan Active':'◈ Premium Plan Active'}
              </p>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                Expires {fmtDate(subscription.expiresAt)}
              </p>
            </div>
            <button onClick={cancel} disabled={cancelling} className="btn-secondary" style={{ fontSize:11 }}>
              {cancelling?<><Spinner size={11}/>Cancelling…</>:'Cancel Subscription'}
            </button>
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12, marginBottom:28 }}>
          {PLANS.map(plan => {
            const isCurrent = currentTier===plan.key||(plan.key==='FREE'&&!isPremium&&!isPro);
            const isPopular = plan.badge;
            return (
              <div key={plan.key} style={{
                padding:'18px 20px', borderRadius:10,
                background: isPopular&&plan.key==='PREMIUM' ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)',
                border: `${isPopular&&plan.key==='PREMIUM'?'1px':'0.5px'} solid ${plan.borderColor}`,
                position:'relative', display:'flex', flexDirection:'column',
              }}>
                {plan.badge && (
                  <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:9, fontWeight:600, padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap', letterSpacing:'0.05em' }}>
                    {plan.badge}
                  </div>
                )}
                <p style={{ fontSize:12, fontWeight:500, color:'var(--text-secondary)', marginBottom:4 }}>{plan.name}</p>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:26, color:plan.color, letterSpacing:'-0.5px', marginBottom:2 }}>{plan.price}</p>
                <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:14 }}>{plan.per}</p>

                <div style={{ flex:1, marginBottom:16 }}>
                  {plan.features.map(f => (
                    <p key={f} style={{ fontSize:11, color:'var(--text-secondary)', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:'#86efac', fontSize:10 }}>✓</span>{f}
                    </p>
                  ))}
                  {plan.missing.map(f => (
                    <p key={f} style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6, display:'flex', alignItems:'center', gap:6, opacity:0.45 }}>
                      <span style={{ fontSize:10 }}>✗</span>{f}
                    </p>
                  ))}
                </div>

                {isCurrent ? (
                  <div style={{ textAlign:'center', padding:'8px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', fontSize:11, color:'var(--text-muted)' }}>
                    Current plan
                  </div>
                ) : (
                  <button onClick={()=>subscribe(plan.key)} disabled={paying}
                    style={{ padding:'9px', borderRadius:8, fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', width:'100%',
                      background: plan.key==='PRO' ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'linear-gradient(135deg,#6366f1,#a855f7)',
                      color: 'white',
                    }}>
                    {paying?<><Spinner size={12}/>…</>:`Get ${plan.name} →`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <div className="page-card" style={{ padding:'18px 20px' }}>
          <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white', marginBottom:14 }}>Feature Comparison</p>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:'0.5px solid var(--border)' }}>
                <th style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Feature</th>
                {PLANS.map(p=><th key={p.key} style={{ padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:600, color:p.color }}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['Campaign dashboard',       true,  true,  true ],
                ['184+ media providers',     true,  true,  true ],
                ['Create campaigns',         true,  true,  true ],
                ['Campaign analytics',       false, true,  true ],
                ['Proof of performance',     false, true,  true ],
                ['Priority support',         false, true,  true ],
                ['AI brief generator',       false, false, true ],
                ['AI campaign insights',     false, false, true ],
                ['Dedicated account manager',false, false, true ],
              ].map(([feat,...vals])=>(
                <tr key={feat} style={{ borderBottom:'0.5px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding:'9px 10px', color:'var(--text-secondary)', fontSize:12 }}>{feat}</td>
                  {vals.map((v,i)=>(
                    <td key={i} style={{ padding:'9px 10px', textAlign:'center' }}>
                      {v ? <span style={{ color:'#86efac', fontSize:13 }}>✓</span> : <span style={{ color:'var(--text-muted)', opacity:0.35, fontSize:11 }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    </>
  );
}