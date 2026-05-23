import { useState } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const MUSIC_EMAIL = 'brandcastang@gmail.com';

const submitMusicBooking = async ({ service, packageName, price, artistName, trackTitle, releaseDate, notes, userEmail }) => {
  const token = await auth.currentUser?.getIdToken();
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  return axios.post(`${API}/music-booking`, {
    service, packageName, price, artistName, trackTitle, releaseDate, notes,
    contactEmail: userEmail || auth.currentUser?.email,
    routeTo: MUSIC_EMAIL,
  }, { headers });
};

const TABS = ['Social Media Advertising', 'Music Promotion'];

const PLATFORMS = [
  {
    id: 'meta', name: 'Meta Ads', sub: 'Facebook & Instagram',
    color: '#1877f2', bg: 'rgba(24,119,242,0.08)', border: 'rgba(24,119,242,0.2)',
    formats: ['Feed Image/Video', 'Stories & Reels', 'Carousel', 'Lead Gen Forms', 'Retargeting'],
    minBudget: '₦200,000', reach: '35M+ Nigerians',
  },
  {
    id: 'tiktok', name: 'TikTok Ads', sub: 'Short-form video',
    color: '#ff0050', bg: 'rgba(255,0,80,0.07)', border: 'rgba(255,0,80,0.2)',
    formats: ['In-Feed Video', 'TopView', 'Branded Hashtag', 'Spark Ads', 'Collection Ads'],
    minBudget: '₦300,000', reach: '12M+ Nigerians',
  },
  {
    id: 'google', name: 'Google Ads', sub: 'Search, Display & YouTube',
    color: '#4285f4', bg: 'rgba(66,133,244,0.07)', border: 'rgba(66,133,244,0.2)',
    formats: ['Search Ads', 'Display Network', 'YouTube Pre-roll', 'Performance Max', 'Shopping Ads'],
    minBudget: '₦400,000', reach: '20M+ daily searches',
  },
  {
    id: 'x', name: 'X (Twitter) Ads', sub: 'Conversation & trends',
    color: '#e7e7e7', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)',
    formats: ['Promoted Posts', 'Trend Takeover', 'Follower Campaigns', 'Video Ads'],
    minBudget: '₦200,000', reach: '5M+ Nigerian users',
  },
  {
    id: 'linkedin', name: 'LinkedIn Ads', sub: 'B2B & professionals',
    color: '#0a66c2', bg: 'rgba(10,102,194,0.08)', border: 'rgba(10,102,194,0.2)',
    formats: ['Sponsored Content', 'Message Ads', 'Lead Gen Forms', 'Dynamic Ads'],
    minBudget: '₦600,000', reach: '8M+ professionals',
  },
  {
    id: 'youtube', name: 'YouTube Ads', sub: 'Video advertising',
    color: '#ff0000', bg: 'rgba(255,0,0,0.07)', border: 'rgba(255,0,0,0.2)',
    formats: ['Skippable In-Stream', 'Non-Skippable', 'Bumper Ads', 'Discovery Ads'],
    minBudget: '₦300,000', reach: '18M+ Nigerian viewers',
  },
];

const FUNNEL_STAGES = [
  {
    stage: 'Awareness', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',
    desc: 'Reach new audiences who have never heard of your brand.',
    tactics: ['Video views campaigns', 'Reach & frequency buying', 'Branded content', 'Influencer seeding'],
    platforms: ['Meta', 'TikTok', 'YouTube', 'X'],
    kpi: 'Reach, Impressions, View Rate',
  },
  {
    stage: 'Consideration', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)',
    desc: 'Engage people who know your brand and drive them to learn more.',
    tactics: ['Traffic campaigns', 'Engagement campaigns', 'Retargeting warm audiences', 'Lead generation'],
    platforms: ['Meta', 'Google', 'LinkedIn', 'X'],
    kpi: 'CTR, Engagement Rate, Time on Site',
  },
  {
    stage: 'Conversion', color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.15)',
    desc: 'Turn interested prospects into paying customers.',
    tactics: ['Conversion campaigns', 'Dynamic retargeting', 'Cart abandonment ads', 'Lookalike audiences'],
    platforms: ['Meta', 'Google', 'TikTok'],
    kpi: 'CPA, ROAS, Conversion Rate',
  },
  {
    stage: 'Retention', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
    desc: 'Keep existing customers engaged and drive repeat purchase.',
    tactics: ['Customer list targeting', 'Loyalty campaigns', 'Cross-sell & upsell', 'Win-back sequences'],
    platforms: ['Meta', 'Google', 'Email'],
    kpi: 'LTV, Repeat Purchase Rate, Churn',
  },
];

