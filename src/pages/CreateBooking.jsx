import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { getMedia, createCampaign, getUploadUrl } from '../services/api';
import axios from 'axios';

const INIT_BRIEF     = { brand_name:'', email:'', campaignBrief:'', promotionFiles:[] };
const INIT_SELECTION = { mediaId:'', inventory_group:'', inventory_option:'', market:'', date:'', runs:1 };

const CAT_LABELS = {
  ALL:'All', TELEVISION:'TV', RADIO_AUDIO:'Radio', PODCASTS:'Podcasts',
  OUT_OF_HOME:'OOH', PRINT_MEDIA:'Print', INFLUENCERS:'Influencers',
  SOCIAL_MEDIA:'Social Media', MUSIC_PROMOTION:'Music Promo', LIVE_STREAMING:'Live Streaming',
};

const ROUTE_TO_EMAIL = ['SOCIAL_MEDIA','MUSIC_PROMOTION'];
const SPECIAL_EMAIL  = 'brandcastang@gmail.com';

const VOLUME_DISCOUNT = (r) => r>=20?.25:r>=10?.15:r>=5?.10:r>=3?.05:0;
const discountLabel   = (r) => { const d=VOLUME_DISCOUNT(r); return d>0?`${d*100}% off`:null; };

const DISPLAY_NAMES = {
  'BrandCasta Social Media':    'BrandCasta Social-Media Marketing',
  'BrandCasta Music Promotion': 'BrandCasta Music Promotion',
};
const dname = (n) => DISPLAY_NAMES[n]||n;

const parseInv = (raw) => { if(!raw) return {}; if(typeof raw==='string'){try{return JSON.parse(raw);}catch{return{};}} return raw; };

