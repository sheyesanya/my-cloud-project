import { useEffect, useState } from 'react';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { getBookings, getCampaigns } from '../services/api';
import { useSubscription } from '../context/SubscriptionContext';

const fmt  = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const pct  = (a, b) => b > 0 ? Math.round((a/b)*100) : 0;
const BAR_COLORS = ['#6366f1','#a855f7','#06b6d4','#14b8a6','#f59e0b','#ec4899'];

function MiniBar({ value, max, color='#6366f1', height=6 }) {
  return (
    <div style={{ height, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct(value,max)}%`, background:color, borderRadius:3, transition:'width 0.6s ease' }}/>
    </div>
  );
}

function StatCard({ label, value, sub, color='#a5b4fc', icon }) {
  return (
    <div style={{ padding:'18px 20px', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</p>
        {icon && <span style={{ fontSize:18 }}>{icon}</span>}
      </div>
      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:26, color, letterSpacing:'-0.5px', marginBottom:4 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [period, setPeriod]       = useState('ALL');
  const [insight, setInsight]     = useState(null);
  const [loadingInsight, setLI]   = useState(false);
  const { isPro } = useSubscription() || {};

  useEffect(() => {
    getBookings()
      .then(b => setBookings(Array.isArray(b) ? b : b.bookings ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filterByPeriod = (items) => {
    if (period === 'ALL') return items;
    const days = period === '7D' ? 7 : period === '30D' ? 30 : 90;
    const cutoff = new Date(Date.now() - days*24*60*60*1000);
    return items.filter(i => new Date(i.createdAt) >= cutoff);
  };

  const filtered = filterByPeriod(bookings);

  const totalSpend      = filtered.reduce((s, b) => s + (Number(b.finalPrice)||0), 0);
  const completedCount  = filtered.filter(b => b.status === 'COMPLETED').length;
  const activeCount     = filtered.filter(b => ['PAID','IN_PROGRESS'].includes(b.status)).length;
  const pendingCount    = filtered.filter(b => b.status === 'PENDING_DELIVERY_REVIEW').length;
  const totalBookings   = filtered.length;
  const deliveryRate    = pct(completedCount, totalBookings);
  const totalRuns       = filtered.reduce((s, b) => s + (Number(b.runs)||1), 0);

  const byCategory = {};
  filtered.forEach(b => {
    const cat = (b.category||'OTHER').replaceAll('_',' ');
    byCategory[cat] = (byCategory[cat]||0) + (Number(b.finalPrice)||0);
  });
  const catEntries = Object.entries(byCategory).sort((a,b) => b[1]-a[1]);
  const maxCat = catEntries[0]?.[1] || 1;

  const byProvider = {};
  filtered.forEach(b => { byProvider[b.target] = (byProvider[b.target]||0) + (Number(b.finalPrice)||0); });
  const topProviders = Object.entries(byProvider).sort((a,b) => b[1]-a[1]).slice(0,6);
  const maxProv = topProviders[0]?.[1] || 1;

  const getAIInsight = async () => {
    setLI(true); setInsight(null);
    try {
      const summary = { totalSpend, totalBookings, completedCount, activeCount, deliveryRate, topCategories: catEntries.slice(0,3).map(([k,v]) => `${k}: ${fmt(v)}`), topProviders: topProviders.slice(0,3).map(([k,v]) => `${k}: ${fmt(v)}`) };
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{ role:'user', content:`You are BrandCasta's campaign analyst. Based on this Nigerian advertiser's campaign data, provide 3-4 specific, actionable insights.\n\nData: ${JSON.stringify(summary)}\nPeriod: ${period === 'ALL' ? 'All time' : period}\n\nRespond with JSON only:\n{\n  "headline": "one sentence overall assessment",\n  "insights": [{ "title": "insight title", "body": "2-sentence insight", "type": "opportunity|warning|success|tip" }],\n  "recommendation": "single most important action to take next"\n}` }] }),
      });
      const data = await response.json();
      const text = data.content?.map(c=>c.text||'').join('').trim();
      setInsight(JSON.parse(text.replace(/```json|```/g,'').trim()));
    } catch(e) { console.error(e); }
    finally { setLI(false); }
  };

  const insightColors  = { opportunity:'rgba(99,102,241,0.1)', warning:'rgba(245,158,11,0.1)', success:'rgba(34,197,94,0.1)', tip:'rgba(6,182,212,0.1)' };
  const insightBorders = { opportunity:'rgba(99,102,241,0.25)', warning:'rgba(245,158,11,0.25)', success:'rgba(34,197,94,0.25)', tip:'rgba(6,182,212,0.25)' };
  const insightIcons   = { opportunity:'💡', warning:'⚠️', success:'✅', tip:'📌' };

  const STATUS_LABELS = { COMPLETED:'Completed', PAID:'Active', IN_PROGRESS:'In Progress', PENDING_DELIVERY_REVIEW:'Review', PENDING_PROVIDER_CONFIRMATION:'Pending', PAYMENT_PENDING:'Awaiting Payment', REJECTED:'Rejected' };
  const STATUS_COLORS = { COMPLETED:'#86efac', PAID:'#86efac', IN_PROGRESS:'#86efac', PENDING_DELIVERY_REVIEW:'#fcd34d', PENDING_PROVIDER_CONFIRMATION:'rgba(255,255,255,0.4)', PAYMENT_PENDING:'#fcd34d', REJECTED:'#fca5a5' };

  if (loading) return <Layout title="Analytics">
      <PageTitle title="Analytics" description="Track campaign performance, spend by category and top providers."/><div style={{ color:'var(--text-muted)', padding:40 }}><Spinner size={16}/></div></Layout>;

  return (
    <Layout title="Campaign Analytics" subtitle="Performance overview across all your campaigns">

      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8 }}>
          {[['ALL','All time'],['7D','Last 7 days'],['30D','Last 30 days'],['90D','Last 90 days']].map(([k,l]) => (
            <button key={k} onClick={() => setPeriod(k)} style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.15s', background: period===k ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: period===k ? '#a5b4fc' : 'var(--text-muted)', outline: period===k ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>{l}</button>
          ))}
        </div>
        {isPro && <button onClick={getAIInsight} disabled={loadingInsight || !filtered.length} className="btn-secondary" style={{ fontSize:12, padding:'7px 14px' }}>
          {loadingInsight ? <><Spinner size={12}/> Analysing…</> : '✨ AI Campaign Insights'}
        </button>}
        {!isPro && <div style={{ fontSize:11, color:'var(--text-muted)', padding:'7px 14px', borderRadius:9, border:'1px solid var(--border)' }}>🔒 AI Insights — Pro only</div>}
      </div>

      {insight && (
        <div style={{ padding:'18px 20px', borderRadius:14, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.2)', marginBottom:20 }}>
          <p style={{ fontWeight:700, fontSize:14, color:'white', marginBottom:12 }}>✨ {insight.headline}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10, marginBottom:12 }}>
            {insight.insights?.map((ins, i) => (
              <div key={i} style={{ padding:'12px 14px', borderRadius:10, background: insightColors[ins.type]||'rgba(255,255,255,0.04)', border:`1px solid ${insightBorders[ins.type]||'rgba(255,255,255,0.08)'}` }}>
                <p style={{ fontWeight:700, fontSize:13, color:'white', marginBottom:4 }}>{insightIcons[ins.type]||'💡'} {ins.title}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>{ins.body}</p>
              </div>
            ))}
          </div>
          <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', lineHeight:1.6 }}>🎯 <strong style={{color:'white'}}>Next step:</strong> {insight.recommendation}</p>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <StatCard label="Total Spend"       value={fmt(totalSpend)}           sub={`${totalBookings} booking${totalBookings!==1?'s':''}`} color='#a5b4fc' icon='💰'/>
        <StatCard label="Active Campaigns"  value={activeCount}                sub={`${pendingCount} awaiting review`}                   color='#86efac' icon='📡'/>
        <StatCard label="Delivery Rate"     value={`${deliveryRate}%`}         sub={`${completedCount} completed`}                       color='#fcd34d' icon='✅'/>
        <StatCard label="Total Runs"        value={totalRuns.toLocaleString()} sub="broadcast placements"                                color='#5eead4' icon='📊'/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ padding:'20px', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 }}>Spend by Media Category</p>
          {catEntries.length === 0 ? <p style={{ fontSize:13, color:'var(--text-muted)' }}>No data yet</p> : (
            <div className="space-y-3">
              {catEntries.map(([cat, val], i) => (
                <div key={cat}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <p style={{ fontSize:13, color:'white', fontWeight:600 }}>{cat}</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)' }}>{fmt(val)} · {pct(val,totalSpend)}%</p>
                  </div>
                  <MiniBar value={val} max={maxCat} color={BAR_COLORS[i%BAR_COLORS.length]} height={7}/>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding:'20px', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 }}>Top Media Providers</p>
          {topProviders.length === 0 ? <p style={{ fontSize:13, color:'var(--text-muted)' }}>No data yet</p> : (
            <div className="space-y-3">
              {topProviders.map(([prov, val], i) => (
                <div key={prov}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:18, height:18, borderRadius:'50%', background:`${BAR_COLORS[i%BAR_COLORS.length]}22`, color: BAR_COLORS[i%BAR_COLORS.length], fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</span>
                      <p style={{ fontSize:13, color:'white', fontWeight:600 }}>{prov}</p>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-muted)' }}>{fmt(val)}</p>
                  </div>
                  <MiniBar value={val} max={maxProv} color={BAR_COLORS[i%BAR_COLORS.length]} height={6}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:'20px', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 }}>Recent Bookings</p>
        {filtered.length === 0 ? <p style={{ fontSize:13, color:'var(--text-muted)', padding:'12px 0' }}>No bookings in this period.</p> : (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:12, padding:'0 0 8px', borderBottom:'1px solid var(--border)', marginBottom:8 }}>
              {['Provider','Category','Status','Value'].map(h => <p key={h} style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</p>)}
            </div>
            {filtered.slice(0,10).map(b => (
              <div key={b.bookingId} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:13, color:'white', fontWeight:600 }}>{b.target}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{b.date||'—'}</p>
                </div>
                <p style={{ fontSize:12, color:'var(--text-muted)' }}>{(b.category||'—').replaceAll('_',' ')}</p>
                <p style={{ fontSize:12, fontWeight:600, color: STATUS_COLORS[b.status]||'var(--text-muted)' }}>{STATUS_LABELS[b.status]||b.status}</p>
                <p style={{ fontSize:13, fontWeight:700, color:'#a5b4fc' }}>{fmt(b.finalPrice)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}