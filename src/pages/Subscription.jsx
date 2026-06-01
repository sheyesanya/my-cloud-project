import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useSubscription } from '../context/SubscriptionContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`,'Content-Type':'application/json'}:{}; };

const PLANS = [
  {key:'FREE',    name:'Free',    price:'₦0',      per:'forever',    badge:null,          features:['Campaign dashboard','184+ media providers','Create & manage campaigns'],missing:['Analytics','AI brief generator','Campaign Assistant']},
  {key:'PREMIUM', name:'Premium', price:'₦25,000', per:'per 15 days',badge:'Most popular', features:['Everything in Free','Campaign analytics','Proof of performance','Priority support'],missing:['AI brief generator','AI insights']},
  {key:'PRO',     name:'Pro',     price:'₦45,000', per:'per month',  badge:'Full access',  features:['Everything in Premium','AI brief generator','AI campaign insights','Campaign Assistant','Dedicated account manager'],missing:[]},
];

export default function Subscription() {
  const [params]   = useSearchParams();
  const { subscription, loading, isPremium, isPro, refetch } = useSubscription();
  const [paying, setPaying]     = useState(false);
  const [verifying, setVerify]  = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (type,message) => { setToast({type,message}); setTimeout(()=>setToast(null),4000); };

  useEffect(()=>{
    const ref  = params.get('reference')||params.get('trxref');
    const tier = params.get('tier')||params.get('plan');
    if(ref&&tier) verifyPayment(ref,tier);
  },[]);

  const verifyPayment = async (reference, tier) => {
    setVerify(true);
    try {
      const hd = await h();
      const res = await axios.post(`${API}/subscription/verify`,{reference,tier},{headers:hd});
      if(res.data.success){ await refetch(); showToast('success',`🎉 Welcome to ${tier}! Your subscription is active.`); window.history.replaceState({},'','/subscription'); }
    } catch(e){ showToast('error',e.response?.data?.error||'Verification failed'); }
    finally{ setVerify(false); }
  };

  const subscribe = async plan => {
    if(plan==='FREE')return;
    setPaying(true);
    try { const hd=await h(); const res=await axios.post(`${API}/subscription/initialize`,{tier:plan},{headers:hd}); window.location.href=res.data.paymentUrl; }
    catch(e){ showToast('error',e.response?.data?.error||'Could not initialize payment'); }
    finally{ setPaying(false); }
  };

  const currentTier = subscription?.tier||'FREE';
  const fmtDate = d => { try{return new Date(d).toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'});}catch{return d;} };

  if(loading||verifying) return <Layout title="Plans & Pricing" subtitle="Subscription"><div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#777586',padding:'40px 0'}}>{verifying?'Activating your subscription…':'Loading…'}</div></Layout>;

  return (
    <Layout title="Plans & Pricing" subtitle="Subscription">
      {toast && (
        <div style={{padding:'12px 16px',background:toast.type==='success'?'#f0fdf4':'#fef2f2',border:`1px solid ${toast.type==='success'?'#bbf7d0':'#fecaca'}`,fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:toast.type==='success'?'#16a34a':'#dc2626',marginBottom:20}}>
          {toast.message}
        </div>
      )}

      {(isPremium||isPro)&&subscription&&(
        <div style={{padding:'14px 20px',background:'#eef2ff',border:'1px solid #c7d2fe',borderLeft:'3px solid #4338ca',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:3}}>{isPro?'Pro Plan Active':'Premium Plan Active'}</div>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#464554'}}>Expires {fmtDate(subscription.expiresAt)}</div>
          </div>
          <button onClick={async()=>{try{const hd=await h();await axios.post(`${API}/subscription/cancel`,{},{headers:hd});await refetch();showToast('success','Subscription cancelled');}catch(e){showToast('error',e.message);}}}
            style={{padding:'7px 14px',border:'1px solid #c7d2fe',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',color:'#4338ca',background:'transparent',cursor:'pointer'}}>
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Plan cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:1,background:'#e1e4f0',marginBottom:32}}>
        {PLANS.map(plan=>{
          const isCurrent = currentTier===plan.key||(plan.key==='FREE'&&!isPremium&&!isPro);
          return (
            <div key={plan.key} style={{padding:24,background:'white',display:'flex',flexDirection:'column',borderTop:`3px solid ${plan.key==='PRO'?'#0d9488':plan.key==='PREMIUM'?'#4338ca':'#e1e4f0'}`}}>
              {plan.badge&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:plan.key==='PRO'?'#0d9488':'#4338ca',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8}}>{plan.badge}</div>}
              <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:16,color:'#131b2e',marginBottom:3}}>{plan.name}</div>
              <div style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:28,color:plan.key==='PRO'?'#0d9488':plan.key==='PREMIUM'?'#4338ca':'#131b2e',letterSpacing:'-1px',lineHeight:1,marginBottom:3}}>{plan.price}</div>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginBottom:20}}>{plan.per}</div>
              <div style={{flex:1,marginBottom:20}}>
                {plan.features.map(f=>(
                  <div key={f} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:7,fontSize:12,color:'#131b2e'}}>
                    <span style={{color:plan.key==='PRO'?'#0d9488':'#4338ca',fontSize:11,flexShrink:0,marginTop:1}}>✓</span>{f}
                  </div>
                ))}
                {plan.missing.map(f=>(
                  <div key={f} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:7,fontSize:12,color:'#adb5bd'}}>
                    <span style={{fontSize:11,flexShrink:0}}>—</span>{f}
                  </div>
                ))}
              </div>
              {isCurrent?(
                <div style={{padding:10,textAlign:'center',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#464554',textTransform:'uppercase',letterSpacing:'0.08em'}}>Current Plan</div>
              ):(
                <button onClick={()=>subscribe(plan.key)} disabled={paying}
                  style={{padding:10,border:'none',fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:11,cursor:'pointer',letterSpacing:'0.04em',textTransform:'uppercase',background:plan.key==='PRO'?'#0d9488':'#4338ca',color:'white'}}>
                  {paying?'…':`Get ${plan.name} →`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
