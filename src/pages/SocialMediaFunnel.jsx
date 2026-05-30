import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner } from '../components/UI';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const MUSIC_EMAIL = 'brandcastang@gmail.com';

const submitMusicBooking = async ({ service, packageName, price, artistName, trackTitle, releaseDate, notes, userEmail }) => {
  const token = await auth.currentUser?.getIdToken();
  const headers = token ? { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' };
  return axios.post(`${API}/music-booking`, { service, packageName, price, artistName, trackTitle, releaseDate, notes, contactEmail:userEmail||auth.currentUser?.email, routeTo:MUSIC_EMAIL }, { headers });
};

const TABS = ['Social Media Advertising', 'Music Promotion'];

const PLATFORMS = [
  { id:'meta',     name:'Meta Ads',        sub:'Facebook & Instagram',  color:'#1877f2', formats:['Feed Image/Video','Stories & Reels','Carousel','Lead Gen Forms','Retargeting'],          minBudget:'₦200,000', reach:'35M+ Nigerians' },
  { id:'tiktok',   name:'TikTok Ads',      sub:'Short-form video',      color:'#ff0050', formats:['In-Feed Video','TopView','Branded Hashtag','Spark Ads','Collection Ads'],                minBudget:'₦300,000', reach:'12M+ Nigerians' },
  { id:'google',   name:'Google Ads',      sub:'Search, Display & YouTube', color:'#4285f4', formats:['Search Ads','Display Network','YouTube Pre-roll','Performance Max'],                  minBudget:'₦400,000', reach:'20M+ daily searches' },
  { id:'x',        name:'X (Twitter) Ads', sub:'Conversation & trends', color:'#e7e7e7', formats:['Promoted Posts','Trend Takeover','Follower Campaigns','Video Ads'],                       minBudget:'₦200,000', reach:'5M+ Nigerian users' },
  { id:'linkedin', name:'LinkedIn Ads',    sub:'B2B & professionals',   color:'#0a66c2', formats:['Sponsored Content','Message Ads','Lead Gen Forms','Dynamic Ads'],                        minBudget:'₦600,000', reach:'8M+ professionals' },
  { id:'youtube',  name:'YouTube Ads',     sub:'Video advertising',     color:'#ff0000', formats:['Skippable In-Stream','Non-Skippable','Bumper Ads','Discovery Ads'],                      minBudget:'₦300,000', reach:'18M+ Nigerian viewers' },
];

const FUNNEL_STAGES = [
  { stage:'Awareness',     color:'var(--amber)', desc:'Reach new audiences who have never heard of your brand.',          tactics:['Video views campaigns','Reach & frequency buying','Branded content','Influencer seeding'],     platforms:['Meta','TikTok','YouTube','X'],    kpi:'Reach, Impressions, View Rate'     },
  { stage:'Consideration', color:'#5eead4',      desc:'Engage people who know your brand and drive them to learn more.',   tactics:['Traffic campaigns','Engagement campaigns','Retargeting warm audiences','Lead generation'], platforms:['Meta','Google','LinkedIn','X'],  kpi:'CTR, Engagement Rate, Time on Site'},
  { stage:'Conversion',    color:'#4ade80',      desc:'Turn interested prospects into paying customers.',                  tactics:['Conversion campaigns','Dynamic retargeting','Cart abandonment ads','Lookalike audiences'],  platforms:['Meta','Google','TikTok'],        kpi:'CPA, ROAS, Conversion Rate'        },
  { stage:'Retention',     color:'#d8b4fe',      desc:'Keep existing customers engaged and drive repeat purchase.',        tactics:['Customer list targeting','Loyalty campaigns','Cross-sell & upsell','Win-back sequences'],  platforms:['Meta','Google','Email'],         kpi:'LTV, Repeat Purchase Rate, Churn'  },
];

const AD_PACKAGES = [
  { name:'Starter',    budget:'₦1M – ₦2M/month',  platforms:'1–2 platforms', features:['Campaign setup & management','Ad creative brief','Weekly performance report','Basic audience targeting'],                                                         best:'Small brands launching social ads for the first time' },
  { name:'Growth',     budget:'₦2M – ₦10M/month', platforms:'2–3 platforms', features:['Full funnel campaign strategy','Creative production support','A/B testing','Bi-weekly strategy call','Retargeting setup'],                                        best:'Growing brands scaling paid social', recommended:true },
  { name:'Enterprise', budget:'₦10M+/month',        platforms:'All platforms', features:['Multi-channel funnel architecture','Dedicated campaign manager','Creative studio access','Daily optimisation','Custom dashboards & reporting'],                  best:'Large brands running always-on campaigns' },
];

const MUSIC_SERVICES = [
  { id:'press',        name:'Press Release & Editorial',  color:'var(--amber)', desc:'Official press releases distributed to top Nigerian and pan-African music media and entertainment journalists.', packages:[{name:'Basic',price:'₦300,000',desc:'1 press release · 20 outlets'},{name:'Standard',price:'₦700,000',desc:'2 press releases · 50 outlets · editorial feature'},{name:'Premium',price:'₦1,500,000',desc:'3 press releases · 80+ outlets · interview placement'}], deliverables:['Professionally written press release','Distribution to 50+ Nigerian media contacts','Music blogs: BellaNaija Music, NotJustOk, Jaguda, TooXclusive','Entertainment desks: Punch, Guardian, Vanguard','Radio PR: Station music directors and OAPs','Follow-up pitching and placement confirmation'] },
  { id:'media-rounds', name:'Media & Radio Rounds',       color:'#5eead4',      desc:'Coordinated radio and TV appearances, interviews and features across Nigeria\'s biggest platforms.', packages:[{name:'Lagos Circuit',price:'₦1,000,000',desc:'5 Lagos stations · 2 TV appearances'},{name:'National Tour',price:'₦2,400,000',desc:'10 stations nationwide · 4 TV shows · 2 podcasts'},{name:'Full Rollout',price:'₦5,000,000',desc:'20+ stations · 6 TV · 5 podcasts · editorial'}], deliverables:['Radio station bookings (Cool FM, Wazobia FM, Beat FM, Classic FM)','Live and recorded interview coordination','TV music show appearances (HIP TV, Soundcity TV, Trace Naija)','Podcast guest placements','Pre-interview briefing and talking points'] },
  { id:'amplification', name:'Song Amplification',        color:'#d8b4fe',      desc:'Digital and social amplification to drive streams, playlist adds and video views for your release.', packages:[{name:'Spark',price:'₦600,000',desc:'TikTok + Instagram · 2-week push'},{name:'Amplify',price:'₦1,500,000',desc:'All platforms · playlist pitching · 4-week campaign'},{name:'Chart Push',price:'₦4,000,000',desc:'Full digital rollout · influencer seeding · chart strategy'}], deliverables:['Paid social campaigns (TikTok, Instagram, YouTube)','TikTok Spark Ads and organic seeding','YouTube music video promotion','Playlist pitching (Audiomack, Boomplay, Spotify Nigeria)','Influencer and content creator seeding'] },
  { id:'full-rollout',  name:'Full Artist Campaign',      color:'#f472b6',      desc:'End-to-end music marketing covering press, radio rounds, social amplification and brand deals — from release day to chart.', packages:[{name:'Single Campaign',price:'₦3,000,000',desc:'4-week single rollout · all channels'},{name:'EP Campaign',price:'₦7,000,000',desc:'8-week EP rollout · press + media + digital'},{name:'Album Campaign',price:'₦15,000,000',desc:'12-week album rollout · full team · chart strategy'}], deliverables:['Release strategy and timeline','Press release + editorial campaign','National radio and TV rounds','Social media paid amplification','TikTok and Instagram creator seeding','Brand partnership outreach','Weekly performance reporting'] },
];

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeUp  = { hidden:{ opacity:0, y:10 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.22,1,0.36,1] } } };

