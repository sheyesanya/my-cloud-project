import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { getMedia, createCampaign, getUploadUrl } from '../services/api';
import axios from 'axios';

const INIT_BRIEF = { brand_name:'', email:'', campaignBrief:'', promotionFiles:[] };
const INIT_SEL   = { mediaId:'', inventory_group:'', inventory_option:'', market:'', date:'', runs:1 };

const CAT_LABELS = {
  ALL:'All', TELEVISION:'TV', RADIO_AUDIO:'Radio', PODCASTS:'Podcasts',
  OUT_OF_HOME:'OOH', PRINT_MEDIA:'Print', INFLUENCERS:'Influencers',
  SOCIAL_MEDIA:'Social Media', MUSIC_PROMOTION:'Music Promo', LIVE_STREAMING:'Live Streaming',
};

const ROUTE_TO_EMAIL = ['SOCIAL_MEDIA','MUSIC_PROMOTION'];
const SPECIAL_EMAIL  = 'brandcastang@gmail.com';

const VOLUME_DISCOUNT = (r) => r>=20?.25:r>=10?.15:r>=5?.10:r>=3?.05:0;
const discountLabel   = (r) => { const d=VOLUME_DISCOUNT(r); return d>0?`${d*100}% off`:null; };

const parseInv = (raw) => { if(!raw) return {}; if(typeof raw==='string'){try{return JSON.parse(raw);}catch{return{};}} return raw; };

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.06 } } };
const fadeUp  = { hidden:{ opacity:0, y:10 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.22,1,0.36,1] } } };

const STEPS = ['Brief','Build Campaign','Review'];