export default function CreateBooking() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [brief, setBrief]     = useState(INIT_BRIEF);
  const [sel, setSel]         = useState(INIT_SELECTION);
  const [media, setMedia]     = useState([]);
  const [loadingMedia, setLM] = useState(true);
  const [submitting, setSub]  = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiErr, setApiErr]   = useState('');
  const [toast, setToast]     = useState(null);
  const [items, setItems]     = useState([]);
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('ALL');

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
    const matchCat = catFilter==='ALL'||m.category===catFilter;
    const matchSearch = !search||m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });

  const addItem = () => {
    const e={};
    if(!sel.mediaId) e.mediaId='Select a media organisation';
    if(hasInventory){
      if(!sel.inventory_group) e.inventory_group='Select a group';
      if(!sel.inventory_option) e.inventory_option='Select an option';
      if(!sel.market) e.market='Select a market';
    }
    if(!sel.date) e.date='Select a date';
    if(Object.keys(e).length){setErrors(e);return;}
    setItems(prev=>[...prev,{mediaId:sel.mediaId,mediaName:selectedMedia?.name,category:selectedMedia?.category||'',inventory_group:sel.inventory_group,inventory_option:sel.inventory_option,groupLabel:selectedGroup?.label||sel.inventory_group,optionLabel:selectedOption?.label||sel.inventory_option,market:sel.market,date:sel.date,runs,price:finalPrice,unitPrice,discount}]);
    setToast({type:'success',message:runs>1?`×${runs} runs added`:'Added to campaign'});
    setTimeout(()=>setToast(null),2000);
    setSel(INIT_SELECTION);setErrors({});
  };

  const uploadFiles = async () => {
    if(!brief.promotionFiles?.length) return [];
    const out=[];
    for(const f of brief.promotionFiles){
      const signed=await getUploadUrl({fileName:f.name,fileType:f.type});
      await axios.put(signed.uploadUrl,f,{headers:{'Content-Type':f.type}});
      out.push({name:f.name,url:signed.fileUrl,type:f.type});
    }
    return out;
  };

  const launch = async () => {
    if(!items.length){setApiErr('Add at least one item');return;}
    setSub(true);setApiErr('');
    try{
      const files=await uploadFiles();
      const hasSpecial=items.some(i=>ROUTE_TO_EMAIL.includes(i.category));
      await createCampaign({brand_name:brief.brand_name.trim(),contactEmail:brief.email.trim(),campaignBrief:brief.campaignBrief,promotionFiles:files,items,...(hasSpecial?{routeTo:SPECIAL_EMAIL}:{})});
      setToast({type:'success',message:'Campaign launched!'});
      setTimeout(()=>navigate('/campaigns'),1800);
    }catch(e){setApiErr(e.message);}
    finally{setSub(false);}
  };

  const inp = (field) => ({
    width:'100%', padding:'9px 12px', borderRadius:8, fontSize:12, outline:'none', fontFamily:'Inter,sans-serif',
    background: errors[field]?'rgba(239,68,68,0.06)':'rgba(255,255,255,0.04)',
    border: errors[field]?'0.5px solid rgba(239,68,68,0.4)':'0.5px solid var(--border)',
    color:'white',
  });

  return (
    <>
      <PageTitle title="Create Campaign" description="Build and launch multi-platform media campaigns across Nigeria."/>
      <Layout title="Create Campaign" subtitle="Build and launch multi-platform media campaigns">
        {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

        <div style={{ maxWidth:740 }}>

          {/* Steps */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:22 }}>
            {['Brief','Build Campaign','Review'].map((label,i)=>{
              const s=i+1; const active=step===s; const done=s<step;
              return(
                <div key={s} style={{ display:'flex', alignItems:'center', flex:i<2?1:'none' }}>
                  <div onClick={()=>done&&setStep(s)} style={{ display:'flex', alignItems:'center', gap:7, cursor:done?'pointer':'default', flexShrink:0 }}>
                    <div style={{ width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,
                      background:done?'linear-gradient(135deg,#6366f1,#a855f7)':active?'var(--accent-soft)':'rgba(255,255,255,0.05)',
                      border:active?'0.5px solid var(--accent-border)':done?'none':'0.5px solid var(--border)',
                      color:done||active?'white':'var(--text-muted)' }}>
                      {done?'✓':s}
                    </div>
                    <span style={{ fontSize:12, fontWeight:500, color:active?'white':done?'var(--accent-light)':'var(--text-muted)' }}>{label}</span>
                  </div>
                  {i<2&&<div style={{ flex:1, height:'0.5px', background:done?'rgba(99,102,241,0.3)':'var(--border)', margin:'0 10px' }}/>}
                </div>
              );
            })}
          </div>

          {/* STEP 1 */}
          {step===1&&(
            <div className="page-card" style={{ padding:22 }}>
              <h2 style={{ fontFamily:'Manrope,sans-serif', fontSize:15, fontWeight:700, color:'white', marginBottom:4 }}>Campaign Brief</h2>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:20 }}>Tell us about the brand and campaign goals</p>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Brand Name *</label>
                  <input style={inp('brand_name')} placeholder="e.g. Indomie Nigeria" value={brief.brand_name} onChange={e=>setB('brand_name',e.target.value)}/>
                  {errors.brand_name&&<p style={{color:'#fca5a5',fontSize:11,marginTop:3}}>{errors.brand_name}</p>}
                </div>
                <div>
                  <label className="form-label">Contact Email *</label>
                  <input type="email" style={inp('email')} placeholder="brand@company.com" value={brief.email} onChange={e=>setB('email',e.target.value)}/>
                  {errors.email&&<p style={{color:'#fca5a5',fontSize:11,marginTop:3}}>{errors.email}</p>}
                </div>
                <div>
                  <label className="form-label">Campaign Brief</label>
                  <textarea rows={3} placeholder="Campaign goals, target audience, KPIs…" value={brief.campaignBrief} onChange={e=>setB('campaignBrief',e.target.value)} style={{...inp(''),resize:'vertical'}}/>
                </div>
                <div>
                  <label className="form-label">Promotion Files</label>
                  <input type="file" multiple onChange={e=>setB('promotionFiles',Array.from(e.target.files))} style={{...inp(''),padding:'8px 12px',cursor:'pointer'}}/>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
                <button onClick={()=>{
                  if(!brief.brand_name.trim()||!brief.email.trim()){setErrors({brand_name:!brief.brand_name.trim()?'Required':'',email:!brief.email.trim()?'Required':''});return;}
                  setStep(2);
                }} className="btn-primary" style={{ fontSize:12, padding:'8px 18px' }}>Next: Build Campaign →</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step===2&&(
            <div className="space-y-4">

              {/* Tip */}
              <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>🛒</span>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.65)', lineHeight:1.6 }}>
                  Select a provider, pick inventory and click <strong style={{color:'var(--accent-light)'}}>+ Add to Campaign</strong>. Add as many as you need before launching.
                </p>
              </div>

              {/* Media picker */}
              <div className="page-card" style={{ padding:16 }}>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white', marginBottom:12 }}>Select Media Organisation</p>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                  {Object.entries(CAT_LABELS).map(([key,label])=>(
                    <button key={key} onClick={()=>setCat(key)} style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                      background:catFilter===key?'var(--accent-soft)':'rgba(255,255,255,0.04)',
                      color:catFilter===key?'var(--accent-light)':'var(--text-muted)',
                      outline:catFilter===key?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
                    }}>{label}</button>
                  ))}
                </div>
                <input type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}
                  style={{ width:'100%', padding:'7px 11px', borderRadius:7, fontSize:12, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', marginBottom:10, fontFamily:'Inter,sans-serif' }}/>
                {errors.mediaId&&<p style={{color:'#fca5a5',fontSize:11,marginBottom:6}}>{errors.mediaId}</p>}
                {loadingMedia&&<div style={{color:'var(--text-muted)',fontSize:12,padding:'8px 0',display:'flex',gap:8,alignItems:'center'}}><Spinner size={12}/>Loading…</div>}
                <div style={{ maxHeight:240, overflowY:'auto', display:'grid', gap:5 }}>
                  {filteredMedia.map(m=>{
                    const id=m.mediaId??m.id??m._id;
                    const active=String(sel.mediaId)===String(id);
                    const inv=parseInv(m.inventory);
                    const hasInv=Object.keys(inv).length>0;
                    return(
                      <button key={id} type="button"
                        onClick={()=>{setS('mediaId',String(sel.mediaId)===String(id)?'':id);setErrors({});}}
                        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:8, textAlign:'left', cursor:'pointer',
                          background:active?'var(--accent-soft)':'rgba(255,255,255,0.025)',
                          border:active?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
                        }}>
                        <div>
                          <p style={{ fontWeight:500, fontSize:12, color:'white' }}>{dname(m.name)}</p>
                          <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{(m.category||'').replaceAll('_',' ')}</p>
                        </div>
                        <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, flexShrink:0,
                          background:hasInv?'rgba(34,197,94,0.1)':'rgba(245,158,11,0.08)',
                          color:hasInv?'#86efac':'#fcd34d' }}>
                          {hasInv?'Inventory set':'Quote'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inventory panel */}
              {sel.mediaId&&(
                <div className="page-card" style={{ padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:12, borderBottom:'0.5px solid var(--border)' }}>
                    <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'white',flexShrink:0 }}>
                      {selectedMedia?.name?.[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight:600, color:'white', fontSize:13 }}>{dname(selectedMedia?.name)}</p>
                      <p style={{ fontSize:10, color:'var(--text-muted)' }}>{(selectedMedia?.category||'').replaceAll('_',' ')}</p>
                    </div>
                  </div>

                  {!hasInventory?(
                    <div style={{ padding:14, borderRadius:9, background:'rgba(245,158,11,0.06)', border:'0.5px solid rgba(245,158,11,0.18)', textAlign:'center' }}>
                      <p style={{ fontWeight:600, color:'#fcd34d', marginBottom:6, fontSize:13 }}>Pricing on request</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12 }}>BrandCasta will get you a custom quote.</p>
                      <div style={{ marginBottom:10 }}>
                        <label className="form-label">Campaign Date *</label>
                        <input type="date" value={sel.date} onChange={e=>setS('date',e.target.value)} style={{ width:'100%', padding:'8px 11px', borderRadius:7, fontSize:12, outline:'none', background:'rgba(255,255,255,0.04)', border:'0.5px solid var(--border)', color:'white', marginBottom:10 }}/>
                      </div>
                      <button type="button" onClick={()=>{
                        if(!sel.date){setErrors({date:'Required'});return;}
                        setItems(prev=>[...prev,{mediaId:sel.mediaId,mediaName:selectedMedia?.name,category:selectedMedia?.category||'',inventory_group:'CUSTOM',inventory_option:'CUSTOM',groupLabel:'Custom Quote',optionLabel:'Pricing on request',market:'NATIONAL',date:sel.date,runs:1,price:0,unitPrice:0}]);
                        setToast({type:'success',message:`${selectedMedia?.name} added — BrandCasta will quote`});
                        setTimeout(()=>setToast(null),3000);
                        setSel(INIT_SELECTION);
                      }} className="btn-primary" style={{ fontSize:12, padding:'7px 16px' }}>Add & Request Quote</button>
                    </div>
                  ):(
                    <div className="space-y-4">
                      {/* Groups */}
                      <div>
                        <label className="form-label">Inventory Group</label>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:6 }}>
                          {Object.entries(inventory).map(([key,group])=>(
                            <button key={key} type="button" onClick={()=>{setS('inventory_group',key);setErrors(e=>({...e,inventory_group:''}));}}
                              style={{ padding:'10px 12px', borderRadius:8, textAlign:'left', cursor:'pointer',
                                background:sel.inventory_group===key?'var(--accent-soft)':'rgba(255,255,255,0.025)',
                                border:sel.inventory_group===key?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
                              }}>
                              <p style={{ fontWeight:600, fontSize:11, color:sel.inventory_group===key?'var(--accent-light)':'white', lineHeight:1.3 }}>{group.label}</p>
                              <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{Object.keys(group.options||{}).length} options</p>
                            </button>
                          ))}
                        </div>
                        {errors.inventory_group&&<p style={{color:'#fca5a5',fontSize:10,marginTop:5}}>{errors.inventory_group}</p>}
                      </div>

                      {/* Options */}
                      {sel.inventory_group&&(
                        <div>
                          <label className="form-label">Option</label>
                          <div style={{ display:'grid', gap:5 }}>
                            {Object.entries(inventoryOptions).map(([key,opt])=>{
                              const lowest=Math.min(...Object.values(opt.markets||{}).map(m=>m.price||0).filter(p=>p>0));
                              return(
                                <button key={key} type="button" onClick={()=>{setS('inventory_option',key);setErrors(e=>({...e,inventory_option:''}));}}
                                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:8, textAlign:'left', cursor:'pointer',
                                    background:sel.inventory_option===key?'var(--accent-soft)':'rgba(255,255,255,0.025)',
                                    border:sel.inventory_option===key?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
                                  }}>
                                  <p style={{ fontWeight:500, fontSize:12, color:'white' }}>{opt.label}</p>
                                  <p style={{ fontSize:11, fontWeight:500, color:'var(--accent-light)', flexShrink:0, marginLeft:10 }}>
                                    {lowest>0?`from ₦${Number(lowest).toLocaleString()}`:'On request'}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                          {errors.inventory_option&&<p style={{color:'#fca5a5',fontSize:10,marginTop:5}}>{errors.inventory_option}</p>}
                        </div>
                      )}

                      {/* Markets */}
                      {sel.inventory_option&&(
                        <div>
                          <label className="form-label">Market</label>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                            {availableMarkets.map(m=>{
                              const price=selectedOption?.markets?.[m]?.price;
                              return(
                                <button key={m} type="button" onClick={()=>{setS('market',m);setErrors(e=>({...e,market:''}));}}
                                  style={{ padding:'7px 12px', borderRadius:20, cursor:'pointer',
                                    background:sel.market===m?'var(--accent-soft)':'rgba(255,255,255,0.04)',
                                    border:sel.market===m?'0.5px solid var(--accent-border)':'0.5px solid var(--border)',
                                  }}>
                                  <p style={{ fontSize:11, fontWeight:500, color:sel.market===m?'var(--accent-light)':'white' }}>{m.replaceAll('_',' ')}</p>
                                  {price>0&&<p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>₦{Number(price).toLocaleString()}</p>}
                                </button>
                              );
                            })}
                          </div>
                          {errors.market&&<p style={{color:'#fca5a5',fontSize:10,marginTop:5}}>{errors.market}</p>}
                        </div>
                      )}

                      {/* Date + Runs */}
                      {sel.market&&(
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                          <div>
                            <label className="form-label">Start Date *</label>
                            <input type="date" value={sel.date} onChange={e=>setS('date',e.target.value)}
                              style={{ width:'100%', padding:'8px 11px', borderRadius:7, fontSize:12, outline:'none', background:errors.date?'rgba(239,68,68,0.06)':'rgba(255,255,255,0.04)', border:errors.date?'0.5px solid rgba(239,68,68,0.4)':'0.5px solid var(--border)', color:'white' }}/>
                            {errors.date&&<p style={{color:'#fca5a5',fontSize:10,marginTop:4}}>{errors.date}</p>}
                          </div>
                          <div>
                            <label className="form-label">Runs</label>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                              <button type="button" onClick={()=>setS('runs',Math.max(1,runs-1))}
                                style={{ width:32,height:32,borderRadius:7,border:'0.5px solid var(--border)',background:'rgba(255,255,255,0.04)',color:'white',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>−</button>
                              <div style={{ flex:1, textAlign:'center' }}>
                                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:18, color:'white' }}>{runs}</p>
                                <p style={{ fontSize:9, color:'var(--text-muted)' }}>run{runs>1?'s':''}</p>
                              </div>
                              <button type="button" onClick={()=>setS('runs',runs+1)}
                                style={{ width:32,height:32,borderRadius:7,border:'0.5px solid var(--accent-border)',background:'var(--accent-soft)',color:'var(--accent-light)',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Price preview */}
                      {sel.market&&unitPrice>0&&(
                        <div style={{ padding:'12px 16px', borderRadius:9, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                            <p style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                              {runs>1?`₦${Number(unitPrice).toLocaleString()} × ${runs} runs`:'Placement Cost'}
                            </p>
                            {discountLabel(runs)&&<span style={{ fontSize:9,fontWeight:600,padding:'2px 7px',borderRadius:20,background:'rgba(34,197,94,0.12)',color:'#86efac',border:'0.5px solid rgba(34,197,94,0.2)' }}>{discountLabel(runs)}</span>}
                          </div>
                          {discount>0&&<p style={{ fontSize:10, color:'var(--text-muted)', textDecoration:'line-through', marginBottom:1 }}>₦{Number(unitPrice*runs).toLocaleString()}</p>}
                          <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:24, color:'var(--accent-light)' }}>₦{Number(finalPrice).toLocaleString()}</p>
                          {runs>=3&&runs<5&&<p style={{ fontSize:10,color:'#fcd34d',marginTop:3 }}>Add {5-runs} more run{5-runs>1?'s':''} for 10% off</p>}
                          {runs>=5&&runs<10&&<p style={{ fontSize:10,color:'#fcd34d',marginTop:3 }}>Add {10-runs} more for 15% off</p>}
                        </div>
                      )}

                      <button type="button" onClick={addItem} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'10px', fontSize:13 }}>
                        + Add to Campaign
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cart */}
              {items.length>0&&(
                <div className="page-card" style={{ padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <div>
                      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:13, color:'white' }}>
                        Campaign Cart
                        <span style={{ marginLeft:8, padding:'1px 8px', borderRadius:20, background:'var(--accent-soft)', color:'var(--accent-light)', fontSize:10, fontWeight:600 }}>{items.length}</span>
                      </p>
                      <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>Add more providers above</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Total</p>
                      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:18, color:'var(--accent-light)' }}>₦{campaignTotal.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {items.map((item,idx)=>(
                      <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:8, background:'rgba(255,255,255,0.025)', border:'0.5px solid var(--border)' }}>
                        <div>
                          <p style={{ fontWeight:500, fontSize:12, color:'white' }}>{dname(item.mediaName)}</p>
                          <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>
                            {item.optionLabel} · {item.market?.replaceAll('_',' ')}
                            {item.runs>1&&<span style={{ marginLeft:5, padding:'1px 6px', borderRadius:20, background:'var(--accent-soft)', color:'var(--accent-light)', fontSize:9 }}>×{item.runs}</span>}
                          </p>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ textAlign:'right' }}>
                            <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:12, color:item.price>0?'var(--accent-light)':'#fcd34d' }}>
                              {item.price>0?`₦${Number(item.price).toLocaleString()}`:'On request'}
                            </p>
                            {item.discount>0&&<p style={{ fontSize:9, color:'#86efac' }}>{(item.discount*100).toFixed(0)}% off</p>}
                          </div>
                          <button type="button" onClick={()=>setItems(p=>p.filter((_,i)=>i!==idx))}
                            style={{ padding:'2px 7px', borderRadius:6, fontSize:10, background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'0.5px solid rgba(239,68,68,0.18)', cursor:'pointer' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add another prompt */}
              {items.length>0&&!sel.mediaId&&(
                <div style={{ padding:'12px 16px', borderRadius:9, background:'rgba(255,255,255,0.02)', border:'0.5px dashed rgba(99,102,241,0.25)', textAlign:'center' }}>
                  <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:7 }}>✅ {items.length} item{items.length>1?'s':''} added — want another provider?</p>
                  <button type="button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
                    style={{ fontSize:11, fontWeight:600, color:'var(--accent-light)', background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)', borderRadius:7, padding:'6px 14px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                    + Add Another Provider
                  </button>
                </div>
              )}

              {apiErr&&<div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(239,68,68,0.07)', color:'#fca5a5', fontSize:12, border:'0.5px solid rgba(239,68,68,0.18)' }}>{apiErr}</div>}

              <div style={{ display:'flex', gap:8 }}>
                <button type="button" onClick={()=>setStep(1)} className="btn-secondary" style={{ fontSize:12, padding:'9px 18px' }}>← Back</button>
                <button type="button" onClick={()=>{if(!items.length){setApiErr('Add at least one item');return;}setStep(3);}} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'9px', fontSize:12 }}>
                  Review Campaign →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step===3&&(
            <div className="space-y-4">
              <div className="page-card" style={{ padding:20 }}>
                <h2 style={{ fontFamily:'Manrope,sans-serif', fontSize:15, fontWeight:700, color:'white', marginBottom:16 }}>Review Campaign</h2>
                <div style={{ marginBottom:14, padding:'12px 14px', borderRadius:9, background:'rgba(255,255,255,0.025)', border:'0.5px solid var(--border)' }}>
                  <p style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Brief</p>
                  <p style={{ fontWeight:500, color:'white', fontSize:13 }}>{brief.brand_name}</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)' }}>{brief.email}</p>
                  {brief.campaignBrief&&<p style={{ fontSize:11, color:'var(--text-muted)', marginTop:5, lineHeight:1.6 }}>{brief.campaignBrief}</p>}
                </div>
                <p style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Items ({items.length})</p>
                <div className="space-y-2" style={{ marginBottom:14 }}>
                  {items.map((item,idx)=>(
                    <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.025)', border:'0.5px solid var(--border)' }}>
                      <div>
                        <p style={{ fontWeight:500, fontSize:12, color:'white' }}>{dname(item.mediaName)}</p>
                        <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{item.groupLabel} · {item.optionLabel} · {item.market?.replaceAll('_',' ')} · {item.date}{item.runs>1&&` · ×${item.runs}`}</p>
                      </div>
                      <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:12, color:item.price>0?'var(--accent-light)':'#fcd34d' }}>
                        {item.price>0?`₦${Number(item.price).toLocaleString()}`:'On request'}
                      </p>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:9, background:'var(--accent-soft)', border:'0.5px solid var(--accent-border)' }}>
                  <p style={{ fontWeight:600, color:'white', fontSize:13 }}>Total Campaign Value</p>
                  <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:20, color:'var(--accent-light)' }}>₦{campaignTotal.toLocaleString()}</p>
                </div>
              </div>
              {apiErr&&<div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(239,68,68,0.07)', color:'#fca5a5', fontSize:12, border:'0.5px solid rgba(239,68,68,0.18)' }}>{apiErr}</div>}
              <div style={{ display:'flex', gap:8 }}>
                <button type="button" onClick={()=>setStep(2)} className="btn-secondary" style={{ fontSize:12, padding:'9px 18px' }}>← Edit</button>
                <button type="button" onClick={launch} disabled={submitting} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'9px', fontSize:12 }}>
                  {submitting?<><Spinner size={13}/>Launching…</>:'🚀 Launch Campaign'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}