export default function SocialMediaMarketing() {
  const [tab, setTab]                 = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [activePlatform, setActivePlat] = useState(null);
  const [activeMusic, setActiveMusic] = useState('press');
  const [booking, setBooking]         = useState(null);
  const [form, setForm]               = useState({ artistName:'', trackTitle:'', releaseDate:'', notes:'' });
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [bookingError, setBookingError] = useState('');

  const openBooking = (serviceId, packageName, price) => {
    setBooking({serviceId,packageName,price});
    setForm({artistName:'',trackTitle:'',releaseDate:'',notes:''});
    setSubmitted(false); setBookingError('');
  };

  const submitBooking = async () => {
    if (!form.artistName.trim()){ setBookingError('Artist name is required'); return; }
    setSubmitting(true); setBookingError('');
    try {
      const activeService = MUSIC_SERVICES.find(s=>s.id===booking.serviceId);
      await submitMusicBooking({service:activeService?.name,packageName:booking.packageName,price:booking.price,artistName:form.artistName,trackTitle:form.trackTitle,releaseDate:form.releaseDate,notes:form.notes,userEmail:auth.currentUser?.email});
      setSubmitted(true);
    } catch(e){ setBookingError(e.response?.data?.error||'Booking failed. Please try again.'); }
    finally{ setSubmitting(false); }
  };

  const activeService   = MUSIC_SERVICES.find(s=>s.id===activeMusic);
  const selectedPlatform= PLATFORMS.find(p=>p.id===activePlatform);
  const activeStageData = FUNNEL_STAGES[activeStage];

  const inp = { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', padding:'7px 0', fontSize:12, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none', marginBottom:8, borderRadius:0 };

  return (
    <>
      <PageTitle title="Social Media & Music Marketing"/>
      <Layout title="Social & Music Marketing" subtitle="Growth Services">

        {/* Booking Modal */}
        {booking && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
            <div style={{ background:'#0e0e16',border:'1px solid var(--amber-border)',padding:24,width:'100%',maxWidth:440,maxHeight:'90vh',overflowY:'auto' }}>
              {submitted ? (
                <div style={{ textAlign:'center',padding:'24px 0' }}>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12 }}>Booking Received</div>
                  <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:8 }}>We will be in touch within 24 hours.</p>
                  <p style={{ fontSize:11,color:'var(--text3)',lineHeight:1.7,marginBottom:18 }}>Our team will contact you to discuss your campaign in detail.</p>
                  <button onClick={()=>setBooking(null)} className="btn-primary" style={{ fontSize:11 }}>Done</button>
                </div>
              ) : (
                <>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:18 }}>
                    <div>
                      <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:3 }}>Music Promotion Booking</div>
                      <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:14,color:'var(--text)' }}>{booking.packageName}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--amber)',marginTop:2 }}>{booking.price}</p>
                    </div>
                    <button onClick={()=>setBooking(null)} style={{ background:'none',border:'none',color:'var(--text3)',fontSize:18,cursor:'pointer',lineHeight:1 }}>✕</button>
                  </div>
                  {[['Artist / Brand Name *','artistName','text','Davido'],['Track / Project Title','trackTitle','text','Timeless'],['Target Release Date','releaseDate','date','']].map(([label,key,type,ph])=>(
                    <div key={key}>
                      <label className="form-label">{label}</label>
                      <input type={type} placeholder={ph} value={form[key]} style={inp} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
                    </div>
                  ))}
                  <div>
                    <label className="form-label">Additional Notes</label>
                    <textarea rows={2} placeholder="Any specific requirements…" value={form.notes} style={{ ...inp,resize:'none',fontFamily:'Inter,sans-serif' }} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
                  </div>
                  {bookingError && <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#fca5a5',marginBottom:8 }}>{bookingError}</p>}
                  <div style={{ display:'flex',gap:8,marginTop:4 }}>
                    <button onClick={()=>setBooking(null)} className="btn-secondary" style={{ flex:1,fontSize:10 }}>Cancel</button>
                    <button onClick={submitBooking} disabled={submitting} className="btn-primary" style={{ flex:2,justifyContent:'center',fontSize:10 }}>
                      {submitting?<><Spinner size={11}/>Sending…</>:'Submit Booking →'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display:'flex',gap:0,border:'1px solid var(--border)',width:'fit-content',marginBottom:24 }}>
          {TABS.map((t,i)=>(
            <button key={t} onClick={()=>setTab(i)}
              style={{ padding:'9px 20px',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',transition:'all 0.15s',
                background:tab===i?'var(--amber)':'transparent',
                color:tab===i?'#0a0a0f':'var(--text3)' }}>
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* SOCIAL MEDIA TAB */}
          {tab===0 && (
            <motion.div key="social" variants={stagger} initial="hidden" animate="show" exit={{ opacity:0 }} className="space-y-5">

              {/* Platforms */}
              <motion.div variants={fadeUp} className="page-card" style={{ padding:'18px 20px' }}>
                <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:14 }}>Advertising Platforms</div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:1,background:'var(--border)' }}>
                  {PLATFORMS.map(p=>(
                    <div key={p.id} onClick={()=>setActivePlat(activePlatform===p.id?null:p.id)}
                      style={{ padding:'13px 14px',cursor:'pointer',transition:'all 0.15s',
                        background:activePlatform===p.id?'var(--amber-dim)':'var(--bg)',
                        borderTop:`2px solid ${activePlatform===p.id?'var(--amber)':'transparent'}` }}>
                      <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:12,color:activePlatform===p.id?'var(--amber)':'var(--text)',marginBottom:2 }}>{p.name}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginBottom:6 }}>{p.sub}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--amber)' }}>from {p.minBudget}</p>
                    </div>
                  ))}
                </div>
                {selectedPlatform && (
                  <motion.div initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }}
                    style={{ marginTop:14,padding:'14px 16px',background:'var(--amber-dim)',borderLeft:'2px solid var(--amber)' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                      <div>
                        <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,color:'var(--amber)' }}>{selectedPlatform.name}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginTop:2 }}>Reach: {selectedPlatform.reach}</p>
                      </div>
                      <span style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'3px 9px',background:'var(--bg)',color:'var(--amber)',border:'1px solid var(--amber-border)' }}>Min {selectedPlatform.minBudget}</span>
                    </div>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                      {selectedPlatform.formats.map(f=>(
                        <span key={f} style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 8px',background:'rgba(255,255,255,0.06)',color:'var(--text2)',border:'1px solid var(--border)',letterSpacing:'0.04em' }}>{f}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Funnel */}
              <motion.div variants={fadeUp} className="page-card" style={{ padding:'18px 20px' }}>
                <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:14 }}>Campaign Funnel Strategy</div>
                <div style={{ display:'flex',gap:0,borderBottom:'1px solid var(--border)',marginBottom:14 }}>
                  {FUNNEL_STAGES.map((s,i)=>(
                    <button key={s.stage} onClick={()=>setActiveStage(i)}
                      style={{ padding:'7px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',
                        color:activeStage===i?s.color:'var(--text3)',
                        borderBottom:activeStage===i?`2px solid ${s.color}`:'2px solid transparent',
                        marginBottom:-1,transition:'all 0.15s' }}>
                      {s.stage}
                    </button>
                  ))}
                </div>
                <div style={{ padding:'14px 16px',borderLeft:`2px solid ${activeStageData.color}`,background:'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:activeStageData.color,marginBottom:6 }}>{activeStageData.stage}</p>
                  <p style={{ fontSize:12,color:'var(--text2)',marginBottom:14,lineHeight:1.7 }}>{activeStageData.desc}</p>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                    <div>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8 }}>Tactics</p>
                      {activeStageData.tactics.map(t=>(
                        <p key={t} style={{ fontSize:11,color:'var(--text2)',marginBottom:5,display:'flex',alignItems:'center',gap:6 }}>
                          <span style={{ color:activeStageData.color,fontSize:9,flexShrink:0 }}>✓</span>{t}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8 }}>Platforms</p>
                      <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:12 }}>
                        {activeStageData.platforms.map(p=>(
                          <span key={p} style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 8px',background:'rgba(255,255,255,0.06)',color:'var(--text2)',border:'1px solid var(--border)',letterSpacing:'0.04em' }}>{p}</span>
                        ))}
                      </div>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>KPIs</p>
                      <p style={{ fontSize:11,color:'var(--text2)',fontStyle:'italic' }}>{activeStageData.kpi}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Packages */}
              <motion.div variants={fadeUp}>
                <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12 }}>Managed Advertising Packages</div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:1,background:'var(--border)' }}>
                  {AD_PACKAGES.map(pkg=>(
                    <div key={pkg.name}
                      style={{ padding:'20px',background: pkg.recommended?'var(--bg2)':'var(--bg)',position:'relative',display:'flex',flexDirection:'column',
                        borderTop:`2px solid ${pkg.recommended?'var(--amber)':'transparent'}` }}>
                      {pkg.recommended&&<div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'var(--amber)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:8 }}>Recommended</div>}
                      <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:3 }}>{pkg.name}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--amber)',marginBottom:4 }}>{pkg.budget}</p>
                      <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',marginBottom:14 }}>{pkg.platforms}</p>
                      <div style={{ flex:1 }}>
                        {pkg.features.map(f=>(
                          <p key={f} style={{ fontSize:11,color:'var(--text2)',marginBottom:5,display:'flex',alignItems:'center',gap:6 }}>
                            <span style={{ color:'var(--amber)',fontSize:9,flexShrink:0 }}>✓</span>{f}
                          </p>
                        ))}
                      </div>
                      <p style={{ fontSize:10,color:'var(--text3)',fontStyle:'italic',marginTop:10,marginBottom:12,lineHeight:1.5 }}>{pkg.best}</p>
                      <button onClick={()=>openBooking('social',`${pkg.name} Package`,pkg.budget)} className="btn-primary" style={{ width:'100%',justifyContent:'center',fontSize:10 }}>
                        Get Started →
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* MUSIC PROMOTION TAB */}
          {tab===1 && (
            <motion.div key="music" variants={stagger} initial="hidden" animate="show" exit={{ opacity:0 }} className="space-y-5">

              {/* Service selector */}
              <motion.div variants={fadeUp} style={{ display:'flex',gap:0,borderBottom:'1px solid var(--border)' }}>
                {MUSIC_SERVICES.map(s=>(
                  <button key={s.id} onClick={()=>setActiveMusic(s.id)}
                    style={{ padding:'8px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase',whiteSpace:'nowrap',
                      color:activeMusic===s.id?s.color:'var(--text3)',
                      borderBottom:activeMusic===s.id?`2px solid ${s.color}`:'2px solid transparent',
                      marginBottom:-1,transition:'all 0.15s' }}>
                    {s.name}
                  </button>
                ))}
              </motion.div>

              {activeService && (
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>

                  {/* Left — service details */}
                  <motion.div variants={fadeUp} className="page-card" style={{ padding:'18px 20px' }}>
                    <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:15,color:activeService.color,marginBottom:6 }}>{activeService.name}</p>
                    <p style={{ fontSize:12,color:'var(--text2)',lineHeight:1.75,marginBottom:16 }}>{activeService.desc}</p>
                    <div style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'var(--text3)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:10 }}>What's included</div>
                    {activeService.deliverables.map(d=>(
                      <p key={d} style={{ fontSize:11,color:'var(--text2)',marginBottom:6,display:'flex',alignItems:'flex-start',gap:8,lineHeight:1.6 }}>
                        <span style={{ color:activeService.color,fontSize:9,flexShrink:0,marginTop:3 }}>✓</span>{d}
                      </p>
                    ))}
                  </motion.div>

                  {/* Right — packages */}
                  <motion.div variants={fadeUp} className="space-y-3">
                    {activeService.packages.map(pkg=>(
                      <div key={pkg.name} style={{ padding:'16px',background:'var(--bg2)',border:'1px solid var(--border)',borderTop:`2px solid ${activeService.color}` }}>
                        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
                          <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,color:activeService.color }}>{pkg.name}</p>
                          <p style={{ fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:14,color:'var(--text)' }}>{pkg.price}</p>
                        </div>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'var(--text3)',marginBottom:12 }}>{pkg.desc}</p>
                        <button onClick={()=>openBooking(activeService.id,`${activeService.name} — ${pkg.name}`,pkg.price)}
                          style={{ width:'100%',padding:'7px',background:'transparent',border:`1px solid ${activeService.color}40`,fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:11,cursor:'pointer',color:activeService.color,letterSpacing:'0.04em',transition:'all 0.15s' }}
                          onMouseEnter={e=>{ e.currentTarget.style.background=`${activeService.color}15`; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
                          Book {pkg.name} →
                        </button>
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </>
  );
}