export default function CreateBooking() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [brief, setBrief]       = useState(INIT_BRIEF);
  const [sel, setSel]           = useState(INIT_SEL);
  const [media, setMedia]       = useState([]);
  const [loadingMedia, setLM]   = useState(true);
  const [submitting, setSub]    = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiErr, setApiErr]     = useState('');
  const [toast, setToast]       = useState(null);
  const [items, setItems]       = useState([]);
  const [search, setSearch]     = useState('');
  const [catFilter, setCat]     = useState('ALL');

  useEffect(() => {
    getMedia().then(r=>setMedia(Array.isArray(r)?r:r.media??r.data??[])).catch(console.error).finally(()=>setLM(false));
  }, []);

  const setB = (k,v) => setBrief(f=>({...f,[k]:v}));
  const setS = (k,v) => setSel(f=>({...f,[k]:v,...(k==='mediaId'?{inventory_group:'',inventory_option:'',market:''}:{}),...(k==='inventory_group'?{inventory_option:'',market:''}:{}),...(k==='inventory_option'?{market:''}:{})}));

  const selectedMedia    = media.find(m=>String(m.mediaId??m.id??m._id)===String(sel.mediaId));
  const inventory        = parseInv(selectedMedia?.inventory);
  const hasInventory     = Object.keys(inventory).length>0;
  const selectedGroup    = inventory[sel.inventory_group];
  const inventoryOptions = selectedGroup?.options||{};
  const selectedOption   = inventoryOptions[sel.inventory_option];
  const availableMarkets = selectedOption?Object.keys(selectedOption.markets||{}):[];
  const unitPrice        = selectedOption?.markets?.[sel.market]?.price??0;
  const runs             = Math.max(1,Number(sel.runs)||1);
  const discount         = VOLUME_DISCOUNT(runs);
  const finalPrice       = Math.round(unitPrice*runs*(1-discount));
  const campaignTotal    = items.reduce((s,i)=>s+(i.price||0),0);

  const filteredMedia = media.filter(m=>{
    const matchCat    = catFilter==='ALL'||m.category===catFilter;
    const matchSearch = !search||m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });

  const addItem = () => {
    const e={};
    if (!sel.mediaId) e.mediaId='Select a media organisation';
    if (hasInventory){
      if (!sel.inventory_group) e.inventory_group='Select a group';
      if (!sel.inventory_option) e.inventory_option='Select an option';
      if (!sel.market) e.market='Select a market';
    }
    if (!sel.date) e.date='Select a date';
    if (Object.keys(e).length){ setErrors(e); return; }
    setItems(prev=>[...prev,{mediaId:sel.mediaId,mediaName:selectedMedia?.name,category:selectedMedia?.category||'',inventory_group:sel.inventory_group,inventory_option:sel.inventory_option,groupLabel:selectedGroup?.label||sel.inventory_group,optionLabel:selectedOption?.label||sel.inventory_option,market:sel.market,date:sel.date,runs,price:finalPrice,unitPrice,discount}]);
    setToast({type:'success',message:runs>1?`×${runs} runs added`:'Added to campaign'});
    setTimeout(()=>setToast(null),2000);
    setSel(INIT_SEL); setErrors({});
  };

  const uploadFiles = async () => {
    if (!brief.promotionFiles?.length) return [];
    const out=[];
    for (const f of brief.promotionFiles){
      const signed=await getUploadUrl({fileName:f.name,fileType:f.type});
      await axios.put(signed.uploadUrl,f,{headers:{'Content-Type':f.type}});
      out.push({name:f.name,url:signed.fileUrl,type:f.type});
    }
    return out;
  };

  const launch = async () => {
    if (!items.length){ setApiErr('Add at least one item'); return; }
    setSub(true); setApiErr('');
    try {
      const files = await uploadFiles();
      const hasSpecial = items.some(i=>ROUTE_TO_EMAIL.includes(i.category));
      await createCampaign({brand_name:brief.brand_name.trim(),contactEmail:brief.email.trim(),campaignBrief:brief.campaignBrief,promotionFiles:files,items,...(hasSpecial?{routeTo:SPECIAL_EMAIL}:{})});
      setToast({type:'success',message:'Campaign launched!'});
      setTimeout(()=>navigate('/campaigns'),1800);
    } catch(e){ setApiErr(e.message); }
    finally{ setSub(false); }
  };

  const inp = (field) => ({
    width:'100%', background:'transparent', border:'none', borderBottom:`1px solid ${errors[field]?'rgba(239,68,68,0.5)':'var(--border)'}`, padding:'8px 0', fontSize:13, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none', transition:'border-color 0.2s', borderRadius:0,
  });
  const focusAmber = (e) => e.target.style.borderBottomColor='var(--amber)';
  const blurBorder = (e,field) => e.target.style.borderBottomColor=errors[field]?'rgba(239,68,68,0.5)':'var(--border)';

  return (
    <>
      <PageTitle title="Create Campaign"/>
      <Layout title="Create Campaign" subtitle="Campaign Booking">
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}
        <div style={{ maxWidth:720 }}>

          {/* Progress bar */}
          <div style={{ height:2, background:'var(--border)', marginBottom:24, position:'relative' }}>
            <motion.div animate={{ width:`${(step/3)*100}%` }} transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
              style={{ position:'absolute', top:0, left:0, height:'100%', background:'var(--amber)' }}/>
          </div>

          {/* Step header */}
          <div style={{ marginBottom:24, position:'relative' }}>
            <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:900, fontSize:80, color:'rgba(99,102,241,0.05)', position:'absolute', top:-16, left:-6, lineHeight:1, userSelect:'none', pointerEvents:'none', letterSpacing:'-4px' }}>
              {String(step).padStart(2,'0')}
            </div>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:5 }}>
              Step {step} of {STEPS.length}
            </div>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:22, color:'var(--text)', letterSpacing:'-0.4px' }}>{STEPS[step-1]}</h2>
          </div>

          <AnimatePresence mode="wait">

            {/* STEP 1 */}
            {step===1 && (
              <motion.div key="s1" initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:16 }} transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}>
                <div className="page-card" style={{ padding:24 }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
                    <div>
                      <label className="form-label">Brand Name *</label>
                      <input style={inp('brand_name')} placeholder="e.g. Indomie Nigeria" value={brief.brand_name} onChange={e=>setB('brand_name',e.target.value)} onFocus={focusAmber} onBlur={e=>blurBorder(e,'brand_name')}/>
                      {errors.brand_name && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fca5a5', marginTop:4 }}>{errors.brand_name}</p>}
                    </div>
                    <div>
                      <label className="form-label">Contact Email *</label>
                      <input type="email" style={inp('email')} placeholder="brand@company.com" value={brief.email} onChange={e=>setB('email',e.target.value)} onFocus={focusAmber} onBlur={e=>blurBorder(e,'email')}/>
                      {errors.email && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fca5a5', marginTop:4 }}>{errors.email}</p>}
                    </div>
                    <div>
                      <label className="form-label">Campaign Brief</label>
                      <textarea rows={3} placeholder="Campaign goals, target audience, KPIs…" value={brief.campaignBrief} onChange={e=>setB('campaignBrief',e.target.value)} onFocus={focusAmber} onBlur={e=>blurBorder(e,'')}
                        style={{ ...inp(''), resize:'vertical', fontFamily:'Inter,sans-serif' }}/>
                    </div>
                    <div>
                      <label className="form-label">Promotion Files</label>
                      <input type="file" multiple onChange={e=>setB('promotionFiles',Array.from(e.target.files))}
                        style={{ ...inp(''), cursor:'pointer', padding:'8px 0', fontSize:11 }}/>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                  <button onClick={()=>{ if(!brief.brand_name.trim()||!brief.email.trim()){ setErrors({brand_name:!brief.brand_name.trim()?'Required':'',email:!brief.email.trim()?'Required':''}); return; } setStep(2); }} className="btn-primary" style={{ fontSize:11 }}>
                    Next Step →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step===2 && (
              <motion.div key="s2" initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:16 }} transition={{ duration:0.3, ease:[0.22,1,0.36,1] }} className="space-y-4">

                {/* Tip */}
                <div style={{ padding:'10px 14px', background:'var(--amber-dim)', borderLeft:'2px solid var(--amber)', display:'flex', alignItems:'center', gap:10 }}>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--amber)', lineHeight:1.6 }}>
                    Select a provider → pick inventory → click <strong>+ Add to Campaign</strong>. Add as many as you need.
                  </p>
                </div>

                {/* Media picker */}
                <div className="page-card" style={{ padding:16 }}>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>Select Media Organisation</div>

                  {/* Category tabs */}
                  <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:10, overflowX:'auto' }}>
                    {Object.entries(CAT_LABELS).map(([key,label])=>(
                      <button key={key} onClick={()=>setCat(key)}
                        style={{ padding:'6px 12px', background:'none', border:'none', cursor:'pointer', fontFamily:'IBM Plex Mono,monospace', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap',
                          color:catFilter===key?'var(--amber)':'var(--text3)',
                          borderBottom:catFilter===key?'2px solid var(--amber)':'2px solid transparent',
                          marginBottom:-1, transition:'all 0.15s' }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div style={{ borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, paddingBottom:8, marginBottom:10 }}>
                    <input type="text" placeholder="Search providers…" value={search} onChange={e=>setSearch(e.target.value)}
                      style={{ flex:1, background:'none', border:'none', fontSize:12, color:'var(--text)', fontFamily:'Inter,sans-serif', outline:'none' }}/>
                    {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer' }}>✕</button>}
                  </div>

                  {errors.mediaId && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fca5a5', marginBottom:8 }}>{errors.mediaId}</p>}
                  {loadingMedia && <div style={{ color:'var(--text3)', fontSize:12, padding:'8px 0', display:'flex', gap:8, alignItems:'center' }}><Spinner size={12}/>Loading…</div>}

                  <div style={{ maxHeight:220, overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
                    {filteredMedia.map(m=>{
                      const id=m.mediaId??m.id??m._id;
                      const active=String(sel.mediaId)===String(id);
                      const inv=parseInv(m.inventory);
                      const hasInv=Object.keys(inv).length>0;
                      return(
                        <button key={id} type="button"
                          onClick={()=>{ setS('mediaId',String(sel.mediaId)===String(id)?'':id); setErrors({}); }}
                          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', textAlign:'left', cursor:'pointer', transition:'all 0.15s', borderLeft:'2px solid transparent',
                            background:active?'var(--amber-dim)':'transparent',
                            borderLeftColor:active?'var(--amber)':'transparent',
                            border:`1px solid ${active?'var(--amber-border)':'var(--border2)'}`,
                          }}>
                          <div>
                            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:500, fontSize:12, color:'var(--text)' }}>{m.name}</p>
                            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:1 }}>{(m.category||'').replaceAll('_',' ')}</p>
                          </div>
                          <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, padding:'2px 7px', letterSpacing:'0.06em', background:hasInv?'rgba(74,222,128,0.08)':'var(--amber-dim)', color:hasInv?'#4ade80':'var(--amber)' }}>
                            {hasInv?'Set':'Quote'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inventory */}
                {sel.mediaId && (
                  <div className="page-card" style={{ padding:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:32, height:32, background:'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#0a0a0f', flexShrink:0, fontFamily:'Manrope,sans-serif' }}>
                        {selectedMedia?.name?.[0]}
                      </div>
                      <div>
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'var(--text)' }}>{selectedMedia?.name}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)' }}>{(selectedMedia?.category||'').replaceAll('_',' ')}</p>
                      </div>
                    </div>

                    {!hasInventory ? (
                      <div style={{ padding:14, background:'var(--amber-dim)', border:'1px solid var(--amber-border)', textAlign:'center' }}>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--amber)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Pricing on request</p>
                        <p style={{ fontSize:11, color:'var(--text3)', marginBottom:12 }}>BrandCasta will get you a custom quote within 24hrs.</p>
                        <div style={{ marginBottom:10 }}>
                          <label className="form-label">Campaign Date *</label>
                          <input type="date" value={sel.date} onChange={e=>setS('date',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}
                            style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--border)', padding:'7px 0', fontSize:12, color:'var(--text)', outline:'none', marginBottom:10, borderRadius:0 }}/>
                        </div>
                        <button type="button" onClick={()=>{
                          if (!sel.date){ setErrors({date:'Required'}); return; }
                          setItems(prev=>[...prev,{mediaId:sel.mediaId,mediaName:selectedMedia?.name,category:selectedMedia?.category||'',inventory_group:'CUSTOM',inventory_option:'CUSTOM',groupLabel:'Custom Quote',optionLabel:'Pricing on request',market:'NATIONAL',date:sel.date,runs:1,price:0,unitPrice:0}]);
                          setToast({type:'success',message:`${selectedMedia?.name} added — BrandCasta will quote`});
                          setTimeout(()=>setToast(null),3000);
                          setSel(INIT_SEL);
                        }} className="btn-primary" style={{ fontSize:11 }}>Add & Request Quote</button>
                      </div>
                    ) : (
                      <div className="space-y-4">

                        {/* Groups */}
                        <div>
                          <label className="form-label">Inventory Group</label>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:6 }}>
                            {Object.entries(inventory).map(([key,group])=>(
                              <button key={key} type="button" onClick={()=>{ setS('inventory_group',key); setErrors(e=>({...e,inventory_group:''})); }}
                                style={{ padding:'10px 12px', textAlign:'left', cursor:'pointer', transition:'all 0.15s',
                                  background:sel.inventory_group===key?'var(--amber-dim)':'rgba(255,255,255,0.025)',
                                  border:`1px solid ${sel.inventory_group===key?'var(--amber-border)':'var(--border)'}`,
                                  borderTop:`2px solid ${sel.inventory_group===key?'var(--amber)':'transparent'}`,
                                }}>
                                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:11, color:sel.inventory_group===key?'var(--amber)':'var(--text)', lineHeight:1.3 }}>{group.label}</p>
                                <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:2 }}>{Object.keys(group.options||{}).length} options</p>
                              </button>
                            ))}
                          </div>
                          {errors.inventory_group && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fca5a5', marginTop:4 }}>{errors.inventory_group}</p>}
                        </div>

                        {/* Options */}
                        {sel.inventory_group && (
                          <div>
                            <label className="form-label">Option</label>
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              {Object.entries(inventoryOptions).map(([key,opt])=>{
                                const lowest=Math.min(...Object.values(opt.markets||{}).map(m=>m.price||0).filter(p=>p>0));
                                return(
                                  <button key={key} type="button" onClick={()=>{ setS('inventory_option',key); setErrors(e=>({...e,inventory_option:''})); }}
                                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', textAlign:'left', cursor:'pointer', transition:'all 0.15s',
                                      background:sel.inventory_option===key?'var(--amber-dim)':'transparent',
                                      border:`1px solid ${sel.inventory_option===key?'var(--amber-border)':'var(--border2)'}`,
                                      borderLeft:`2px solid ${sel.inventory_option===key?'var(--amber)':'transparent'}`,
                                    }}>
                                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:500, fontSize:12, color:'var(--text)' }}>{opt.label}</p>
                                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--amber)', flexShrink:0, marginLeft:10 }}>
                                      {lowest>0?`₦${Number(lowest).toLocaleString()}`:'On request'}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                            {errors.inventory_option && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fca5a5', marginTop:4 }}>{errors.inventory_option}</p>}
                          </div>
                        )}

                        {/* Markets */}
                        {sel.inventory_option && (
                          <div>
                            <label className="form-label">Market</label>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                              {availableMarkets.map(m=>{
                                const price=selectedOption?.markets?.[m]?.price;
                                return(
                                  <button key={m} type="button" onClick={()=>{ setS('market',m); setErrors(e=>({...e,market:''})); }}
                                    style={{ padding:'6px 12px', cursor:'pointer', transition:'all 0.15s',
                                      background:sel.market===m?'var(--amber-dim)':'rgba(255,255,255,0.04)',
                                      border:`1px solid ${sel.market===m?'var(--amber-border)':'var(--border)'}`,
                                    }}>
                                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:sel.market===m?'var(--amber)':'var(--text2)' }}>{m.replaceAll('_',' ')}</p>
                                    {price>0&&<p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:1 }}>₦{Number(price).toLocaleString()}</p>}
                                  </button>
                                );
                              })}
                            </div>
                            {errors.market && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fca5a5', marginTop:4 }}>{errors.market}</p>}
                          </div>
                        )}

                        {/* Date + Runs */}
                        {sel.market && (
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                            <div>
                              <label className="form-label">Start Date *</label>
                              <input type="date" value={sel.date} onChange={e=>setS('date',e.target.value)} onFocus={focusAmber} onBlur={blurBorder}
                                style={{ width:'100%', background:'transparent', border:'none', borderBottom:`1px solid ${errors.date?'rgba(239,68,68,0.5)':'var(--border)'}`, padding:'7px 0', fontSize:12, color:'var(--text)', outline:'none', borderRadius:0 }}/>
                              {errors.date && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fca5a5', marginTop:3 }}>{errors.date}</p>}
                            </div>
                            <div>
                              <label className="form-label">Runs</label>
                              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6 }}>
                                <button type="button" onClick={()=>setS('runs',Math.max(1,runs-1))}
                                  style={{ width:28, height:28, border:'1px solid var(--border)', background:'transparent', color:'var(--text)', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:0 }}>−</button>
                                <div style={{ flex:1, textAlign:'center' }}>
                                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:20, color:'var(--text)' }}>{runs}</p>
                                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--text3)' }}>run{runs>1?'s':''}</p>
                                </div>
                                <button type="button" onClick={()=>setS('runs',runs+1)}
                                  style={{ width:28, height:28, border:'1px solid var(--amber-border)', background:'var(--amber-dim)', color:'var(--amber)', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:0 }}>+</button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Price preview */}
                        {sel.market && unitPrice>0 && (
                          <div style={{ padding:'12px 16px', background:'var(--amber-dim)', borderLeft:'3px solid var(--amber)' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                              <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                                {runs>1?`₦${Number(unitPrice).toLocaleString()} × ${runs} runs`:'Placement Cost'}
                              </p>
                              {discountLabel(runs) && <span style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, padding:'2px 7px', background:'rgba(74,222,128,0.1)', color:'#4ade80', letterSpacing:'0.06em' }}>{discountLabel(runs)}</span>}
                            </div>
                            {discount>0 && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--text3)', textDecoration:'line-through', marginBottom:2 }}>₦{Number(unitPrice*runs).toLocaleString()}</p>}
                            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:26, color:'var(--amber)' }}>₦{Number(finalPrice).toLocaleString()}</p>
                            {runs>=3&&runs<5&&<p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fcd34d', marginTop:3 }}>Add {5-runs} more run{5-runs>1?'s':''} for 10% off</p>}
                            {runs>=5&&runs<10&&<p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#fcd34d', marginTop:3 }}>Add {10-runs} more for 15% off</p>}
                          </div>
                        )}

                        <button type="button" onClick={addItem} className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:11 }}>
                          + Add to Campaign
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cart */}
                {items.length>0 && (
                  <div className="page-card" style={{ padding:16 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div>
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, color:'var(--text)' }}>
                          Campaign Cart
                          <span style={{ marginLeft:8, fontFamily:'IBM Plex Mono,monospace', fontSize:9, padding:'1px 7px', background:'var(--amber-dim)', color:'var(--amber)', letterSpacing:'0.06em' }}>{items.length}</span>
                        </p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:2 }}>Add more providers above</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Total</p>
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:18, color:'var(--amber)' }}>₦{campaignTotal.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {items.map((item,idx)=>(
                        <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', background:'rgba(255,255,255,0.025)', border:'1px solid var(--border2)', borderLeft:`2px solid var(--amber)` }}>
                          <div>
                            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:500, fontSize:12, color:'var(--text)' }}>{item.mediaName}</p>
                            <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:1 }}>
                              {item.optionLabel} · {item.market?.replaceAll('_',' ')}
                              {item.runs>1&&<span style={{ marginLeft:5 }}>×{item.runs}</span>}
                            </p>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ textAlign:'right' }}>
                              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:12, color:item.price>0?'var(--amber)':'#fcd34d' }}>
                                {item.price>0?`₦${Number(item.price).toLocaleString()}`:'On request'}
                              </p>
                              {item.discount>0 && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#4ade80' }}>{(item.discount*100).toFixed(0)}% off</p>}
                            </div>
                            <button type="button" onClick={()=>setItems(p=>p.filter((_,i)=>i!==idx))}
                              style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, padding:'2px 7px', background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.18)', cursor:'pointer', letterSpacing:'0.06em' }}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add another prompt */}
                {items.length>0 && !sel.mediaId && (
                  <div style={{ padding:'12px 16px', border:'1px dashed var(--amber-border)', textAlign:'center' }}>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginBottom:8, letterSpacing:'0.06em' }}>
                      ✓ {items.length} item{items.length>1?'s':''} added — want to add another provider?
                    </p>
                    <button type="button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
                      style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', background:'var(--amber-dim)', border:'1px solid var(--amber-border)', padding:'5px 14px', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                      + Add Another Provider
                    </button>
                  </div>
                )}

                {apiErr && <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)', fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#fca5a5' }}>{apiErr}</div>}

                <div style={{ display:'flex', gap:8 }}>
                  <button type="button" onClick={()=>setStep(1)} className="btn-secondary" style={{ fontSize:11 }}>← Back</button>
                  <button type="button" onClick={()=>{ if(!items.length){ setApiErr('Add at least one item'); return; } setStep(3); }} className="btn-primary" style={{ flex:1, justifyContent:'center', fontSize:11 }}>
                    Review Campaign →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step===3 && (
              <motion.div key="s3" initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:16 }} transition={{ duration:0.3, ease:[0.22,1,0.36,1] }} className="space-y-4">
                <div className="page-card" style={{ padding:20 }}>
                  <div style={{ marginBottom:14, padding:'12px 14px', background:'rgba(255,255,255,0.025)', border:'1px solid var(--border)', borderLeft:'2px solid var(--amber)' }}>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>Brief</p>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'var(--text)' }}>{brief.brand_name}</p>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--text3)' }}>{brief.email}</p>
                    {brief.campaignBrief && <p style={{ fontSize:11, color:'var(--text3)', marginTop:5, lineHeight:1.6 }}>{brief.campaignBrief}</p>}
                  </div>

                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Items ({items.length})</p>
                  <div className="space-y-2" style={{ marginBottom:14 }}>
                    {items.map((item,idx)=>(
                      <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'rgba(255,255,255,0.025)', border:'1px solid var(--border)', borderLeft:'2px solid var(--amber)' }}>
                        <div>
                          <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:500, fontSize:12, color:'var(--text)' }}>{item.mediaName}</p>
                          <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', marginTop:1 }}>{item.groupLabel} · {item.optionLabel} · {item.market?.replaceAll('_',' ')} · {item.date}{item.runs>1?` · ×${item.runs}`:''}</p>
                        </div>
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:12, color:item.price>0?'var(--amber)':'#fcd34d' }}>
                          {item.price>0?`₦${Number(item.price).toLocaleString()}`:'On request'}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--amber-dim)', borderLeft:'3px solid var(--amber)' }}>
                    <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--amber)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Total Campaign Value</p>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:22, color:'var(--amber)' }}>₦{campaignTotal.toLocaleString()}</p>
                  </div>
                </div>

                {apiErr && <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)', fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#fca5a5' }}>{apiErr}</div>}

                <div style={{ display:'flex', gap:8 }}>
                  <button type="button" onClick={()=>setStep(2)} className="btn-secondary" style={{ fontSize:11 }}>← Edit</button>
                  <button type="button" onClick={launch} disabled={submitting} className="btn-primary" style={{ flex:1, justifyContent:'center', fontSize:11 }}>
                    {submitting?<><Spinner size={12}/>Launching…</>:'🚀 Launch Campaign'}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </Layout>
    </>
  );
}