const AD_PACKAGES = [
  {
    name: 'Starter', color: '#a5b4fc', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',
    budget: '₦1,000k – ₦2M/month', platforms: '1–2 platforms',
    features: ['Campaign setup & management', 'Ad creative brief', 'Weekly performance report', 'Basic audience targeting'],
    best: 'Small brands launching social ads for the first time',
  },
  {
    name: 'Growth', color: '#5eead4', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.2)',
    budget: '₦2M – ₦10M/month', platforms: '2–3 platforms',
    features: ['Full funnel campaign strategy', 'Creative production support', 'A/B testing', 'Bi-weekly strategy call', 'Retargeting setup'],
    best: 'Growing brands scaling paid social', recommended: true,
  },
  {
    name: 'Enterprise', color: '#fcd34d', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
    budget: '₦10M+/month', platforms: 'All platforms',
    features: ['Multi-channel funnel architecture', 'Dedicated campaign manager', 'Creative studio access', 'Daily optimisation', 'Custom dashboards & reporting'],
    best: 'Large brands running always-on campaigns',
  },
];

const MUSIC_SERVICES = [
  {
    id: 'press',
    name: 'Press Release & Editorial',
    color: '#a5b4fc',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.2)',
    desc: 'Official press releases distributed to top Nigerian and pan-African music media, entertainment journalists and blogs.',
    deliverables: [
      'Professionally written press release',
      'Distribution to 50+ Nigerian media contacts',
      'Music blogs: BellaNaija Music, NotJustOk, Jaguda, TooXclusive',
      'Entertainment desks: Punch, Guardian, Vanguard, ThisDay',
      'Radio PR: Station music directors and OAPs',
      'Follow-up pitching and placement confirmation',
    ],
    packages: [
      { name: 'Basic', price: '₦300,000', desc: '1 press release · 20 outlets' },
      { name: 'Standard', price: '₦700,000', desc: '2 press releases · 50 outlets · editorial feature' },
      { name: 'Premium', price: '₦1,500,000', desc: '3 press releases · 80+ outlets · interview placement' },
    ],
  },
  {
    id: 'media-rounds',
    name: 'Media & Radio Rounds',
    color: '#5eead4',
    bg: 'rgba(20,184,166,0.08)',
    border: 'rgba(20,184,166,0.15)',
    desc: 'Coordinated radio and TV appearances, interviews and features to introduce or promote a release across Nigeria\'s biggest platforms.',
    deliverables: [
      'Radio station bookings (Cool FM, Wazobia FM, Beat FM, Classic FM)',
      'Live and recorded interview coordination',
      'TV music show appearances (HIP TV, Soundcity TV, Trace Naija)',
      'Podcast guest placements',
      'Pre-interview briefing and talking points',
      'Post-appearance content capture and clips',
    ],
    packages: [
      { name: 'Lagos Circuit', price: '₦1,000,000', desc: '5 Lagos stations · 2 TV appearances' },
      { name: 'National Tour', price: '₦2,400,000', desc: '10 stations nationwide · 4 TV shows · 2 podcasts' },
      { name: 'Full Rollout', price: '₦5,000,000', desc: '20+ stations · 6 TV · 5 podcasts · editorial' },
    ],
  },
  {
    id: 'amplification',
    name: 'Song Amplification',
    color: '#fcd34d',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    desc: 'Digital and social amplification to drive streams, playlist adds, video views and trending status for a new or existing release.',
    deliverables: [
      'Paid social campaigns (TikTok, Instagram, YouTube)',
      'TikTok Spark Ads and organic seeding',
      'YouTube music video promotion',
      'Playlist pitching (Audiomack, Boomplay, Spotify Nigeria)',
      'Influencer and content creator seeding',
      'Digital radio: Audiomack, Apple Music editorial pitching',
    ],
    packages: [
      { name: 'Spark', price: '₦600,000', desc: 'TikTok + Instagram · 2-week push' },
      { name: 'Amplify', price: '₦1,500,000', desc: 'All platforms · playlist pitching · 4-week campaign' },
      { name: 'Chart Push', price: '₦4,000,000', desc: 'Full digital rollout · influencer seeding · chart strategy' },
    ],
  },
  {
    id: 'full-rollout',
    name: 'Full Artist Campaign',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.07)',
    border: 'rgba(244,114,182,0.2)',
    desc: 'An end-to-end music marketing campaign covering press, radio rounds, social amplification and brand deals — from release day to chart.',
    deliverables: [
      'Release strategy and timeline',
      'Press release + editorial campaign',
      'National radio and TV rounds',
      'Social media paid amplification',
      'TikTok and Instagram creator seeding',
      'Brand partnership outreach',
      'Weekly performance reporting',
    ],
    packages: [
      { name: 'Single Campaign', price: '₦3,000,000', desc: '4-week single rollout · all channels' },
      { name: 'EP Campaign',     price: '₦7,000,000', desc: '8-week EP rollout · press + media + digital' },
      { name: 'Album Campaign',  price: '₦15,000,000', desc: '12-week album rollout · full team · chart strategy' },
    ],
  },
];

