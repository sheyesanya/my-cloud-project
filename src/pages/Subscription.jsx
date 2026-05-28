import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { useSubscription } from '../context/SubscriptionContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const PLAN_DETAILS = {
  FREE: {
    name:'Free', color:'rgba(255,255,255,0.5)', bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.08)',
    features:['Campaign Dashboard','Media Inventory (184+ providers)','Create & Manage Campaigns','My Bookings'],
    notIncluded:['AI Brief Generator','Campaign Analytics','Proof of Performance','AI Insights'],
  },
  PREMIUM: {
    name:'Premium', color:'#a5b4fc', bg:'rgba(99,102,241,0.08)', border:'rgba(99,102,241,0.3)',
    amount:25000, period:'15 days', days:15,
    features:['Everything in Free','Campaign Analytics Dashboard','Proof of Performance Tracker','Priority Support','Dedicated Account Manager'],
    notIncluded:['AI Campaign Brief Generator','AI Campaign Insights'],
    tag:'HALF MONTHLY',
  },
  PRO: {
    name:'Pro', color:'#fcd34d', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.3)',
    amount:45000, period:'month', days:30,
    features:['Everything in Premium','AI Campaign Brief Generator','AI Campaign Insights'],
    notIncluded:[],
  },
};

function fmt(n) { return `₦${Number(n||0).toLocaleString('en-NG')}`; }

