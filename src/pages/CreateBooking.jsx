import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { getMedia, createCampaign, getUploadUrl } from '../services/api';
import axios from 'axios';

const INIT_BRIEF = { brand_name:'', email:'', campaignBrief:'', promotionFiles:[] };
const INIT_SELECTION = { mediaId:'', inventory_group:'', inventory_option:'', market:'', date:'', runs:1 };

const CAT_LABELS = {
  ALL:'All', TELEVISION:'TV', RADIO_AUDIO:'Radio', PODCASTS:'Podcasts',
  OUT_OF_HOME:'OOH', PRINT_MEDIA:'Print', INFLUENCERS:'Influencers',
  SOCIAL_MEDIA:'Social Media', MUSIC_PROMOTION:'Music Promotion',
  LIVE_STREAMING:'Live Streaming Ads',
};



const CAT_ICONS = {
  SOCIAL_MEDIA:     '',
  MUSIC_PROMOTION:  '',
};

const ROUTE_TO_EMAIL = ['SOCIAL_MEDIA','MUSIC_PROMOTION'];

const DISPLAY_NAMES = {
  'BrandCasta Social Media':      'BrandCasta Social-Media Marketing',
  'BrandCasta Music Promotion':   'BrandCasta Music Promotion',
};
const displayName = (name) => DISPLAY_NAMES[name] || name;
const SPECIAL_EMAIL  = 'brandcastang@gmail.com';

// Parse inventory — stored as JSON string in DynamoDB
const parseInventory = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
};

