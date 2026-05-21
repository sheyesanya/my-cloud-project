import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { getMedia, createCampaign, getUploadUrl } from '../services/api';
import axios from 'axios';

const INIT = {
  brand_name: '', email: '', campaignBrief: '', promotionFiles: [],
  mediaId: '', inventory_group: '', inventory_option: '', market: '', date: '', runs: 1,
};

const CAT_LABELS = {
  ALL:'All', TELEVISION:'TV', RADIO_AUDIO:'Radio', PODCASTS:'Podcasts',
  OUT_OF_HOME:'OOH', PRINT_MEDIA:'Print', INFLUENCERS:'Influencers',
};

export default function CreateBooking() {
  const navigate = useNavigate();

  const [form, setForm]                   = useState(INIT);
  const [media, setMedia]                 = useState([]);
  const [loadingMedia, setLM]             = useState(true);
  const [submitting, setSub]              = useState(false);
  const [errors, setErrors]               = useState({});
  const [apiErr, setApiErr]               = useState('');
  const [toast, setToast]                 = useState(null);
  const [campaignItems, setCampaignItems] = useState([]);
  const [search, setSearch]               = useState('');
  const [categoryFilter, setCatFilter]    = useState('ALL');
  const [step, setStep]                   = useState(1);

  useEffect(() => {
    getMedia()
      .then((res) => setMedia(Array.isArray(res) ? res : res.media ?? res.data ?? []))
      .catch(console.error)
      .finally(() => setLM(false));
  }, []);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const selectedMedia     = media.find((m) => String(m.mediaId ?? m.id ?? m._id) === String(form.mediaId));

  // ── Read inventory from the selected provider's own record
  const providerInventory  = selectedMedia?.inventory || {};
  const inventoryGroups    = providerInventory;
  const selectedGroup      = inventoryGroups[form.inventory_group];
  const inventoryOptions   = selectedGroup?.options || {};
  const selectedOptionCfg  = inventoryOptions[form.inventory_option];
  const availableMarkets   = selectedOptionCfg ? Object.keys(selectedOptionCfg.markets || {}) : [];
  const unitPrice          = selectedOptionCfg?.markets?.[form.market]?.price ?? 0;
  const runs               = Math.max(1, Number(form.runs) || 1);
  const finalPrice         = unitPrice * runs;
  const campaignTotal      = campaignItems.reduce((s, i) => s + (i.price || 0), 0);

  const hasInventory = selectedMedia && Object.keys(providerInventory).length > 0;

  const filteredMedia = media.filter((m) => {
    const matchCat    = categoryFilter === 'ALL' || m.category === categoryFilter;
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const validate = () => {
    const e = {};
    if (!form.brand_name.trim()) e.brand_name = 'Required';
    if (!form.email.trim())      e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.mediaId)           e.mediaId = 'Select a media organisation';
    if (!form.inventory_group)   e.inventory_group = 'Select inventory group';
    if (!form.inventory_option)  e.inventory_option = 'Select inventory option';
    if (!form.market)            e.market = 'Select market';
    if (!form.date)              e.date = 'Select date';
    return e;
  };

  const addToCampaign = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setCampaignItems((prev) => [...prev, {
      mediaId: form.mediaId, mediaName: selectedMedia?.name,
      category: selectedMedia?.category || '',
      inventory_group: form.inventory_group,
      inventory_option: form.inventory_option,
      market: form.market, date: form.date,
      runs, price: finalPrice, unitPrice,
      groupLabel:  selectedGroup?.label || form.inventory_group,
      optionLabel: selectedOptionCfg?.label || form.inventory_option,
    }]);
    setToast({ type:'success', message: runs > 1 ? `Added ×${runs} runs to campaign` : 'Added to campaign' });
    setTimeout(() => setToast(null), 2500);
    setForm((prev) => ({ ...INIT, brand_name: prev.brand_name, email: prev.email, campaignBrief: prev.campaignBrief, promotionFiles: prev.promotionFiles }));
  };

  const removeCampaignItem = (idx) => setCampaignItems((p) => p.filter((_, i) => i !== idx));

  const uploadFiles = async () => {
    if (!form.promotionFiles?.length) return [];
    const out = [];
    for (const f of form.promotionFiles) {
      const signed = await getUploadUrl({ fileName: f.name, fileType: f.type });
      await axios.put(signed.uploadUrl, f, { headers: { 'Content-Type': f.type } });
      out.push({ name: f.name, url: signed.fileUrl, type: f.type });
    }
    return out;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (campaignItems.length === 0) { addToCampaign(); return; }
    const errs = {};
    if (!form.brand_name.trim()) errs.brand_name = 'Required';
    if (!form.email.trim())      errs.email = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSub(true); setApiErr('');
    try {
      const files = await uploadFiles();
      await createCampaign({
        brand_name: form.brand_name.trim(),
        contactEmail: form.email.trim(),
        campaignBrief: form.campaignBrief,
        promotionFiles: files,
        items: campaignItems,
      });
      setToast({ type:'success', message:'Campaign launched successfully!' });
      setTimeout(() => navigate('/campaigns'), 1800);
    } catch (e) { setApiErr(e.message); }
    finally    { setSub(false); }
  };

  const inp = (field) => ({
    width:'100%', padding:'12px 16px', borderRadius:12, fontSize:13, outline:'none',
    background: errors[field] ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)',
    border: errors[field] ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)',
    color:'white', transition:'all 0.15s',
  });

  const stepDone = (s) => s < step;

  return (
    <Layout title="Create Campaign" subtitle="Build and launch multi-platform media campaigns">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      <div className="max-w-3xl">

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28 }}>
          {['Brief', 'Select Media', 'Inventory'].map((label, i) => {
            const s = i + 1;
            const active = step === s;
            const done   = stepDone(s);
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', flex: i < 2 ? 1 : 'none' }}>
                <div onClick={() => setStep(s)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', flexShrink:0 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, transition:'all 0.2s',
                    background: done ? 'linear-gradient(135deg,#6366f1,#a855f7)' : active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    border: active ? '1px solid rgba(99,102,241,0.5)' : done ? 'none' : '1px solid var(--border)',
                    color: done || active ? 'white' : 'var(--text-muted)',
                  }}>
                    {done ? '✓' : s}
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color: active ? 'white' : done ? 'var(--accent-light)' : 'var(--text-muted)' }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex:1, height:1, background: done ? 'rgba(99,102,241,0.4)' : 'var(--border)', margin:'0 12px' }}/>}
              </div>
            );
          })}
        </div>

        <form onSubmit={submit}>

          {/* ── STEP 1: BRIEF ── */}
          {step === 1 && (
            <div className="page-card" style={{ padding:28 }}>
              <h2 style={{ fontFamily:'Manrope,sans-serif', fontSize:18, fontWeight:700, color:'white', marginBottom:6 }}>Campaign Brief</h2>
              <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>Tell us about the brand and campaign goals</p>
              <div className="space-y-5">
                <div>
                  <label className="form-label">Brand Name *</label>
                  <input style={inp('brand_name')} placeholder="e.g. Indomie Nigeria" value={form.brand_name} onChange={(e) => set('brand_name', e.target.value)}/>
                  {errors.brand_name && <p style={{ color:'#fca5a5', fontSize:11, marginTop:5 }}>{errors.brand_name}</p>}
                </div>
                <div>
                  <label className="form-label">Contact Email *</label>
                  <input type="email" style={inp('email')} placeholder="brand@company.com" value={form.email} onChange={(e) => set('email', e.target.value)}/>
                  {errors.email && <p style={{ color:'#fca5a5', fontSize:11, marginTop:5 }}>{errors.email}</p>}
                </div>
                <div>
                  <label className="form-label">Campaign Brief</label>
                  <textarea rows={5} placeholder="Describe campaign goals, target audience, KPIs, creative direction..." value={form.campaignBrief} onChange={(e) => set('campaignBrief', e.target.value)} style={{ ...inp(), resize:'vertical' }}/>
                </div>
                <div>
                  <label className="form-label">Promotion Files</label>
                  <input type="file" multiple onChange={(e) => set('promotionFiles', Array.from(e.target.files))} style={{ ...inp(), padding:'10px 14px', cursor:'pointer' }}/>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>Upload: decks, creatives, videos, PDFs, brand assets</p>
                  {form.promotionFiles?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {form.promotionFiles.map((f, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:10, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)' }}>
                          <p style={{ fontSize:12, fontWeight:500, color:'var(--accent-light)' }}>{f.name}</p>
                          <p style={{ fontSize:11, color:'var(--text-muted)', marginLeft:'auto' }}>{(f.size/1024).toFixed(0)} KB</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" onClick={() => {
                  if (!form.brand_name.trim()) { setErrors({ brand_name:'Required' }); return; }
                  if (!form.email.trim())      { setErrors({ email:'Required' }); return; }
                  setStep(2);
                }} className="btn-primary" style={{ padding:'11px 24px' }}>
                  Next: Select Media →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: SELECT MEDIA ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="page-card" style={{ padding:'16px 20px' }}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.entries(CAT_LABELS).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setCatFilter(key)}
                      style={{ padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
                        background: categoryFilter === key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                        color:       categoryFilter === key ? '#a5b4fc' : 'var(--text-muted)',
                        border:      categoryFilter === key ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
                      }}>{label}</button>
                  ))}
                </div>
                <input type="text" placeholder="Search media organisations..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inp(), padding:'10px 14px' }}/>
              </div>

              {errors.mediaId && <p style={{ color:'#fca5a5', fontSize:12, padding:'0 4px' }}>{errors.mediaId}</p>}
              {loadingMedia && <div className="flex items-center gap-2 p-4" style={{ color:'var(--text-muted)', fontSize:13 }}><Spinner size={16}/> Loading media…</div>}
              {!loadingMedia && filteredMedia.length === 0 && <div style={{ padding:'24px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No media matching your filters.</div>}

              <div className="grid grid-cols-1 gap-3">
                {filteredMedia.map((m) => {
                  const id     = m.mediaId ?? m.id ?? m._id;
                  const active = String(form.mediaId) === String(id);
                  const hasInv = m.inventory && Object.keys(m.inventory).length > 0;
                  return (
                    <button key={id} type="button" onClick={() => { set('mediaId', id); set('inventory_group',''); set('inventory_option',''); set('market',''); }}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderRadius:'var(--radius-lg)', textAlign:'left', cursor:'pointer', transition:'all 0.15s',
                        background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                        border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                      }}>
                      <div>
                        <p style={{ fontWeight:700, fontSize:14, color:'white' }}>{m.name}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                          <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600 }}>{m.category?.replaceAll('_',' ')}</p>
                          {hasInv && <span style={{ padding:'2px 7px', borderRadius:20, fontSize:9, fontWeight:700, background:'rgba(34,197,94,0.1)', color:'#86efac', border:'1px solid rgba(34,197,94,0.2)' }}>Inventory available</span>}
                          {!hasInv && <span style={{ padding:'2px 7px', borderRadius:20, fontSize:9, fontWeight:700, background:'rgba(245,158,11,0.1)', color:'#fcd34d', border:'1px solid rgba(245,158,11,0.2)' }}>Pricing on request</span>}
                        </div>
                      </div>
                      {active && <div style={{ width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ padding:'11px 20px' }}>← Back</button>
                <button type="button" onClick={() => {
                  if (!form.mediaId) { setErrors({ mediaId:'Select a media organisation' }); return; }
                  setStep(3);
                }} className="btn-primary" style={{ padding:'11px 24px' }}>
                  Next: Inventory →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: INVENTORY ── */}
          {step === 3 && (
            <div className="space-y-4">

              {selectedMedia && (
                <div style={{ padding:'14px 18px', borderRadius:'var(--radius-lg)', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white', flexShrink:0 }}>{selectedMedia.name[0]}</div>
                  <div>
                    <p style={{ fontWeight:700, color:'white', fontSize:14 }}>{selectedMedia.name}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{selectedMedia.category?.replaceAll('_',' ')}</p>
                  </div>
                  <button type="button" onClick={() => setStep(2)} style={{ marginLeft:'auto', fontSize:11, color:'var(--accent-light)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Change</button>
                </div>
              )}

              {!hasInventory && (
                <div style={{ padding:'20px', borderRadius:12, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', textAlign:'center' }}>
                  <p style={{ fontWeight:700, color:'#fcd34d', marginBottom:8 }}>Pricing on request</p>
                  <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
                    This provider hasn't set up their inventory yet. Add them to your campaign and BrandCasta will reach out to get a custom quote.
                  </p>
                  <button type="button" onClick={() => {
                    setCampaignItems(prev => [...prev, { mediaId: form.mediaId, mediaName: selectedMedia?.name, category: selectedMedia?.category || '', inventory_group:'CUSTOM', inventory_option:'CUSTOM', market:'NATIONAL', date: form.date || new Date().toISOString().split('T')[0], runs:1, price:0, unitPrice:0, groupLabel:'Custom Quote', optionLabel:'Pricing on request' }]);
                    setToast({ type:'success', message:`${selectedMedia?.name} added — BrandCasta will get a quote` });
                    setTimeout(() => setToast(null), 3000);
                    setForm(prev => ({ ...INIT, brand_name: prev.brand_name, email: prev.email, campaignBrief: prev.campaignBrief, promotionFiles: prev.promotionFiles }));
                  }} className="btn-primary" style={{ marginTop:14, padding:'10px 20px', fontSize:13 }}>
                    Add & Request Quote
                  </button>
                </div>
              )}

              {hasInventory && (
                <div className="page-card" style={{ padding:22 }}>
                  <div className="space-y-4">

                    {/* Inventory Group */}
                    <div>
                      <label className="form-label">Inventory Group *</label>
                      <select style={inp('inventory_group')} value={form.inventory_group} onChange={(e) => { set('inventory_group', e.target.value); set('inventory_option',''); set('market',''); }}>
                        <option value="">Select inventory group</option>
                        {Object.entries(inventoryGroups).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      {errors.inventory_group && <p style={{ color:'#fca5a5', fontSize:11, marginTop:5 }}>{errors.inventory_group}</p>}
                    </div>

                    {/* Inventory Option */}
                    {form.inventory_group && (
                      <div>
                        <label className="form-label">Inventory Option *</label>
                        <select style={inp('inventory_option')} value={form.inventory_option} onChange={(e) => { set('inventory_option', e.target.value); set('market',''); }}>
                          <option value="">Select option</option>
                          {Object.entries(inventoryOptions).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        {errors.inventory_option && <p style={{ color:'#fca5a5', fontSize:11, marginTop:5 }}>{errors.inventory_option}</p>}
                      </div>
                    )}

                    {/* Market */}
                    {form.inventory_option && (
                      <div>
                        <label className="form-label">Market *</label>
                        <select style={inp('market')} value={form.market} onChange={(e) => set('market', e.target.value)}>
                          <option value="">Select market</option>
                          {availableMarkets.map((m) => <option key={m} value={m}>{m.replaceAll('_',' ')}</option>)}
                        </select>
                        {errors.market && <p style={{ color:'#fca5a5', fontSize:11, marginTop:5 }}>{errors.market}</p>}
                      </div>
                    )}

                    {/* Date */}
                    <div>
                      <label className="form-label">Campaign Start Date *</label>
                      <input type="date" style={inp('date')} value={form.date} onChange={(e) => set('date', e.target.value)}/>
                      {errors.date && <p style={{ color:'#fca5a5', fontSize:11, marginTop:5 }}>{errors.date}</p>}
                    </div>

                    {/* Runs */}
                    {form.market && (
                      <div>
                        <label className="form-label">How many times should this run?</label>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10 }}>Each run = one broadcast or placement.</p>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <button type="button" onClick={() => set('runs', Math.max(1, runs - 1))}
                            style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'rgba(255,255,255,0.05)', color:'white', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>−</button>
                          <div style={{ flex:1, textAlign:'center' }}>
                            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, color:'white', lineHeight:1 }}>{runs}</p>
                            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{runs === 1 ? 'run' : 'runs'}</p>
                          </div>
                          <button type="button" onClick={() => set('runs', runs + 1)}
                            style={{ width:36, height:36, borderRadius:10, border:'1px solid rgba(99,102,241,0.4)', background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>+</button>
                        </div>
                      </div>
                    )}

                    {/* Price preview */}
                    {form.market && (
                      <div style={{ padding:'16px 18px', borderRadius:'var(--radius-md)', background: unitPrice > 0 ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.08)', border: unitPrice > 0 ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(245,158,11,0.2)' }}>
                        {unitPrice > 0 ? (
                          <>
                            <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>
                              {runs > 1 ? `₦${Number(unitPrice).toLocaleString()} × ${runs} runs` : 'Placement Cost'}
                            </p>
                            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:28, color:'#a5b4fc', letterSpacing:'-0.5px' }}>
                              ₦{Number(finalPrice).toLocaleString()}
                            </p>
                            {runs > 1 && <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>₦{Number(unitPrice).toLocaleString()} per run</p>}
                          </>
                        ) : (
                          <p style={{ fontSize:13, color:'#fcd34d', fontWeight:600 }}>Pricing on request for this market.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Campaign Cart */}
              {campaignItems.length > 0 && (
                <div className="page-card" style={{ padding:20 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <div>
                      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:16, color:'white' }}>Campaign Cart</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{campaignItems.length} item{campaignItems.length !== 1 ? 's' : ''}</p>
                    </div>
                    <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:20, color:'#a5b4fc' }}>₦{campaignTotal.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    {campaignItems.map((item, idx) => (
                      <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                        <div>
                          <p style={{ fontWeight:600, fontSize:13, color:'white' }}>{item.mediaName}</p>
                          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                            {item.optionLabel} · {item.market?.replaceAll('_',' ')}
                            {item.runs > 1 && <span style={{ marginLeft:6, padding:'2px 8px', borderRadius:20, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:10, fontWeight:700 }}>×{item.runs} runs</span>}
                          </p>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:14, color: item.price > 0 ? '#a5b4fc' : '#fcd34d' }}>
                            {item.price > 0 ? `₦${Number(item.price).toLocaleString()}` : 'On request'}
                          </p>
                          <button type="button" onClick={() => removeCampaignItem(idx)} className="btn-danger" style={{ padding:'4px 10px', fontSize:11 }}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {apiErr && (
                <div style={{ padding:'12px 16px', borderRadius:'var(--radius-md)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:13, border:'1px solid rgba(239,68,68,0.18)' }}>
                  {apiErr}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ padding:'11px 20px' }}>← Back</button>
                {hasInventory && (
                  <button type="button" onClick={addToCampaign} className="btn-secondary" style={{ flex:1, justifyContent:'center', padding:'11px' }}>
                    + Add Another Item
                  </button>
                )}
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'11px' }}>
                  {submitting ? <><Spinner size={14}/> Launching…</> : `Launch Campaign${campaignItems.length > 0 ? ` (${campaignItems.length})` : ''}`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}