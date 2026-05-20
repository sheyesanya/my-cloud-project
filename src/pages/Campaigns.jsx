import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Spinner, LoadingBlock, ErrorBlock, EmptyBlock } from '../components/UI';
import { getCampaigns } from '../services/api';

const STATUS_COLORS = {
  PENDING:                      { bg:'rgba(245,158,11,0.1)',  text:'#fcd34d', border:'rgba(245,158,11,0.2)' },
  PENDING_PROVIDER_CONFIRMATION:{ bg:'rgba(245,158,11,0.1)',  text:'#fcd34d', border:'rgba(245,158,11,0.2)' },
  APPROVED:                     { bg:'rgba(99,102,241,0.12)', text:'#a5b4fc', border:'rgba(99,102,241,0.2)' },
  PAID:                         { bg:'rgba(20,184,166,0.1)',  text:'#5eead4', border:'rgba(20,184,166,0.2)' },
  IN_PROGRESS:                  { bg:'rgba(168,85,247,0.12)', text:'#d8b4fe', border:'rgba(168,85,247,0.2)' },
  COMPLETED:                    { bg:'rgba(34,197,94,0.1)',   text:'#86efac', border:'rgba(34,197,94,0.2)'  },
  REJECTED:                     { bg:'rgba(239,68,68,0.1)',   text:'#fca5a5', border:'rgba(239,68,68,0.2)'  },
};

const FILTERS = ['ALL','PENDING','APPROVED','PAID','IN_PROGRESS','COMPLETED','REJECTED'];

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('ALL');

  useEffect(() => {
    getCampaigns()
      .then((res) => setCampaigns(Array.isArray(res) ? res : res.campaigns ?? res.data ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? campaigns : campaigns.filter((c) => (c.status ?? '').toUpperCase() === filter);
  const totalSpend = campaigns.reduce((s, c) => s + (c.totalPrice || 0), 0);
  const active     = campaigns.filter((c) => ['APPROVED','PAID','IN_PROGRESS'].includes((c.status || '').toUpperCase())).length;
  const completed  = campaigns.filter((c) => (c.status || '').toUpperCase() === 'COMPLETED').length;
  const pending    = campaigns.filter((c) => (c.status || '').toUpperCase().includes('PENDING')).length;

  return (
    <Layout title="Campaigns" subtitle="Monitor and manage all campaigns">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Total',    value: campaigns.length, color:'rgba(99,102,241,0.12)',  text:'#a5b4fc' },
          { label:'Active',   value: active,            color:'rgba(168,85,247,0.12)', text:'#d8b4fe' },
          { label:'Pending',  value: pending,           color:'rgba(245,158,11,0.1)',  text:'#fcd34d' },
          { label:'Completed',value: completed,         color:'rgba(34,197,94,0.1)',   text:'#86efac' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.color, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>{s.label}</p>
            <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:26, color: s.text, letterSpacing:'-0.5px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Spend */}
      <div style={{ borderRadius:'var(--radius-lg)', padding:'20px 24px', background:'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(168,85,247,0.1))', border:'1px solid rgba(99,102,241,0.2)', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div>
          <p style={{ fontSize:11, color:'rgba(165,180,252,0.6)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700, marginBottom:4 }}>Total Campaign Spend</p>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:30, color:'white', letterSpacing:'-0.8px', lineHeight:1 }}>₦{Number(totalSpend).toLocaleString()}</p>
        </div>
        <p style={{ fontSize:12, color:'var(--text-muted)' }}>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
              background: filter === f ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              color:       filter === f ? '#a5b4fc' : 'var(--text-muted)',
              border:      filter === f ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
            }}
          >
            {f.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && <LoadingBlock message="Loading campaigns…"/>}
      {error   && <ErrorBlock message={error}/>}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0
            ? <EmptyBlock message={filter === 'ALL' ? 'No campaigns yet.' : `No ${filter.replaceAll('_',' ').toLowerCase()} campaigns.`}/>
            : filtered.map((c) => {
                const status = (c.status || 'PENDING').toUpperCase();
                const col    = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
                return (
                  <div
                    key={c.campaignId}
                    onClick={() => navigate(`/campaigns/${c.campaignId}`)}
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 22px', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background='var(--bg-card)'}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:17, color:'white', letterSpacing:'-0.3px' }}>{c.brandName}</p>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{c.contactEmail}</p>
                      </div>
                      <span style={{ padding:'5px 12px', borderRadius:20, background:col.bg, color:col.text, border:`1px solid ${col.border}`, fontSize:10, fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                        {status.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Total Spend</p>
                        <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20, color:'#86efac', letterSpacing:'-0.3px' }}>₦{Number(c.totalPrice).toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Items</p>
                        <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20, color:'var(--accent-light)' }}>{c.totalItems}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      )}
    </Layout>
  );
}