export default function CreateBooking() {
  const navigate = useNavigate();

  const [step, setStep]     = useState(1);
  const [brief, setBrief]   = useState(INIT_BRIEF);
  const [sel, setSel]       = useState(INIT_SELECTION);
  const [media, setMedia]   = useState([]);
  const [loadingMedia, setLM] = useState(true);
  const [submitting, setSub]  = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiErr, setApiErr]   = useState('');
  const [toast, setToast]     = useState(null);
  const [items, setItems]     = useState([]);
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('ALL');

  useEffect(() => {
    getMedia()
      .then(r => setMedia(Array.isArray(r) ? r : r.media ?? r.data ?? []))
      .catch(console.error)
      .finally(() => setLM(false));
  }, []);

  const setB = (k, v) => setBrief(f => ({ ...f, [k]: v }));
  const setS = (k, v) => setSel(f => ({ ...f, [k]: v, ...(k==='mediaId'?{inventory_group:'',inventory_option:'',market:''}:{}), ...(k==='inventory_group'?{inventory_option:'',market:''}:{}), ...(k==='inventory_option'?{market:''}:{}) }));

  const selectedMedia    = media.find(m => String(m.mediaId ?? m.id ?? m._id) === String(sel.mediaId));
  const inventory        = parseInventory(selectedMedia?.inventory);
  const hasInventory     = Object.keys(inventory).length > 0;
  const selectedGroup    = inventory[sel.inventory_group];
  const inventoryOptions = selectedGroup?.options || {};
  const selectedOption   = inventoryOptions[sel.inventory_option];
  const availableMarkets = selectedOption ? Object.keys(selectedOption.markets || {}) : [];
  const unitPrice        = selectedOption?.markets?.[sel.market]?.price ?? 0;
  const runs             = Math.max(1, Number(sel.runs) || 1);
  const discount         = VOLUME_DISCOUNT(runs);
  const finalPrice       = Math.round(unitPrice * runs * (1 - discount));
  const campaignTotal    = items.reduce((s, i) => s + (i.price || 0), 0);

  const filteredMedia = media.filter(m => {
    const matchCat    = catFilter === 'ALL' || m.category === catFilter;
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const inp = (field, obj=errors) => ({
    width:'100%', padding:'12px 16px', borderRadius:12, fontSize:13, outline:'none',
    background: obj[field] ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)',
    border: obj[field] ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)',
    color:'white', transition:'all 0.15s',
  });

  const addItem = () => {
    const e = {};
    if (!sel.mediaId)           e.mediaId = 'Select a media organisation';
    if (hasInventory) {
      if (!sel.inventory_group)  e.inventory_group  = 'Select an inventory group';
      if (!sel.inventory_option) e.inventory_option = 'Select an option';
      if (!sel.market)           e.market = 'Select a market';
    }
    if (!sel.date) e.date = 'Select a date';
    if (Object.keys(e).length) { setErrors(e); return; }

    setItems(prev => [...prev, {
      mediaId:         sel.mediaId,
      mediaName:       selectedMedia?.name,
      category:        selectedMedia?.category || '',
      inventory_group: sel.inventory_group,
      inventory_option:sel.inventory_option,
      groupLabel:      selectedGroup?.label || sel.inventory_group,
      optionLabel:     selectedOption?.label || sel.inventory_option,
      market:          sel.market,
      date:            sel.date,
      runs, price: finalPrice, unitPrice, discount,
    }]);

    setToast({ type:'success', message: runs > 1 ? `Added ×${runs} runs` : 'Added to campaign' });
    setTimeout(() => setToast(null), 2000);
    setSel(INIT_SELECTION);
    setErrors({});
  };

  const uploadFiles = async () => {
    if (!brief.promotionFiles?.length) return [];
    const out = [];
    for (const f of brief.promotionFiles) {
      const signed = await getUploadUrl({ fileName: f.name, fileType: f.type });
      await axios.put(signed.uploadUrl, f, { headers: { 'Content-Type': f.type } });
      out.push({ name: f.name, url: signed.fileUrl, type: f.type });
    }
    return out;
  };

  const launch = async () => {
    if (!items.length) { setApiErr('Add at least one item to your campaign'); return; }
    setSub(true); setApiErr('');
    try {
      const files = await uploadFiles();
      const hasSpecialCategory = items.some(i => ROUTE_TO_EMAIL.includes(i.category));
      await createCampaign({
        brand_name:     brief.brand_name.trim(),
        contactEmail:   brief.email.trim(),
        campaignBrief:  brief.campaignBrief,
        promotionFiles: files,
        items,
        ...(hasSpecialCategory ? { routeTo: SPECIAL_EMAIL } : {}),
      });
      setToast({ type:'success', message:'Campaign launched!' });
      setTimeout(() => navigate('/campaigns'), 1800);
    } catch(e) { setApiErr(e.message); }
    finally { setSub(false); }
  };

  const stepDone = s => s < step;

  return (
    <Layout title="Create Campaign" subtitle="Build and launch multi-platform media campaigns">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      <div className="max-w-3xl">

        {/* Steps */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:28 }}>
          {['Brief','Build Campaign','Review'].map((label, i) => {
            const s = i + 1; const active = step === s; const done = stepDone(s);
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', flex: i < 2 ? 1 : 'none' }}>
                <div onClick={() => done && setStep(s)} style={{ display:'flex', alignItems:'center', gap:8, cursor: done ? 'pointer' : 'default', flexShrink:0 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
                    background: done ? 'linear-gradient(135deg,#6366f1,#a855f7)' : active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    border: active ? '1px solid rgba(99,102,241,0.5)' : done ? 'none' : '1px solid var(--border)',
                    color: done || active ? 'white' : 'var(--text-muted)',
                  }}>{done ? '✓' : s}</div>
                  <span style={{ fontSize:12, fontWeight:600, color: active ? 'white' : done ? 'var(--accent-light)' : 'var(--text-muted)' }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex:1, height:1, background: done ? 'rgba(99,102,241,0.4)' : 'var(--border)', margin:'0 12px' }}/>}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: BRIEF ── */}
        {step === 1 && (
          <div style={{ padding:28, borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontSize:18, fontWeight:700, color:'white', marginBottom:6 }}>Campaign Brief</h2>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>Tell us about the brand and campaign goals</p>
            <div className="space-y-5">
              <div>
                <label className="form-label">Brand Name *</label>
                <input style={inp('brand_name',{})} placeholder="e.g. Indomie Nigeria" value={brief.brand_name} onChange={e => setB('brand_name', e.target.value)}/>
              </div>
              <div>
                <label className="form-label">Contact Email *</label>
                <input type="email" style={inp('email',{})} placeholder="brand@company.com" value={brief.email} onChange={e => setB('email', e.target.value)}/>
              </div>
              <div>
                <label className="form-label">Campaign Brief</label>
                <textarea rows={4} placeholder="Describe campaign goals, target audience, KPIs..." value={brief.campaignBrief} onChange={e => setB('campaignBrief', e.target.value)} style={{ ...inp('',{}), resize:'vertical' }}/>
              </div>
              <div>
                <label className="form-label">Promotion Files</label>
                <input type="file" multiple onChange={e => setB('promotionFiles', Array.from(e.target.files))} style={{ ...inp('',{}), padding:'10px 14px', cursor:'pointer' }}/>
                {brief.promotionFiles?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {brief.promotionFiles.map((f,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:10, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)' }}>
                        <p style={{ fontSize:12, color:'var(--accent-light)' }}>{f.name}</p>
                        <p style={{ fontSize:11, color:'var(--text-muted)', marginLeft:'auto' }}>{(f.size/1024).toFixed(0)} KB</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => {
                if (!brief.brand_name.trim() || !brief.email.trim()) { setErrors({ brand_name:!brief.brand_name.trim()?'Required':'', email:!brief.email.trim()?'Required':'' }); return; }
                setStep(2);
              }} className="btn-primary" style={{ padding:'11px 24px' }}>Next: Build Campaign →</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: BUILD CAMPAIGN ── */}
        {step === 2 && (
          <div className="space-y-5">

            {/* Step 2 explainer */}
            <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>🛒</span>
              <div>
                <p style={{ fontWeight:700, fontSize:13, color:'white', marginBottom:2 }}>Build your campaign</p>
                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>
                  Select a media organisation, choose your inventory and click <strong style={{ color:'#a5b4fc' }}>+ Add to Campaign</strong>. You can add as many providers as you want before launching.
                </p>
              </div>
            </div>

            {/* Media picker */}
            <div style={{ padding:20, borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'white', marginBottom:14 }}>Select Media Organisation</p>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(CAT_LABELS).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setCat(key)}
                    style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer',
                      background: catFilter===key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                      color:       catFilter===key ? '#a5b4fc' : 'var(--text-muted)',
                      border:      catFilter===key ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
                    }}>{label}</button>
                ))}
              </div>

              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:'100%', padding:'9px 14px', borderRadius:10, fontSize:13, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'white', marginBottom:12 }}/>

              {errors.mediaId && <p style={{ color:'#fca5a5', fontSize:12, marginBottom:8 }}>{errors.mediaId}</p>}
              {loadingMedia && <div style={{ color:'var(--text-muted)', fontSize:13, padding:'12px 0' }}><Spinner size={14}/> Loading…</div>}

              <div style={{ maxHeight:280, overflowY:'auto', display:'grid', gap:6 }}>
                {filteredMedia.map(m => {
                  const id = m.mediaId ?? m.id ?? m._id;
                  const active = String(sel.mediaId) === String(id);
                  const inv = parseInventory(m.inventory);
                  const hasInv = Object.keys(inv).length > 0;
                  return (
                    <button key={id} type="button" onClick={() => { if (String(sel.mediaId) === String(id)) { setSel(INIT_SELECTION); setErrors({}); } else { setS('mediaId', id); setErrors({}); } }}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, textAlign:'left', cursor:'pointer', transition:'all 0.15s',
                        background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                        border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                      }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          {CAT_ICONS[m.category] && <span style={{ fontSize:15 }}>{CAT_ICONS[m.category]}</span>}
                          <p style={{ fontWeight:600, fontSize:13, color:'white' }}>{displayName(m.name)}</p>
                        </div>
                        <div style={{ display:'flex', gap:6, marginTop:3 }}>
                          <span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>{m.category?.replaceAll('_',' ')}</span>
                          <span style={{ fontSize:10, padding:'1px 6px', borderRadius:20, fontWeight:700,
                            background: hasInv ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.08)',
                            color:       hasInv ? '#86efac' : '#fcd34d',
                            border:      hasInv ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(245,158,11,0.15)',
                          }}>{hasInv ? 'Inventory set' : 'Quote on request'}</span>
                        </div>
                      </div>
                      {active && <div style={{ width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inventory — shown automatically once media is selected */}
            {sel.mediaId && (
              <div style={{ padding:20, borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', flexShrink:0 }}>
                    {selectedMedia?.name?.[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight:700, color:'white', fontSize:14 }}>{displayName(selectedMedia?.name)}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{selectedMedia?.category?.replaceAll('_',' ')}</p>
                  </div>
                </div>

                {!hasInventory ? (
                  <div style={{ padding:'16px', borderRadius:12, background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.18)', textAlign:'center' }}>
                    <p style={{ fontWeight:700, color:'#fcd34d', marginBottom:6 }}>Pricing on request</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6, marginBottom:12 }}>
                      This provider hasn't set up their inventory yet. BrandCasta will reach out and get you a custom quote.
                    </p>
                    <div>
                      <label className="form-label">Campaign Date *</label>
                      <input type="date" value={sel.date} onChange={e => setS('date', e.target.value)}
                        style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:13, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'white', marginBottom:12 }}/>
                    </div>
                    <button type="button" onClick={() => {
                      if (!sel.date) { setErrors({ date:'Required' }); return; }
                      setItems(prev => [...prev, { mediaId: sel.mediaId, mediaName: selectedMedia?.name, category: selectedMedia?.category || '', inventory_group:'CUSTOM', inventory_option:'CUSTOM', groupLabel:'Custom Quote', optionLabel:'Pricing on request', market:'NATIONAL', date: sel.date, runs:1, price:0, unitPrice:0 }]);
                      setToast({ type:'success', message:`${selectedMedia?.name} added — BrandCasta will get a quote` });
                      setTimeout(() => setToast(null), 3000);
                      setSel(INIT_SELECTION);
                    }} className="btn-primary" style={{ padding:'9px 20px', fontSize:13 }}>
                      Add & Request Quote
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {/* Inventory Groups as cards */}
                    <div>
                      <label className="form-label">Inventory Group</label>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }}>
                        {Object.entries(inventory).map(([key, group]) => (
                          <button key={key} type="button" onClick={() => { setS('inventory_group', key); setErrors(e => ({ ...e, inventory_group:'' })); }}
                            style={{ padding:'12px 14px', borderRadius:10, textAlign:'left', cursor:'pointer', transition:'all 0.15s',
                              background: sel.inventory_group===key ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                              border:     sel.inventory_group===key ? '1px solid rgba(99,102,241,0.45)' : '1px solid var(--border)',
                            }}>
                            <p style={{ fontWeight:700, fontSize:12, color: sel.inventory_group===key ? '#a5b4fc' : 'white', lineHeight:1.3 }}>{group.label}</p>
                            <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{Object.keys(group.options||{}).length} options</p>
                          </button>
                        ))}
                      </div>
                      {errors.inventory_group && <p style={{ color:'#fca5a5', fontSize:11, marginTop:6 }}>{errors.inventory_group}</p>}
                    </div>

                    {/* Options — shown once group selected */}
                    {sel.inventory_group && (
                      <div>
                        <label className="form-label">Option</label>
                        <div style={{ display:'grid', gap:6 }}>
                          {Object.entries(inventoryOptions).map(([key, opt]) => {
                            const lowestPrice = Math.min(...Object.values(opt.markets||{}).map(m => m.price || 0).filter(p => p > 0));
                            return (
                              <button key={key} type="button" onClick={() => { setS('inventory_option', key); setErrors(e => ({ ...e, inventory_option:'' })); }}
                                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, textAlign:'left', cursor:'pointer', transition:'all 0.15s',
                                  background: sel.inventory_option===key ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                                  border:     sel.inventory_option===key ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                                }}>
                                <p style={{ fontWeight:600, fontSize:13, color:'white' }}>{opt.label}</p>
                                <p style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', flexShrink:0, marginLeft:12 }}>
                                  {lowestPrice > 0 ? `from ₦${Number(lowestPrice).toLocaleString()}` : 'On request'}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                        {errors.inventory_option && <p style={{ color:'#fca5a5', fontSize:11, marginTop:6 }}>{errors.inventory_option}</p>}
                      </div>
                    )}

                    {/* Markets — shown once option selected */}
                    {sel.inventory_option && (
                      <div>
                        <label className="form-label">Market</label>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          {availableMarkets.map(m => {
                            const price = selectedOption?.markets?.[m]?.price;
                            return (
                              <button key={m} type="button" onClick={() => { setS('market', m); setErrors(e => ({ ...e, market:'' })); }}
                                style={{ padding:'8px 14px', borderRadius:20, cursor:'pointer', transition:'all 0.15s',
                                  background: sel.market===m ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                                  border:     sel.market===m ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                                }}>
                                <p style={{ fontSize:12, fontWeight:700, color: sel.market===m ? '#a5b4fc' : 'white' }}>{m.replaceAll('_',' ')}</p>
                                {price > 0 && <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>₦{Number(price).toLocaleString()}</p>}
                              </button>
                            );
                          })}
                        </div>
                        {errors.market && <p style={{ color:'#fca5a5', fontSize:11, marginTop:6 }}>{errors.market}</p>}
                      </div>
                    )}

                    {/* Date + Runs */}
                    {sel.market && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Start Date *</label>
                          <input type="date" value={sel.date} onChange={e => setS('date', e.target.value)}
                            style={{ width:'100%', padding:'11px 14px', borderRadius:12, fontSize:13, outline:'none', background: errors.date ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)', border: errors.date ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)', color:'white' }}/>
                          {errors.date && <p style={{ color:'#fca5a5', fontSize:11, marginTop:4 }}>{errors.date}</p>}
                        </div>
                        <div>
                          <label className="form-label">Number of Runs</label>
                          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:4 }}>
                            <button type="button" onClick={() => setS('runs', Math.max(1, runs-1))}
                              style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'rgba(255,255,255,0.05)', color:'white', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                            <div style={{ flex:1, textAlign:'center' }}>
                              <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:22, color:'white' }}>{runs}</p>
                              <p style={{ fontSize:10, color:'var(--text-muted)' }}>run{runs>1?'s':''}</p>
                            </div>
                            <button type="button" onClick={() => setS('runs', runs+1)}
                              style={{ width:36, height:36, borderRadius:10, border:'1px solid rgba(99,102,241,0.4)', background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price preview */}
                    {sel.market && unitPrice > 0 && (
                      <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                            {runs > 1 ? `₦${Number(unitPrice).toLocaleString()} × ${runs} runs` : 'Placement Cost'}
                          </p>
                          {discountLabel(runs) && (
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(34,197,94,0.15)', color:'#86efac', border:'1px solid rgba(34,197,94,0.25)' }}>
                              {discountLabel(runs)}
                            </span>
                          )}
                        </div>
                        {discount > 0 && (
                          <p style={{ fontSize:11, color:'var(--text-muted)', textDecoration:'line-through', marginBottom:2 }}>
                            ₦{Number(unitPrice * runs).toLocaleString()} original
                          </p>
                        )}
                        <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, color:'#a5b4fc' }}>
                          ₦{Number(finalPrice).toLocaleString()}
                        </p>
                        {runs >= 3 && runs < 5 && <p style={{ fontSize:10, color:'#fcd34d', marginTop:4 }}>Add {5-runs} more run{5-runs>1?'s':''} for 10% off</p>}
                        {runs >= 5 && runs < 10 && <p style={{ fontSize:10, color:'#fcd34d', marginTop:4 }}>Add {10-runs} more run{10-runs>1?'s':''} for 15% off</p>}
                        {runs >= 10 && runs < 20 && <p style={{ fontSize:10, color:'#fcd34d', marginTop:4 }}>Add {20-runs} more run{20-runs>1?'s':''} for 25% off</p>}
                      </div>
                    )}

                    {/* Add button */}
                    <button type="button" onClick={addItem} className="btn-primary w-full justify-center" style={{ padding:'12px' }}>
                      + Add to Campaign
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Campaign Cart */}
            {items.length > 0 && (
              <div style={{ padding:20, borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:15, color:'white' }}>
                      Campaign Cart
                      <span style={{ marginLeft:8, padding:'2px 8px', borderRadius:20, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:11, fontWeight:700 }}>
                        {items.length} item{items.length!==1?'s':''}
                      </span>
                    </p>
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Select more providers above to add to this campaign</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Total</p>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:22, color:'#a5b4fc' }}>₦{campaignTotal.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontWeight:600, fontSize:13, color:'white' }}>{displayName(item.mediaName)}</p>
                        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                          {item.optionLabel} · {item.market?.replaceAll('_',' ')}
                          {item.runs > 1 && <span style={{ marginLeft:6, padding:'2px 7px', borderRadius:20, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:10, fontWeight:700 }}>×{item.runs}</span>}
                        </p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, color: item.price>0?'#a5b4fc':'#fcd34d' }}>
                            {item.price>0?`₦${Number(item.price).toLocaleString()}`:'On request'}
                          </p>
                          {item.discount > 0 && <p style={{ fontSize:9, color:'#86efac', fontWeight:700 }}>{(item.discount*100).toFixed(0)}% off</p>}
                        </div>
                        <button type="button" onClick={() => setItems(p => p.filter((_,i)=>i!==idx))}
                          style={{ padding:'3px 8px', borderRadius:6, fontSize:11, background:'rgba(239,68,68,0.1)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)', cursor:'pointer' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {apiErr && <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:13, border:'1px solid rgba(239,68,68,0.18)' }}>{apiErr}</div>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ padding:'11px 20px' }}>← Back</button>
              <button type="button" onClick={() => { if (!items.length) { setApiErr('Add at least one item'); return; } setStep(3); }} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'11px' }}>
                Review Campaign →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: REVIEW & LAUNCH ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div style={{ padding:24, borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <h2 style={{ fontFamily:'Manrope,sans-serif', fontSize:18, fontWeight:700, color:'white', marginBottom:16 }}>Review Campaign</h2>

              <div style={{ marginBottom:16, padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Brief</p>
                <p style={{ fontWeight:600, color:'white' }}>{brief.brand_name}</p>
                <p style={{ fontSize:13, color:'var(--text-muted)' }}>{brief.email}</p>
                {brief.campaignBrief && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:6, lineHeight:1.6 }}>{brief.campaignBrief}</p>}
              </div>

              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
                Campaign Items ({items.length})
              </p>
              <div className="space-y-2 mb-5">
                {items.map((item, idx) => (
                  <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontWeight:600, fontSize:13, color:'white' }}>{displayName(item.mediaName)}</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                        {item.groupLabel} · {item.optionLabel} · {item.market?.replaceAll('_',' ')} · {item.date}
                        {item.runs > 1 && <span style={{ marginLeft:6, padding:'2px 7px', borderRadius:20, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:10, fontWeight:700 }}>×{item.runs} runs</span>}
                      </p>
                    </div>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, color: item.price>0?'#a5b4fc':'#fcd34d' }}>
                      {item.price>0?`₦${Number(item.price).toLocaleString()}`:'On request'}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:12, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
                <p style={{ fontWeight:700, color:'white' }}>Total Campaign Value</p>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:22, color:'#a5b4fc' }}>₦{campaignTotal.toLocaleString()}</p>
              </div>
            </div>

            {apiErr && <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:13, border:'1px solid rgba(239,68,68,0.18)' }}>{apiErr}</div>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ padding:'11px 20px' }}>← Edit</button>
              <button type="button" onClick={launch} disabled={submitting} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'11px' }}>
                {submitting ? <><Spinner size={14}/> Launching…</> : '🚀 Launch Campaign'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}