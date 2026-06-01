import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`,'Content-Type':'application/json'}:{}; };
const fmt = n => n>0?`₦${Number(n).toLocaleString('en-NG')}`:'On request';
const VOLUME = r => r>=20?.25:r>=10?.15:r>=5?.10:r>=3?.05:0;
const parseInv = raw => { if(!raw)return{}; if(typeof raw==='string'){try{return JSON.parse(raw);}catch{return{};}} return raw; };

const CAT_LABELS = {ALL:'All',TELEVISION:'TV',RADIO_AUDIO:'Radio',PODCASTS:'Podcasts',OUT_OF_HOME:'OOH',PRINT_MEDIA:'Print',INFLUENCERS:'Influencers',SOCIAL_MEDIA:'Social Media',MUSIC_PROMOTION:'Music Promo',LIVE_STREAMING:'Live Streaming'};
const STEPS = ['Brief','Build Campaign','Review'];

export default function CreateBooking() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [brief, setBrief]       = useState({brand_name:'',email:'',campaignBrief:''});
  const [sel, setSel]           = useState({mediaId:'',inventory_group:'',inventory_option:'',market:'',date:'',runs:1});
  const [media, setMedia]       = useState([]);
  const [loadingMedia, setLM]   = useState(true);
  const [submitting, setSub]    = useState(false);
  const [items, setItems]       = useState([]);
  const [errors, setErrors]     = useState({});
  const [apiErr, setApiErr]     = useState('');
  const [search, setSearch]     = useState('');
  const [catFilter, setCat]     = useState('ALL');

  useEffect(()=>{
    (async()=>{
      try { const hd=await h(); const r=await axios.get(`${API}/media`,{headers:hd}); setMedia(Array.isArray(r.data)?r.data:r.data?.media??[]); }
      catch(e){console.error(e);}
      finally{setLM(false);}
    })();
  },[]);

  const setS = (k,v) => setSel(f=>({...f,[k]:v,...(k==='mediaId'?{inventory_group:'',inventory_option:'',market:''}:{}),...(k==='inventory_group'?{inventory_option:'',market:''}:{}),...(k==='inventory_option'?{market:''}:{})}));

  const selectedMedia   = media.find(m=>String(m.mediaId??m.id??m._id)===String(sel.mediaId));
  const inventory       = parseInv(selectedMedia?.inventory);
  const hasInventory    = Object.keys(inventory).length>0;
  const selectedGroup   = inventory[sel.inventory_group];
  const inventoryOptions= selectedGroup?.options||{};
  const selectedOption  = inventoryOptions[sel.inventory_option];
  const availableMarkets= selectedOption?Object.keys(selectedOption.markets||{}):[];
  const unitPrice       = selectedOption?.markets?.[sel.market]?.price??0;
  const runs            = Math.max(1,Number(sel.runs)||1);
  const discount        = VOLUME(runs);
  const finalPrice      = Math.round(unitPrice*runs*(1-discount));
  const campaignTotal   = items.reduce((s,i)=>s+(i.price||0),0);

  const filteredMedia = media.filter(m=>{
    const matchCat   = catFilter==='ALL'||m.category===catFilter;
    const matchSearch= !search||m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });

  const addItem = () => {
    const e={};
    if(!sel.mediaId)e.mediaId='Select a media organisation';
    if(hasInventory){if(!sel.inventory_group)e.inventory_group='Required';if(!sel.inventory_option)e.inventory_option='Required';if(!sel.market)e.market='Required';}
    if(!sel.date)e.date='Select a date';
    if(Object.keys(e).length){setErrors(e);return;}
    setItems(prev=>[...prev,{mediaId:sel.mediaId,mediaName:selectedMedia?.name,category:selectedMedia?.category||'',inventory_group:sel.inventory_group,inventory_option:sel.inventory_option,groupLabel:selectedGroup?.label||sel.inventory_group,optionLabel:selectedOption?.label||sel.inventory_option,market:sel.market,date:sel.date,runs,price:finalPrice||0,unitPrice,discount}]);
    setSel({mediaId:'',inventory_group:'',inventory_option:'',market:'',date:'',runs:1});setErrors({});
  };

  const launch = async () => {
    if(!items.length){setApiErr('Add at least one item');return;}
    setSub(true);setApiErr('');
    try {
      const hd=await h();
      await axios.post(`${API}/campaigns`,{brand_name:brief.brand_name.trim(),contactEmail:brief.email.trim(),campaignBrief:brief.campaignBrief,items},{headers:hd});
      navigate('/campaigns');
    } catch(e){setApiErr(e.message);}
    finally{setSub(false);}
  };

  const inp = {width:'100%',border:'1px solid #e1e4f0',padding:'9px 12px',fontFamily:'Inter,sans-serif',fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:12,borderRadius:0};
  const label = {fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.12em',color:'#464554',display:'block',marginBottom:6};

  return (
    <Layout title="Create Campaign" subtitle="Campaign Booking">
      <div style={{maxWidth:720}}>
        {/* Progress */}
        <div style={{height:2,background:'#e1e4f0',marginBottom:28,position:'relative'}}>
          <div style={{position:'absolute',top:0,left:0,height:'100%',background:'#4338ca',width:`${(step/3)*100}%`,transition:'width 0.5s ease'}}/>
        </div>

        {/* Step header */}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#4338ca',textTransform:'uppercase',letterSpacing:'0.16em',marginBottom:4}}>Step {step} of {STEPS.length}</div>
          <h2 style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:20,color:'#131b2e',letterSpacing:'-0.4px'}}>{STEPS[step-1]}</h2>
        </div>

        {/* STEP 1 */}
        {step===1&&(
          <div>
            <div style={{background:'white',border:'1px solid #e1e4f0',padding:24,marginBottom:16}}>
              <label style={label}>Brand Name *</label>
              <input style={{...inp,borderColor:errors.brand_name?'#fecaca':undefined}} placeholder="e.g. Indomie Nigeria" value={brief.brand_name} onChange={e=>setBrief(f=>({...f,brand_name:e.target.value}))}/>
              {errors.brand_name&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:-6,marginBottom:8}}>{errors.brand_name}</div>}

              <label style={label}>Contact Email *</label>
              <input type="email" style={{...inp,borderColor:errors.email?'#fecaca':undefined}} placeholder="brand@company.com" value={brief.email} onChange={e=>setBrief(f=>({...f,email:e.target.value}))}/>
              {errors.email&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:-6,marginBottom:8}}>{errors.email}</div>}

              <label style={label}>Campaign Brief</label>
              <textarea rows={3} style={{...inp,resize:'vertical',fontFamily:'Inter,sans-serif'}} placeholder="Campaign goals, target audience, KPIs…" value={brief.campaignBrief} onChange={e=>setBrief(f=>({...f,campaignBrief:e.target.value}))}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button onClick={()=>{ if(!brief.brand_name.trim()||!brief.email.trim()){setErrors({brand_name:!brief.brand_name.trim()?'Required':'',email:!brief.email.trim()?'Required':''});return;} setStep(2); }}
                style={{padding:'10px 24px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:'pointer'}}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step===2&&(
          <div>
            <div style={{padding:'10px 14px',background:'#eef2ff',border:'1px solid #c7d2fe',borderLeft:'2px solid #4338ca',marginBottom:16}}>
              <p style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#4338ca',lineHeight:1.6}}>Select a provider → pick inventory → click <strong>+ Add to Campaign</strong>. Add as many as you need.</p>
            </div>

            {/* Media picker */}
            <div style={{background:'white',border:'1px solid #e1e4f0',padding:16,marginBottom:16}}>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.14em',color:'#464554',marginBottom:12}}>Select Media Organisation</div>

              {/* Category tabs */}
              <div style={{display:'flex',borderBottom:'1px solid #e1e4f0',marginBottom:10,overflowX:'auto'}}>
                {Object.entries(CAT_LABELS).map(([key,lbl])=>(
                  <button key={key} onClick={()=>setCat(key)} style={{padding:'6px 12px',background:'none',border:'none',cursor:'pointer',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap',color:catFilter===key?'#4338ca':'#464554',borderBottom:catFilter===key?'2px solid #4338ca':'2px solid transparent',marginBottom:-1}}>{lbl}</button>
                ))}
              </div>

              <input type="text" placeholder="Search providers…" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:10}}/>
              {errors.mediaId&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginBottom:8}}>{errors.mediaId}</div>}
              {loadingMedia&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586'}}>Loading…</div>}

              <div style={{maxHeight:220,overflowY:'auto',display:'flex',flexDirection:'column',gap:3}}>
                {filteredMedia.map(m=>{
                  const id=m.mediaId??m.id??m._id;
                  const active=String(sel.mediaId)===String(id);
                  const inv=parseInv(m.inventory);
                  const hasInv=Object.keys(inv).length>0;
                  return (
                    <button key={id} type="button" onClick={()=>{setS('mediaId',String(sel.mediaId)===String(id)?'':id);setErrors({});}}
                      style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',textAlign:'left',cursor:'pointer',transition:'all 0.15s',border:`1px solid ${active?'#c7d2fe':'#f2f3ff'}`,background:active?'#eef2ff':'transparent',borderLeft:`2px solid ${active?'#4338ca':'transparent'}`}}>
                      <div>
                        <div style={{fontFamily:'Manrope,sans-serif',fontWeight:500,fontSize:12,color:'#131b2e'}}>{m.name}</div>
                        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>{(m.category||'').replaceAll('_',' ')}</div>
                      </div>
                      <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,padding:'2px 7px',background:hasInv?'#f0fdf4':'#fffbeb',color:hasInv?'#16a34a':'#d97706',letterSpacing:'0.06em'}}>{hasInv?'Set':'Quote'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inventory selector */}
            {sel.mediaId&&(
              <div style={{background:'white',border:'1px solid #e1e4f0',padding:16,marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,paddingBottom:12,borderBottom:'1px solid #e1e4f0'}}>
                  <div style={{width:32,height:32,background:'#4338ca',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,flexShrink:0}}>{selectedMedia?.name?.[0]}</div>
                  <div>
                    <div style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:'#131b2e'}}>{selectedMedia?.name}</div>
                    <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586'}}>{(selectedMedia?.category||'').replaceAll('_',' ')}</div>
                  </div>
                </div>

                {!hasInventory?(
                  <div style={{padding:14,background:'#fffbeb',border:'1px solid #fde68a',textAlign:'center'}}>
                    <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>Pricing on request</div>
                    <p style={{fontSize:11,color:'#464554',marginBottom:12}}>BrandCasta will get you a custom quote within 24hrs.</p>
                    <label style={{...label,textAlign:'left',display:'block'}}>Campaign Date *</label>
                    <input type="date" value={sel.date} onChange={e=>setS('date',e.target.value)} style={inp}/>
                    <button onClick={()=>{if(!sel.date){setErrors({date:'Required'});return;} setItems(prev=>[...prev,{mediaId:sel.mediaId,mediaName:selectedMedia?.name,category:selectedMedia?.category||'',inventory_group:'CUSTOM',inventory_option:'CUSTOM',groupLabel:'Custom Quote',optionLabel:'Pricing on request',market:'NATIONAL',date:sel.date,runs:1,price:0,unitPrice:0}]); setS('mediaId','');}} style={{padding:'8px 16px',background:'#4338ca',color:'white',border:'none',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer'}}>Add & Request Quote</button>
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>
                    {/* Groups */}
                    <div>
                      <label style={label}>Inventory Group</label>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:6}}>
                        {Object.entries(inventory).map(([key,group])=>(
                          <button key={key} type="button" onClick={()=>{setS('inventory_group',key);setErrors(e=>({...e,inventory_group:''}));}}
                            style={{padding:'10px 12px',textAlign:'left',cursor:'pointer',border:`1px solid ${sel.inventory_group===key?'#c7d2fe':'#e1e4f0'}`,background:sel.inventory_group===key?'#eef2ff':'white',borderTop:`2px solid ${sel.inventory_group===key?'#4338ca':'transparent'}`}}>
                            <div style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:12,color:sel.inventory_group===key?'#4338ca':'#131b2e'}}>{group.label}</div>
                            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:2}}>{Object.keys(group.options||{}).length} options</div>
                          </button>
                        ))}
                      </div>
                      {errors.inventory_group&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:4}}>{errors.inventory_group}</div>}
                    </div>

                    {/* Options */}
                    {sel.inventory_group&&(
                      <div>
                        <label style={label}>Option</label>
                        {Object.entries(inventoryOptions).map(([key,opt])=>{
                          const lowest=Math.min(...Object.values(opt.markets||{}).map(m=>m.price||0).filter(p=>p>0));
                          return (
                            <button key={key} type="button" onClick={()=>{setS('inventory_option',key);setErrors(e=>({...e,inventory_option:''}));}}
                              style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',textAlign:'left',cursor:'pointer',border:`1px solid ${sel.inventory_option===key?'#c7d2fe':'#e1e4f0'}`,background:sel.inventory_option===key?'#eef2ff':'transparent',borderLeft:`2px solid ${sel.inventory_option===key?'#4338ca':'transparent'}`,marginBottom:4,width:'100%'}}>
                              <span style={{fontFamily:'Manrope,sans-serif',fontWeight:500,fontSize:12,color:'#131b2e'}}>{opt.label}</span>
                              <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#4338ca',flexShrink:0,marginLeft:10}}>{lowest>0?`₦${Number(lowest).toLocaleString()}`:'On request'}</span>
                            </button>
                          );
                        })}
                        {errors.inventory_option&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:4}}>{errors.inventory_option}</div>}
                      </div>
                    )}

                    {/* Markets */}
                    {sel.inventory_option&&(
                      <div>
                        <label style={label}>Market</label>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {availableMarkets.map(m=>(
                            <button key={m} type="button" onClick={()=>{setS('market',m);setErrors(e=>({...e,market:''}));}}
                              style={{padding:'6px 12px',cursor:'pointer',border:`1px solid ${sel.market===m?'#c7d2fe':'#e1e4f0'}`,background:sel.market===m?'#eef2ff':'white'}}>
                              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:sel.market===m?'#4338ca':'#464554'}}>{m.replaceAll('_',' ')}</div>
                              {selectedOption?.markets?.[m]?.price>0&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>₦{Number(selectedOption.markets[m].price).toLocaleString()}</div>}
                            </button>
                          ))}
                        </div>
                        {errors.market&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:4}}>{errors.market}</div>}
                      </div>
                    )}

                    {/* Date + Runs */}
                    {sel.market&&(
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                        <div>
                          <label style={label}>Start Date *</label>
                          <input type="date" value={sel.date} onChange={e=>setS('date',e.target.value)} style={inp}/>
                          {errors.date&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#dc2626',marginTop:-6}}>{errors.date}</div>}
                        </div>
                        <div>
                          <label style={label}>Runs</label>
                          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:4}}>
                            <button type="button" onClick={()=>setS('runs',Math.max(1,runs-1))} style={{width:28,height:28,border:'1px solid #e1e4f0',background:'white',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                            <div style={{flex:1,textAlign:'center'}}>
                              <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:20,color:'#131b2e'}}>{runs}</div>
                              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,color:'#777586'}}>run{runs>1?'s':''}</div>
                            </div>
                            <button type="button" onClick={()=>setS('runs',runs+1)} style={{width:28,height:28,border:'1px solid #4338ca',background:'#eef2ff',color:'#4338ca',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price preview */}
                    {sel.market&&unitPrice>0&&(
                      <div style={{padding:'12px 16px',background:'#eef2ff',borderLeft:'3px solid #4338ca'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:2}}>
                          <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#464554',textTransform:'uppercase',letterSpacing:'0.1em'}}>{runs>1?`₦${Number(unitPrice).toLocaleString()} × ${runs} runs`:'Placement Cost'}</span>
                          {discount>0&&<span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 7px',background:'#f0fdf4',color:'#16a34a',letterSpacing:'0.06em'}}>{(discount*100).toFixed(0)}% off</span>}
                        </div>
                        {discount>0&&<div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586',textDecoration:'line-through',marginBottom:2}}>₦{Number(unitPrice*runs).toLocaleString()}</div>}
                        <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:26,color:'#4338ca'}}>₦{Number(finalPrice).toLocaleString()}</div>
                      </div>
                    )}

                    <button type="button" onClick={addItem} style={{padding:'10px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:'pointer',width:'100%'}}>+ Add to Campaign</button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            {items.length>0&&(
              <div style={{background:'white',border:'1px solid #e1e4f0',padding:16,marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:13,color:'#131b2e'}}>Campaign Cart <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'1px 7px',background:'#eef2ff',color:'#4338ca',letterSpacing:'0.06em',marginLeft:6}}>{items.length}</span></div>
                  <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:16,color:'#4338ca'}}>₦{campaignTotal.toLocaleString()}</div>
                </div>
                {items.map((item,idx)=>(
                  <div key={idx} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',background:'#faf8ff',border:'1px solid #e1e4f0',borderLeft:'2px solid #4338ca',marginBottom:6}}>
                    <div>
                      <div style={{fontFamily:'Manrope,sans-serif',fontWeight:500,fontSize:12,color:'#131b2e'}}>{item.mediaName}</div>
                      <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>{item.optionLabel} · {item.market?.replaceAll('_',' ')}{item.runs>1?` × ${item.runs}`:''}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:12,color:item.price>0?'#4338ca':'#d97706'}}>{item.price>0?`₦${Number(item.price).toLocaleString()}`:'On request'}</div>
                      <button type="button" onClick={()=>setItems(p=>p.filter((_,i)=>i!==idx))} style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,padding:'2px 7px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',cursor:'pointer'}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {apiErr&&<div style={{padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#dc2626',marginBottom:12}}>{apiErr}</div>}

            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setStep(1)} style={{padding:'10px 20px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',background:'transparent',cursor:'pointer'}}>← Back</button>
              <button onClick={()=>{if(!items.length){setApiErr('Add at least one item');return;}setStep(3);}} style={{flex:1,padding:'10px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:'pointer'}}>Review Campaign →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3&&(
          <div>
            <div style={{background:'white',border:'1px solid #e1e4f0',padding:20,marginBottom:16}}>
              <div style={{padding:'12px 14px',background:'#faf8ff',border:'1px solid #e1e4f0',borderLeft:'2px solid #4338ca',marginBottom:16}}>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Brief</div>
                <div style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:13,color:'#131b2e'}}>{brief.brand_name}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586'}}>{brief.email}</div>
                {brief.campaignBrief&&<p style={{fontSize:11,color:'#464554',marginTop:6,lineHeight:1.6}}>{brief.campaignBrief}</p>}
              </div>

              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>Items ({items.length})</div>
              {items.map((item,idx)=>(
                <div key={idx} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:'#faf8ff',border:'1px solid #e1e4f0',borderLeft:'2px solid #4338ca',marginBottom:6}}>
                  <div>
                    <div style={{fontFamily:'Manrope,sans-serif',fontWeight:500,fontSize:12,color:'#131b2e'}}>{item.mediaName}</div>
                    <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#777586',marginTop:1}}>{item.groupLabel} · {item.optionLabel} · {item.market?.replaceAll('_',' ')} · {item.date}{item.runs>1?` · ×${item.runs}`:''}</div>
                  </div>
                  <div style={{fontFamily:'Manrope,sans-serif',fontWeight:600,fontSize:12,color:item.price>0?'#4338ca':'#d97706'}}>{item.price>0?`₦${Number(item.price).toLocaleString()}`:'On request'}</div>
                </div>
              ))}

              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',background:'#eef2ff',borderLeft:'3px solid #4338ca',marginTop:16}}>
                <span style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#4338ca',textTransform:'uppercase',letterSpacing:'0.1em'}}>Total Campaign Value</span>
                <span style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:22,color:'#4338ca'}}>₦{campaignTotal.toLocaleString()}</span>
              </div>
            </div>

            {apiErr&&<div style={{padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#dc2626',marginBottom:12}}>{apiErr}</div>}

            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setStep(2)} style={{padding:'10px 20px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',background:'transparent',cursor:'pointer'}}>← Edit</button>
              <button onClick={launch} disabled={submitting} style={{flex:1,padding:'10px',background:'#4338ca',color:'white',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:'pointer'}}>
                {submitting?'Launching…':'🚀 Launch Campaign'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
