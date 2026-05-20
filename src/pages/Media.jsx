import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingBlock, ErrorBlock, EmptyBlock, Toast } from '../components/UI';
import { getMedia } from '../services/api';

const GRAD = [
  'linear-gradient(135deg,#6366f1,#a855f7)',
  'linear-gradient(135deg,#14b8a6,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#22c55e,#84cc16)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
  'linear-gradient(135deg,#6366f1,#06b6d4)',
];
const avatarGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

// Metrics by media name / category — shown instead of price
// In production these would come from the DB; here we seed sensible estimates
const METRICS = {
  // TELEVISION
  'Arise TV':                  { reach:'2.5M+ viewers',  platforms:['TV','YouTube','Facebook'],       impressions:'4M+/month'  },
  'Channels Television':       { reach:'5M+ viewers',    platforms:['TV','YouTube','Twitter'],        impressions:'10M+/month' },
  'TVC Communications':        { reach:'3M+ viewers',    platforms:['TV','YouTube'],                  impressions:'5M+/month'  },
  'ONTV':                      { reach:'1.5M+ viewers',  platforms:['TV','YouTube'],                  impressions:'2M+/month'  },
  'Soundcity TV':              { reach:'2M+ viewers',    platforms:['TV','YouTube','Instagram'],      impressions:'3.5M+/month'},
  'Spice TV':                  { reach:'1M+ viewers',    platforms:['TV','YouTube'],                  impressions:'1.5M+/month'},
  'Africa Magic Urban':        { reach:'8M+ viewers',    platforms:['TV','DStv','GOtv'],              impressions:'15M+/month' },
  'Africa Magic Family':       { reach:'6M+ viewers',    platforms:['TV','DStv','GOtv'],              impressions:'10M+/month' },
  'HIP TV':                    { reach:'2M+ viewers',    platforms:['TV','YouTube','Instagram'],      impressions:'4M+/month'  },
  'Silverbird TV':             { reach:'1.5M+ viewers',  platforms:['TV','YouTube'],                  impressions:'2M+/month'  },
  'EbonyLife TV':              { reach:'3M+ viewers',    platforms:['TV','DStv'],                     impressions:'5M+/month'  },
  'News Central':              { reach:'1M+ viewers',    platforms:['TV','YouTube'],                  impressions:'1.5M+/month'},
  'Lagos Television':          { reach:'2M+ viewers',    platforms:['TV'],                            impressions:'3M+/month'  },
  'Trace Naija':               { reach:'3M+ viewers',    platforms:['TV','DStv','GOtv'],              impressions:'5M+/month'  },
  'Wazobia Max':               { reach:'4M+ viewers',    platforms:['TV','YouTube'],                  impressions:'6M+/month'  },

  // RADIO
  'Cool FM':                   { reach:'5M+ listeners',  platforms:['Radio','Streaming','Instagram'], impressions:'8M+/month'  },
  'Wazobia FM':                { reach:'6M+ listeners',  platforms:['Radio','Streaming','Facebook'],  impressions:'10M+/month' },
  'Nigeria Info FM':           { reach:'3M+ listeners',  platforms:['Radio','Streaming'],             impressions:'4M+/month'  },
  'The Beat FM':               { reach:'4M+ listeners',  platforms:['Radio','Streaming','Instagram'], impressions:'7M+/month'  },
  'Classic FM':                { reach:'2M+ listeners',  platforms:['Radio','Streaming'],             impressions:'3M+/month'  },
  'Inspiration FM':            { reach:'1.5M+ listeners',platforms:['Radio','Streaming'],             impressions:'2M+/month'  },
  'Soundcity Radio':           { reach:'3M+ listeners',  platforms:['Radio','YouTube','Instagram'],   impressions:'5M+/month'  },
  'Brila FM':                  { reach:'2M+ listeners',  platforms:['Radio','Streaming','Twitter'],   impressions:'3M+/month'  },
  'Raypower FM':               { reach:'1.5M+ listeners',platforms:['Radio','Streaming'],             impressions:'2M+/month'  },
  'Smooth FM':                 { reach:'2.5M+ listeners',platforms:['Radio','Streaming','Instagram'], impressions:'4M+/month'  },
  'City FM':                   { reach:'1M+ listeners',  platforms:['Radio','Streaming'],             impressions:'1.5M+/month'},
  'Max FM':                    { reach:'1M+ listeners',  platforms:['Radio','Streaming'],             impressions:'1.5M+/month'},
  'Naija FM':                  { reach:'1.5M+ listeners',platforms:['Radio','Streaming'],             impressions:'2M+/month'  },
  'Urban96 FM':                { reach:'2M+ listeners',  platforms:['Radio','YouTube','Instagram'],   impressions:'3M+/month'  },

  // PODCASTS
  'I Said What I Said':        { reach:'500K+ listeners',platforms:['YouTube','Spotify','Apple Podcasts','TikTok'], impressions:'2M+/month' },
  'The Honest Bunch Podcast':  { reach:'800K+ listeners',platforms:['YouTube','Spotify','TikTok'],    impressions:'3M+/month'  },
  'Tea With Tay':              { reach:'300K+ listeners',platforms:['YouTube','Spotify','Instagram'],  impressions:'1M+/month'  },
  'Menisms':                   { reach:'250K+ listeners',platforms:['YouTube','Spotify'],             impressions:'800K+/month'},
  'WithChude':                 { reach:'400K+ listeners',platforms:['YouTube','Spotify','Apple'],     impressions:'1.5M+/month'},
  'Loose Talk Podcast':        { reach:'600K+ listeners',platforms:['YouTube','Spotify','Apple'],     impressions:'2M+/month'  },
  'Bahd and Boujee Podcast':   { reach:'350K+ listeners',platforms:['YouTube','TikTok','Instagram'],  impressions:'1.2M+/month'},

  // OOH
  'XL Billboards':             { reach:'2M+ eyeballs/day',  platforms:['Lagos','Abuja','PH'],         impressions:'60M+/month' },
  'Alliance Media':            { reach:'5M+ eyeballs/day',  platforms:['Nationwide','Airports'],       impressions:'150M+/month'},
  'Optimum Exposures':         { reach:'1.5M+ eyeballs/day',platforms:['Lagos','Abuja'],               impressions:'45M+/month' },
  'Loatsad Promomedia':        { reach:'1M+ eyeballs/day',  platforms:['Lagos','PH'],                  impressions:'30M+/month' },
  'JCDecaux Nigeria':          { reach:'3M+ eyeballs/day',  platforms:['Airports','Malls','Lagos'],    impressions:'90M+/month' },
  'Afromedia':                 { reach:'2M+ eyeballs/day',  platforms:['Lagos','Nationwide'],          impressions:'60M+/month' },

  // PRINT
  'Punch Newspapers':          { reach:'300K+ daily readers',platforms:['Print','Digital','Mobile'],   impressions:'1.5M+/month'},
  'The Guardian Nigeria':      { reach:'200K+ daily readers',platforms:['Print','Digital'],            impressions:'800K+/month'},
  'BusinessDay':               { reach:'150K+ daily readers',platforms:['Print','Digital','LinkedIn'],  impressions:'600K+/month'},
  'Vanguard Newspapers':       { reach:'250K+ daily readers',platforms:['Print','Digital'],            impressions:'1M+/month'  },
  'The Nation Newspaper':      { reach:'180K+ daily readers',platforms:['Print','Digital'],            impressions:'700K+/month'},

  // INFLUENCERS
  'Davido':                    { reach:'30M+ followers', platforms:['Instagram','Twitter','TikTok','YouTube'], impressions:'80M+/month' },
  'Broda Shaggi':              { reach:'5M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'15M+/month' },
  'Taaooma':                   { reach:'4M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'12M+/month' },
  'Mr Macaroni':               { reach:'6M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'18M+/month' },
  'Toke Makinwa':              { reach:'4M+ followers',  platforms:['Instagram','Twitter','YouTube','Podcast'], impressions:'10M+/month' },
};

const CAT_LABELS = {
  ALL:'All', TELEVISION:'TV', RADIO_AUDIO:'Radio', PODCASTS:'Podcasts',
  OUT_OF_HOME:'OOH', PRINT_MEDIA:'Print', INFLUENCERS:'Influencers',
};

const PLATFORM_COLORS = {
  'TV':'#6366f1','Radio':'#14b8a6','YouTube':'#ef4444','Instagram':'#ec4899',
  'TikTok':'#06b6d4','Twitter':'#38bdf8','Spotify':'#22c55e','Facebook':'#3b82f6',
  'DStv':'rgba(255,255,255,0.3)','GOtv':'rgba(255,255,255,0.3)','Streaming':'#8b5cf6',
  'Print':'#f59e0b','Digital':'#a855f7','LinkedIn':'#0ea5e9','Mobile':'#22d3ee',
  'Apple Podcasts':'#a855f7','Apple':'#a855f7','Podcast':'#a855f7',
  'Airports':'#fcd34d','Malls':'#fb923c','Lagos':'rgba(255,255,255,0.25)',
  'Abuja':'rgba(255,255,255,0.25)','PH':'rgba(255,255,255,0.25)',
  'Nationwide':'rgba(255,255,255,0.25)','Nationwide ':'rgba(255,255,255,0.25)',
};

export default function Media() {
  const [media, setMedia]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [toast, setToast]     = useState(null);
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('ALL');

  const fetchMedia = async () => {
    setLoading(true); setError('');
    try {
      const res = await getMedia();
      setMedia(Array.isArray(res) ? res : res.media ?? res.data ?? []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  useEffect(() => { fetchMedia(); }, []);

  const filtered = media.filter((m) => {
    const matchCat    = catFilter === 'ALL' || m.category === catFilter;
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <Layout
      title="Media Inventory"
      subtitle="Browse service providers across Nigeria's leading media platforms"
      actions={
        <button onClick={fetchMedia} className="btn-secondary" style={{ fontSize:12 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
          Refresh
        </button>
      }
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      {/* BrandCasta connector notice */}
      <div style={{ padding:'14px 18px', borderRadius:14, background:'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08))', border:'1px solid rgba(99,102,241,0.2)', marginBottom:20, display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:3 }}>BrandCasta connects you directly</p>
          <p style={{ fontSize:12, color:'rgba(165,180,252,0.75)', lineHeight:1.6 }}>
            All bookings are handled exclusively through BrandCasta. Provider contact details are kept confidential to ensure a smooth, protected campaign experience for both brands and media organisations. Pricing is provided upon campaign creation.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding:'10px 16px', borderRadius:10, background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.18)', marginBottom:20 }}>
        <p style={{ fontSize:12, color:'#fcd34d', lineHeight:1.5 }}>
          ⚠️ Audience metrics shown are real market estimates and are subject to change from service providers upon registration.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(CAT_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setCat(key)}
            style={{ padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
              background: catFilter === key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              color:       catFilter === key ? '#a5b4fc' : 'var(--text-muted)',
              border:      catFilter === key ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
            }}>{label}</button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search service providers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width:'100%', padding:'11px 16px', borderRadius:12, fontSize:13, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'white', marginBottom:16 }}
      />

      {/* Count */}
      <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>
        {filtered.length} service provider{filtered.length !== 1 ? 's' : ''}
        {catFilter !== 'ALL' ? ` in ${CAT_LABELS[catFilter]}` : ''}
      </p>

      {loading && <LoadingBlock message="Loading service providers…"/>}
      {error   && <ErrorBlock message={error} onRetry={fetchMedia}/>}
      {!loading && !error && filtered.length === 0 && <EmptyBlock message="No service providers found."/>}

      {/* Card grid */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {filtered.map((m, i) => {
            const metrics = METRICS[m.name] || {
              reach:       m.monthlyReach || 'Contact for details',
              platforms:   m.markets || [],
              impressions: 'Contact for details',
            };

            return (
              <div key={m.id ?? m._id ?? m.mediaId ?? i}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'20px', transition:'all 0.15s', cursor:'default' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor='var(--border)'}
              >
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:avatarGrad(m.name), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:16, fontWeight:700, flexShrink:0 }}>
                    {(m.name||'?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, color:'white', fontSize:14, lineHeight:1.2 }}>{m.name}</p>
                    {m.category && (
                      <span style={{ display:'inline-block', marginTop:4, padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)' }}>
                        {m.category.replaceAll('_',' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                  <div style={{ padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Reach</p>
                    <p style={{ fontSize:13, fontWeight:700, color:'#a5b4fc' }}>{metrics.reach}</p>
                  </div>
                  <div style={{ padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Impressions</p>
                    <p style={{ fontSize:13, fontWeight:700, color:'#86efac' }}>{metrics.impressions}</p>
                  </div>
                </div>

                {/* Platforms */}
                {metrics.platforms?.length > 0 && (
                  <div>
                    <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Platforms</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {metrics.platforms.map((p) => (
                        <span key={p} style={{
                          padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:600,
                          background: PLATFORM_COLORS[p] ? `${PLATFORM_COLORS[p]}22` : 'rgba(255,255,255,0.06)',
                          color:      PLATFORM_COLORS[p] || 'var(--text-muted)',
                          border:     `1px solid ${PLATFORM_COLORS[p] ? `${PLATFORM_COLORS[p]}40` : 'rgba(255,255,255,0.1)'}`,
                        }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book via BrandCasta CTA */}
                <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p style={{ fontSize:11, color:'var(--text-muted)' }}>Bookings via BrandCasta only</p>
                  <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:'#86efac' }}/>
                    <p style={{ fontSize:10, fontWeight:700, color:'#a5b4fc' }}>Available</p>
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