export default function SocialMediaMarketing() {
  const [tab, setTab]                 = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [activePlatform, setActivePlat] = useState(null);
  const [activeMusic, setActiveMusic]   = useState('press');
  const [booking, setBooking]           = useState(null); // { serviceId, packageName, price }
  const [form, setForm]                 = useState({ artistName:'', trackTitle:'', releaseDate:'', notes:'' });
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [bookingError, setBookingError] = useState('');

  const openBooking = (serviceId, packageName, price) => {
    setBooking({ serviceId, packageName, price });
    setForm({ artistName:'', trackTitle:'', releaseDate:'', notes:'' });
    setSubmitted(false);
    setBookingError('');
  };

  const submitBooking = async () => {
    if (!form.artistName.trim()) { setBookingError('Artist name is required'); return; }
    setSubmitting(true); setBookingError('');
    try {
      await submitMusicBooking({
        service:     activeService?.name,
        packageName: booking.packageName,
        price:       booking.price,
        artistName:  form.artistName,
        trackTitle:  form.trackTitle,
        releaseDate: form.releaseDate,
        notes:       form.notes,
        userEmail:   auth.currentUser?.email,
      });
      setSubmitted(true);
    } catch(e) {
      setBookingError(e.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inpStyle = { width:'100%', padding:'9px 12px', borderRadius:8, fontSize:12, outline:'none', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'white', fontFamily:'Manrope,sans-serif', boxSizing:'border-box' };

  const activeService = MUSIC_SERVICES.find(s => s.id === activeMusic);

  return (
    <Layout title="Social-Media Marketing" subtitle="Paid social advertising, full-funnel strategy and music promotion">

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', borderRadius:12, padding:4, marginBottom:28, border:'1px solid var(--border)', width:'fit-content' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            style={{ padding:'9px 20px', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Manrope,sans-serif', transition:'all 0.15s', border:'none',
              background: tab===i ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent',
              color:       tab===i ? 'white' : 'var(--text-muted)',
            }}>{t}</button>
        ))}
      </div>

      {/* ── TAB 1: SOCIAL MEDIA ADVERTISING ── */}
      {tab === 0 && (
        <div>
          {/* Hero */}
          <div style={{ padding:'22px 26px', borderRadius:14, background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.07))', border:'1px solid rgba(99,102,241,0.22)', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:17, color:'white', marginBottom:6, letterSpacing:'-0.3px' }}>Full-funnel digital advertising, managed by BrandCasta</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.7, maxWidth:540 }}>
                We plan, launch and optimise your paid social campaigns across Meta, TikTok, Google, X, LinkedIn and YouTube.
              </p>
            </div>
            <Link to="/create-booking" style={{ padding:'11px 22px', borderRadius:11, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontWeight:700, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
              Get a Quote →
            </Link>
          </div>

          {/* Platforms */}
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Platforms We Manage</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
            {PLATFORMS.map(p => (
              <div key={p.id} onClick={() => setActivePlat(activePlatform===p.id ? null : p.id)}
                style={{ padding:'16px 18px', borderRadius:12, background: activePlatform===p.id ? p.bg : 'rgba(255,255,255,0.02)', border: activePlatform===p.id ? `1px solid ${p.border}` : '1px solid var(--border)', cursor:'pointer', transition:'all 0.15s' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: activePlatform===p.id ? 12 : 0 }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:13, color:'white', marginBottom:2 }}>{p.name}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{p.sub}</p>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, color:p.color, padding:'2px 8px', borderRadius:20, background:p.bg, border:`1px solid ${p.border}`, flexShrink:0, marginLeft:8 }}>{p.reach}</span>
                </div>
                {activePlatform===p.id && (
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Ad Formats</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                      {p.formats.map(f => <span key={f} style={{ padding:'3px 9px', borderRadius:20, fontSize:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.65)' }}>{f}</span>)}
                    </div>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>Min. budget: <span style={{ color:'white', fontWeight:600 }}>{p.minBudget}</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Funnel */}
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>The Marketing Funnel</p>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            {FUNNEL_STAGES.map((s, i) => (
              <button key={s.stage} onClick={() => setActiveStage(i)}
                style={{ padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s', border:'none',
                  background: activeStage===i ? s.bg : 'rgba(255,255,255,0.04)',
                  color:       activeStage===i ? s.color : 'var(--text-muted)',
                  outline:     activeStage===i ? `1px solid ${s.border}` : '1px solid rgba(255,255,255,0.08)',
                }}>{s.stage}</button>
            ))}
          </div>
          {(() => {
            const s = FUNNEL_STAGES[activeStage];
            return (
              <div style={{ padding:'20px 22px', borderRadius:14, background:s.bg, border:`1px solid ${s.border}`, marginBottom:28 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:15, color:'white', marginBottom:8 }}>{s.stage}</p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:14 }}>{s.desc}</p>
                    <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Key Tactics</p>
                    {s.tactics.map(t => (
                      <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <span style={{ width:5, height:5, borderRadius:'50%', background:s.color, flexShrink:0 }}/>
                        <span style={{ fontSize:12, color:'rgba(255,255,255,0.65)' }}>{t}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Best Platforms</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
                      {s.platforms.map(pl => <span key={pl} style={{ padding:'4px 10px', borderRadius:8, fontSize:12, fontWeight:600, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'white' }}>{pl}</span>)}
                    </div>
                    <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Primary KPIs</p>
                    <p style={{ fontSize:13, color:s.color, fontWeight:600 }}>{s.kpi}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Packages */}
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Service Packages</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
            {AD_PACKAGES.map(pkg => (
              <div key={pkg.name} style={{ padding:'20px', borderRadius:14, background: pkg.recommended ? pkg.bg : 'rgba(255,255,255,0.02)', border:`1px solid ${pkg.recommended ? pkg.border : 'rgba(255,255,255,0.07)'}`, position:'relative' }}>
                {pkg.recommended && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', padding:'3px 12px', borderRadius:20, background:'linear-gradient(135deg,#14b8a6,#06b6d4)', fontSize:10, fontWeight:700, color:'white', whiteSpace:'nowrap' }}>MOST POPULAR</div>}
                <p style={{ fontWeight:800, fontSize:15, color:pkg.color, marginBottom:4 }}>{pkg.name}</p>
                <p style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:2 }}>{pkg.budget}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12 }}>{pkg.platforms}</p>
                {pkg.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:7 }}>
                    <span style={{ width:15, height:15, borderRadius:'50%', background:`${pkg.color}22`, color:pkg.color, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>✓</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.5 }}>{f}</span>
                  </div>
                ))}
                <p style={{ fontSize:11, color:'var(--text-muted)', fontStyle:'italic', lineHeight:1.5, marginTop:10 }}>Best for: {pkg.best}</p>
                <Link to="/create-booking" style={{ display:'block', marginTop:14, padding:'10px', borderRadius:9, textAlign:'center', fontWeight:700, fontSize:13, textDecoration:'none', background: pkg.recommended ? 'linear-gradient(135deg,#14b8a6,#06b6d4)' : 'rgba(255,255,255,0.06)', color: pkg.recommended ? 'white' : 'rgba(255,255,255,0.7)', border: pkg.recommended ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                  Get Started →
                </Link>
              </div>
            ))}
          </div>

          <div style={{ padding:'20px 22px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
            <div>
              <p style={{ fontWeight:700, fontSize:14, color:'white', marginBottom:4 }}>Ready to launch your social campaign?</p>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>Our team will build a custom strategy for your brand and budget.</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Link to="/brief-generator" style={{ padding:'10px 18px', borderRadius:9, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', color:'#a5b4fc', fontWeight:600, fontSize:13, textDecoration:'none' }}>Generate Brief</Link>
              <Link to="/create-booking" style={{ padding:'10px 18px', borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontWeight:700, fontSize:13, textDecoration:'none' }}>Start Campaign →</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MUSIC PROMOTION ── */}
      {tab === 1 && (
        <div>
          {/* Hero */}
          <div style={{ padding:'22px 26px', borderRadius:14, background:'linear-gradient(135deg,rgba(244,114,182,0.1),rgba(168,85,247,0.07))', border:'1px solid rgba(244,114,182,0.2)', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:17, color:'white', marginBottom:6, letterSpacing:'-0.3px' }}>Artist & Music Promotion — Nigeria & Pan-Africa</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.7, maxWidth:540 }}>
                Press releases, radio & TV rounds, digital amplification and full artist campaigns — everything an artist needs to break a record.
              </p>
            </div>
            <Link to="/create-booking" style={{ padding:'11px 22px', borderRadius:11, background:'linear-gradient(135deg,#f472b6,#a855f7)', color:'white', fontWeight:700, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
              Promote an Artist →
            </Link>
          </div>

          {/* Service selector */}
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Services</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:22 }}>
            {MUSIC_SERVICES.map(s => (
              <button key={s.id} onClick={() => setActiveMusic(s.id)}
                style={{ padding:'14px 16px', borderRadius:12, textAlign:'left', cursor:'pointer', transition:'all 0.15s', border:'none', fontFamily:'Manrope,sans-serif',
                  background: activeMusic===s.id ? s.bg : 'rgba(255,255,255,0.02)',
                  outline:    activeMusic===s.id ? `1px solid ${s.border}` : '1px solid rgba(255,255,255,0.07)',
                }}>
                <p style={{ fontWeight:700, fontSize:13, color: activeMusic===s.id ? s.color : 'white', marginBottom:4 }}>{s.name}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5 }}>{s.desc.slice(0,55)}…</p>
              </button>
            ))}
          </div>

          {/* Active service detail */}
          {activeService && (
            <div style={{ padding:'22px 24px', borderRadius:14, background: activeService.bg, border:`1px solid ${activeService.border}`, marginBottom:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28 }}>
                <div>
                  <p style={{ fontWeight:800, fontSize:17, color:'white', marginBottom:8, letterSpacing:'-0.3px' }}>{activeService.name}</p>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.75, marginBottom:18 }}>{activeService.desc}</p>
                  <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>What's Included</p>
                  {activeService.deliverables.map(d => (
                    <div key={d} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                      <span style={{ width:16, height:16, borderRadius:'50%', background:`${activeService.color}22`, color:activeService.color, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>✓</span>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>{d}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Packages & Pricing</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {activeService.packages.map((pkg, i) => (
                      <div key={pkg.name} style={{ padding:'16px 18px', borderRadius:12, background: i===1 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', border: i===1 ? `1px solid ${activeService.border}` : '1px solid rgba(255,255,255,0.06)', position:'relative' }}>
                        {i===1 && <div style={{ position:'absolute', top:-9, right:12, padding:'2px 10px', borderRadius:20, background:activeService.color, fontSize:9, fontWeight:700, color:'#0a0a0f', whiteSpace:'nowrap' }}>POPULAR</div>}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                          <p style={{ fontWeight:700, fontSize:14, color:'white' }}>{pkg.name}</p>
                          <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:16, color: activeService.color }}>{pkg.price}</p>
                        </div>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.5 }}>{pkg.desc}</p>
                        <button onClick={() => openBooking(activeService.id, pkg.name, pkg.price)} style={{ display:'block', width:'100%', marginTop:10, padding:'8px', borderRadius:8, textAlign:'center', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'Manrope,sans-serif', background:`${activeService.color}18`, color:activeService.color, border:`1px solid ${activeService.border}` }}>
                          Book this →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How it works for music */}
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>How Music Promotion Works</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
            {[
              { n:'01', title:'Submit your brief', desc:'Tell us about the artist, the release and your goals. Upload the track, visuals and bio.' },
              { n:'02', title:'Strategy session', desc:'Our team builds a tailored rollout plan covering media, digital and radio touchpoints.' },
              { n:'03', title:'Campaign launch', desc:'We execute — press releases go out, radio bookings are made, ads go live.' },
              { n:'04', title:'Report & optimise', desc:'Weekly reporting on streams, coverage, airplay and engagement. We adjust in real time.' },
            ].map(s => (
              <div key={s.n} style={{ padding:'16px 18px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'rgba(244,114,182,0.1)', border:'1px solid rgba(244,114,182,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <span style={{ fontWeight:800, fontSize:11, background:'linear-gradient(135deg,#f472b6,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{s.n}</span>
                </div>
                <p style={{ fontWeight:700, fontSize:13, color:'white', marginBottom:6 }}>{s.title}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.42)', lineHeight:1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ padding:'20px 22px', borderRadius:12, background:'rgba(244,114,182,0.06)', border:'1px solid rgba(244,114,182,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
            <div>
              <p style={{ fontWeight:700, fontSize:14, color:'white', marginBottom:4 }}>Ready to promote your music?</p>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>Submit a brief and our team will reach out with a custom campaign plan within 24 hours.</p>
            </div>
            <button onClick={() => openBooking('full-rollout', 'Custom', 'Custom quote')} style={{ padding:'11px 22px', borderRadius:10, background:'linear-gradient(135deg,#f472b6,#a855f7)', color:'white', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif', whiteSpace:'nowrap' }}>
              Promote an Artist →
            </button>
          </div>

          {/* Booking modal */}
          {booking && (
            <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
              onClick={e => { if (e.target === e.currentTarget) setBooking(null); }}>
              <div style={{ background:'#0f0f18', border:'1px solid rgba(244,114,182,0.25)', borderRadius:18, padding:28, width:'100%', maxWidth:480 }}>
                {submitted ? (
                  <div style={{ textAlign:'center', padding:'20px 0' }}>
                    <div style={{ fontSize:48, marginBottom:16 }}>🎵</div>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:20, color:'white', marginBottom:8 }}>Booking Received!</p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:20 }}>
                      Your music promotion request has been sent to the BrandCasta team. We'll reach out within 24 hours to confirm and get started.
                    </p>
                    <button onClick={() => setBooking(null)} style={{ padding:'10px 24px', borderRadius:10, background:'linear-gradient(135deg,#f472b6,#a855f7)', color:'white', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif' }}>
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
                      <div>
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:17, color:'white', marginBottom:4 }}>Book: {booking.packageName}</p>
                        <p style={{ fontSize:13, color:'#f472b6', fontWeight:700 }}>{booking.price}</p>
                      </div>
                      <button onClick={() => setBooking(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:20, padding:4 }}>✕</button>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Artist / Act Name *</label>
                        <input style={inpStyle} placeholder="e.g. Burna Boy, Asake, Tems" value={form.artistName} onChange={e => setForm(f => ({ ...f, artistName: e.target.value }))}/>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Track / Project Title</label>
                        <input style={inpStyle} placeholder="e.g. Love & Light (single)" value={form.trackTitle} onChange={e => setForm(f => ({ ...f, trackTitle: e.target.value }))}/>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Release / Start Date</label>
                        <input type="date" style={inpStyle} value={form.releaseDate} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))}/>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>Additional Notes</label>
                        <textarea rows={3} style={{ ...inpStyle, resize:'none' }} placeholder="Genre, target audience, streaming links, social handles, campaign goals..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}/>
                      </div>
                    </div>

                    {bookingError && <p style={{ color:'#fca5a5', fontSize:12, marginBottom:10 }}>{bookingError}</p>}

                    <button onClick={submitBooking} disabled={submitting}
                      style={{ width:'100%', padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#f472b6,#a855f7)', color:'white', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Manrope,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      {submitting ? 'Submitting…' : 'Submit Booking →'}
                    </button>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textAlign:'center', marginTop:10 }}>
                      Booking sent to the BrandCasta music team. We'll confirm within 24 hours.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}