export default function Subscription() {
  const [params]                    = useSearchParams();
  const navigate                    = useNavigate();
  const { subscription, loading, isPremium, refetch } = useSubscription();

  const [selectedPlan, setSelected] = useState(params.get('plan') || 'PREMIUM');
  const [paying, setPaying]         = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast]           = useState(null);
  const [verifying, setVerifying]   = useState(false);

  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  // Handle callback from Paystack
  useEffect(() => {
    const ref  = params.get('reference') || params.get('trxref');
    const tier = params.get('tier') || params.get('plan') || selectedPlan;
    if (ref && tier) verifyPayment(ref, tier);
  }, []);

  const verifyPayment = async (reference, tier) => {
    setVerifying(true);
    try {
      const headers = await authHeader();
      const res = await axios.post(`${API}/subscription/verify`, { reference, tier }, { headers: { ...headers, 'Content-Type':'application/json' } });
      if (res.data.success) {
        await refetch();
        showToast('success', `🎉 Welcome to BrandCasta ${tier}! Your subscription is now active.`);
        // Clean URL
        window.history.replaceState({}, '', '/subscription');
      }
    } catch(e) { showToast('error', e.response?.data?.error || 'Verification failed. Contact support.'); }
    finally { setVerifying(false); }
  };

  const subscribe = async (plan) => {
    if (plan === 'FREE') return;
    setPaying(true);
    try {
      const headers = await authHeader();
      const res = await axios.post(`${API}/subscription/initialize`, { tier: plan }, { headers: { ...headers, 'Content-Type':'application/json' } });
      window.location.href = res.data.paymentUrl;
    } catch(e) { showToast('error', e.response?.data?.error || 'Could not initialize payment.'); }
    finally { setPaying(false); }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel your subscription? You will keep access until your current period expires.')) return;
    setCancelling(true);
    try {
      const headers = await authHeader();
      await axios.post(`${API}/subscription/cancel`, {}, { headers });
      await refetch();
      showToast('success', `Subscription cancelled. Access continues until ${new Date(subscription.expiresAt).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}.`);
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setCancelling(false); }
  };

  const daysLeft = subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt) - new Date()) / (1000*60*60*24)))
    : 0;

  if (loading || verifying) {
    return (
      <Layout title="Subscription">
        <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--text-muted)', padding:40 }}>
          <Spinner size={16}/> {verifying ? 'Activating your subscription…' : 'Loading…'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Subscription & Plans" subtitle="Manage your BrandCasta subscription">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      {/* Current plan banner */}
      {isPremium && subscription && (
        <div style={{ padding:'18px 22px', borderRadius:14, background: subscription.tier==='PRO' ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)', border: subscription.tier==='PRO' ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(99,102,241,0.25)', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: subscription.tier==='PRO' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)', color: subscription.tier==='PRO' ? '#fcd34d' : '#a5b4fc' }}>{subscription.tier}</span>
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'rgba(34,197,94,0.1)', color:'#86efac', border:'1px solid rgba(34,197,94,0.2)' }}>ACTIVE</span>
            </div>
            <p style={{ fontSize:14, color:'white', fontWeight:600 }}>
              {daysLeft} day{daysLeft!==1?'s':''} remaining
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:400, marginLeft:8 }}>
                Expires {new Date(subscription.expiresAt).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}
              </span>
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => subscribe(subscription.tier === 'PRO' ? 'PRO' : 'PREMIUM')} disabled={paying} className="btn-primary" style={{ fontSize:12, padding:'8px 16px' }}>
              {paying ? <Spinner size={12}/> : '↻ Renew Now'}
            </button>
            <button onClick={cancel} disabled={cancelling} style={{ fontSize:12, padding:'8px 14px', borderRadius:9, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#fca5a5', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
              {cancelling ? <Spinner size={12}/> : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Plan comparison */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14, marginBottom:28 }}>
        {Object.entries(PLAN_DETAILS).map(([key, plan]) => {
          const isCurrentPlan = subscription?.tier === key && isPremium;
          const isSelected    = selectedPlan === key;
          const isFreeKey     = key === 'FREE';
          return (
            <div key={key} onClick={() => !isFreeKey && setSelected(key)}
              style={{
                padding:'24px', borderRadius:16, cursor: isFreeKey ? 'default' : 'pointer', transition:'all 0.15s', position:'relative',
                background: isSelected && !isFreeKey ? plan.bg : 'rgba(255,255,255,0.02)',
                border: isSelected && !isFreeKey ? `1px solid ${plan.border}` : '1px solid rgba(255,255,255,0.07)',
              }}>

              {isCurrentPlan && (
                <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', padding:'3px 12px', borderRadius:20, background:'linear-gradient(135deg,#22c55e,#16a34a)', fontSize:10, fontWeight:700, color:'white', whiteSpace:'nowrap' }}>
                  CURRENT PLAN
                </div>
              )}
              {plan.tag && (
                <div style={{ position:'absolute', top:-10, right:16, padding:'3px 10px', borderRadius:20, background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.3)', fontSize:10, fontWeight:700, color:'#fcd34d', whiteSpace:'nowrap' }}>
                  {plan.tag}
                </div>
              )}

              <p style={{ fontSize:11, fontWeight:700, color: isFreeKey ? 'rgba(255,255,255,0.4)' : plan.color, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>{plan.name}</p>

              {plan.amount ? (
                <div style={{ marginBottom:16 }}>
                  <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, color:'white', letterSpacing:'-0.5px' }}>₦{plan.amount.toLocaleString()}</span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginLeft:4 }}>/ {plan.period}</span>
                </div>
              ) : (
                <div style={{ marginBottom:16 }}>
                  <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, color:'rgba(255,255,255,0.6)' }}>Free</span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginLeft:4 }}>forever</span>
                </div>
              )}

              <div style={{ marginBottom:16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                    <span style={{ width:16, height:16, borderRadius:'50%', background:`${isFreeKey ? 'rgba(255,255,255,0.1)' : plan.bg}`, color: isFreeKey ? 'rgba(255,255,255,0.4)' : plan.color, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.65)' }}>{f}</span>
                  </div>
                ))}
                {plan.notIncluded?.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                    <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.2)', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>{f}</span>
                  </div>
                ))}
              </div>

              {isFreeKey ? (
                <div style={{ padding:'9px', borderRadius:9, background:'rgba(255,255,255,0.04)', textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>
                  Current Plan
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); subscribe(key); }} disabled={paying || isCurrentPlan}
                  style={{
                    width:'100%', padding:'11px', borderRadius:10, fontSize:13, fontWeight:700, cursor: isCurrentPlan ? 'default' : 'pointer',
                    fontFamily:'Manrope,sans-serif', border:'none', transition:'all 0.15s',
                    background: isCurrentPlan ? 'rgba(34,197,94,0.12)' : isSelected ? `linear-gradient(135deg, ${key==='PRO'?'#f59e0b,#d97706':'#6366f1,#a855f7'})` : 'rgba(255,255,255,0.06)',
                    color: isCurrentPlan ? '#86efac' : isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                    outline: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                  {paying && isSelected ? <Spinner size={13}/> : isCurrentPlan ? '✓ Active Plan' : `Subscribe to ${plan.name} →`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div style={{ padding:'22px', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:16 }}>Frequently Asked Questions</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
          {[
            ['What is the Pro plan?', 'Pro gives you the same features as Premium but on a 15-day billing cycle — ideal if you prefer shorter commitments or want to pay every half-month.'],
            ['Can I cancel anytime?', 'Yes. You can cancel at any time from this page. You will keep access until the end of your current paid period — no partial refunds.'],
            ['What happens when my plan expires?', 'Your account reverts to Free automatically. Your campaigns and data are preserved. You can resubscribe at any time.'],
            ['Is payment secure?', 'Yes — all payments are processed by Paystack, Nigeria\'s leading payment gateway. BrandCasta does not store your card details.'],
          ].map(([q, a]) => (
            <div key={q}>
              <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.8)', marginBottom:5 }}>{q}</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}