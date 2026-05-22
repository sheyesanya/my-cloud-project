import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { Spinner } from './UI';

const PLAN_FEATURES = {
  PREMIUM: [
    { icon:'📊', label:'Campaign Analytics Dashboard' },
    { icon:'📋', label:'Proof of Performance Tracker' },
    { icon:'🎯', label:'Priority Support' },
    { icon:'👤', label:'Dedicated Account Manager' },
  ],
  PRO: [
    { icon:'✨', label:'Everything in Premium' },
    { icon:'🤖', label:'AI Campaign Brief Generator' },
    { icon:'💡', label:'AI Campaign Insights' },
    { icon:'⚡', label:'Full monthly access (31 days)' },
  ],
};

const PRICES = {
  PREMIUM: { amount:'₦25,000', period:'per 15 days' },
  PRO:     { amount:'₦45,000', period:'per month' },
};

export default function PremiumGate({ requiredTier = 'PREMIUM', children }) {
  const { loading, canAccess, tier, isActive, subscription } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, color:'var(--text-muted)', gap:10 }}>
        <Spinner size={16}/> Checking subscription…
      </div>
    );
  }

  if (canAccess(requiredTier)) return children;

  // Show upgrade wall
  const isExpired = subscription?.status === 'EXPIRED' || subscription?.status === 'CANCELLED';

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 0' }}>

      {/* Lock icon */}
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1))', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 16px' }}>
          {isExpired ? '⏰' : '🔒'}
        </div>
        <h2 style={{ fontFamily:'Manrope,sans-serif', fontSize:24, fontWeight:800, color:'white', letterSpacing:'-0.4px', marginBottom:8 }}>
          {isExpired ? 'Your subscription has expired' : `${requiredTier === 'PRO' ? 'Pro' : 'Premium'} feature`}
        </h2>
        <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
          {isExpired
            ? 'Renew your subscription to regain access to all premium features.'
            : 'Upgrade your BrandCasta plan to unlock this feature and supercharge your media campaigns.'}
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:28 }}>
        {(['PREMIUM', 'PRO']).map(plan => {
          const isHighlighted = plan === requiredTier;
          const price = PRICES[plan];
          return (
            <div key={plan} style={{
              padding:'22px', borderRadius:16,
              background: isHighlighted ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
              border: isHighlighted ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
              position:'relative',
            }}>
              {isHighlighted && (
                <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', padding:'3px 12px', borderRadius:20, background:'linear-gradient(135deg,#6366f1,#a855f7)', fontSize:10, fontWeight:700, color:'white', whiteSpace:'nowrap' }}>
                  RECOMMENDED
                </div>
              )}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:13, fontWeight:800, color: isHighlighted ? '#a5b4fc' : 'white', textTransform:'uppercase', letterSpacing:'0.06em' }}>{plan}</span>
                {plan === 'PREMIUM' && <span style={{ padding:'2px 8px', borderRadius:20, background:'rgba(245,158,11,0.15)', color:'#fcd34d', fontSize:10, fontWeight:700, border:'1px solid rgba(245,158,11,0.25)' }}>HALF MONTHLY</span>}
              </div>
              <div style={{ marginBottom:14 }}>
                <span style={{ fontFamily:'Manrope,sans-serif', fontSize:26, fontWeight:800, color:'white', letterSpacing:'-0.5px' }}>{price.amount}</span>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginLeft:4 }}>{price.period}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {PLAN_FEATURES[plan].map(f => (
                  <div key={f.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14 }}>{f.icon}</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.65)', fontWeight:500 }}>{f.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate(`/subscription?plan=${plan}`)}
                style={{
                  width:'100%', marginTop:16, padding:'11px', borderRadius:10, fontSize:13, fontWeight:700,
                  cursor:'pointer', fontFamily:'Manrope,sans-serif', border:'none', transition:'all 0.15s',
                  background: isHighlighted ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.06)',
                  color: isHighlighted ? 'white' : 'rgba(255,255,255,0.7)',
                  outline: isHighlighted ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>
                {isExpired ? `Renew ${plan}` : `Upgrade to ${plan}`} →
              </button>
            </div>
          );
        })}
      </div>

      {/* Free tier reminder */}
      <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>You're currently on the Free plan</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Dashboard, Media Inventory, Create Campaign and My Bookings are always free.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ fontSize:12, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif', flexShrink:0, marginLeft:12 }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}