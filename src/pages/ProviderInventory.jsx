import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Toast, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

const parseInventory = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return {}; } }
  return raw;
};

const MARKET_SUGGESTIONS = [
  'NATIONAL','LAGOS','ABUJA','PORT_HARCOURT','KANO','ENUGU','IBADAN',
  'ONITSHA','KADUNA','BENIN_CITY','PER_EPISODE','PER_POST','PER_VIDEO',
  'PER_REEL','PER_STORY','PER_CAMPAIGN','ANNUAL','MONTHLY',
];

export default function ProviderInventory({ adminMediaId }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [mediaList, setMediaList]   = useState([]);
  const [selectedId, setSelectedId] = useState(adminMediaId || '');
  const [inventory, setInventory]   = useState({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [expandedGroup, setExpGroup]= useState(null);
  const [expandedOption, setExpOpt] = useState(null);
  const [newMarketInputs, setNMI]   = useState({});

  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const load = async () => {
      try {
        const headers = await authHeader();
        const res = await axios.get(`${API}/media`, { headers });
        const list = Array.isArray(res.data) ? res.data : res.data?.media ?? res.data?.data ?? [];
        const email = auth.currentUser?.email;
        const mine  = isAdmin ? list : list.filter(m => m.contactEmail === email);
        setMediaList(mine);
        if (!adminMediaId && mine.length > 0) setSelectedId(mine[0].mediaId);
      } catch(e) { showToast('error', 'Failed to load media'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const m = mediaList.find(m => m.mediaId === selectedId);
    if (!m) return;
    setInventory(parseInventory(m.inventory) || {});
    setExpGroup(null); setExpOpt(null);
  }, [selectedId, mediaList]);

  const selectedMedia = mediaList.find(m => m.mediaId === selectedId);

  const save = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const headers = await authHeader();
      await axios.patch(`${API}/media/${selectedId}`, { inventory }, { headers });
      setMediaList(prev => prev.map(m => m.mediaId === selectedId ? { ...m, inventory } : m));
      showToast('success', 'Inventory saved successfully');
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const addGroup = () => {
    const key = `GRP_${Date.now()}`;
    setInventory(prev => ({ ...prev, [key]: { label:'', options:{} } }));
    setExpGroup(key);
  };

  const updateGroupLabel = (gKey, label) =>
    setInventory(prev => ({ ...prev, [gKey]: { ...prev[gKey], label } }));

  const deleteGroup = (gKey) => {
    setInventory(prev => { const n={...prev}; delete n[gKey]; return n; });
    if (expandedGroup===gKey) setExpGroup(null);
  };

  const addOption = (gKey) => {
    const key = `OPT_${Date.now()}`;
    setInventory(prev => ({ ...prev, [gKey]: { ...prev[gKey], options:{...(prev[gKey].options||{}), [key]:{ label:'', markets:{} }} } }));
    setExpOpt(key);
  };

  const updateOptionLabel = (gKey, oKey, label) =>
    setInventory(prev => ({ ...prev, [gKey]:{ ...prev[gKey], options:{...prev[gKey].options, [oKey]:{...prev[gKey].options[oKey], label}} } }));

  const deleteOption = (gKey, oKey) => {
    setInventory(prev => { const opts={...prev[gKey].options}; delete opts[oKey]; return {...prev, [gKey]:{...prev[gKey],options:opts}}; });
    if (expandedOption===oKey) setExpOpt(null);
  };

  const addMarket = (gKey, oKey, name) => {
    if (!name.trim()) return;
    const key = name.toUpperCase().replaceAll(' ','_');
    setInventory(prev => ({...prev, [gKey]:{...prev[gKey], options:{...prev[gKey].options,
      [oKey]:{...prev[gKey].options[oKey], markets:{...(prev[gKey].options[oKey].markets||{}), [key]:{price:0}}}
    }}}));
  };

  const updateMarketPrice = (gKey, oKey, mKey, price) =>
    setInventory(prev => ({...prev, [gKey]:{...prev[gKey], options:{...prev[gKey].options,
      [oKey]:{...prev[gKey].options[oKey], markets:{...prev[gKey].options[oKey].markets, [mKey]:{price:Number(price)}}}
    }}}));

  const renameMarket = (gKey, oKey, oldKey, newName) => {
    if (!newName||oldKey===newName.toUpperCase().replaceAll(' ','_')) return;
    const nk = newName.toUpperCase().replaceAll(' ','_');
    setInventory(prev => {
      const markets = {...prev[gKey].options[oKey].markets};
      markets[nk] = markets[oldKey]; delete markets[oldKey];
      return {...prev, [gKey]:{...prev[gKey], options:{...prev[gKey].options, [oKey]:{...prev[gKey].options[oKey], markets}}}};
    });
  };

  const deleteMarket = (gKey, oKey, mKey) => {
    setInventory(prev => {
      const markets={...prev[gKey].options[oKey].markets}; delete markets[mKey];
      return {...prev, [gKey]:{...prev[gKey], options:{...prev[gKey].options, [oKey]:{...prev[gKey].options[oKey], markets}}}};
    });
  };

  const fi = (err) => ({ padding:'8px 12px', borderRadius:8, fontSize:12, outline:'none', fontFamily:'Manrope,sans-serif', background: err?'rgba(239,68,68,0.06)':'rgba(255,255,255,0.05)', border: err?'1px solid rgba(239,68,68,0.3)':'1px solid rgba(255,255,255,0.1)', color:'white' });

  if (loading) return <Layout title="My Inventory"><div style={{color:'var(--text-muted)',padding:40,display:'flex',gap:10}}><Spinner size={16}/>Loading…</div></Layout>;

  return (
    <Layout
      title={isAdmin && adminMediaId ? `Inventory: ${selectedMedia?.name||''}` : 'My Inventory'}
      subtitle="Manage your advertising inventory, formats and pricing"
      actions={<button onClick={save} disabled={saving} className="btn-primary" style={{padding:'9px 20px',fontSize:13}}>{saving?<><Spinner size={13}/> Saving…</>:'💾 Save Inventory'}</button>}
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={()=>setToast(null)}/>}

      {isAdmin && !adminMediaId && mediaList.length > 1 && (
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:8}}>Select Provider</label>
          <select value={selectedId} onChange={e=>setSelectedId(e.target.value)} style={{...fi(),width:320}}>
            {mediaList.map(m=><option key={m.mediaId} value={m.mediaId}>{m.name} — {m.category?.replaceAll('_',' ')}</option>)}
          </select>
        </div>
      )}

      {selectedMedia && (
        <div style={{padding:'14px 18px',borderRadius:12,background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.18)',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'white',flexShrink:0}}>{selectedMedia.name?.[0]}</div>
            <div>
              <p style={{fontWeight:700,color:'white',fontSize:15}}>{selectedMedia.name}</p>
              <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                {selectedMedia.category?.replaceAll('_',' ')} · {Object.keys(inventory).length} group{Object.keys(inventory).length!==1?'s':''} · {Object.values(inventory).reduce((s,g)=>s+Object.keys(g.options||{}).length,0)} options
              </p>
            </div>
          </div>
          <button onClick={addGroup} className="btn-primary" style={{fontSize:12,padding:'8px 16px'}}>+ Add Inventory Group</button>
        </div>
      )}

      {Object.keys(inventory).length===0 && (
        <div style={{padding:48,textAlign:'center',borderRadius:14,background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.1)'}}>
          <p style={{fontWeight:700,color:'white',fontSize:16,marginBottom:8}}>No inventory yet</p>
          <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>Add inventory groups to define what clients can book.</p>
          <button onClick={addGroup} className="btn-primary">+ Add First Inventory Group</button>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(inventory).map(([gKey,group])=>{
          const open = expandedGroup===gKey;
          return (
            <div key={gKey} style={{borderRadius:14,background:'var(--bg-surface)',border:'1px solid var(--border)',overflow:'hidden'}}>
              <div style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:open?'rgba(99,102,241,0.05)':'transparent'}}
                onClick={()=>setExpGroup(open?null:gKey)}>
                <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{transform:open?'rotate(90deg)':'none',transition:'0.2s',flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
                <div style={{flex:1}} onClick={e=>e.stopPropagation()}>
                  <input value={group.label} onChange={e=>updateGroupLabel(gKey,e.target.value)} placeholder="Group name (e.g. Commercial Spots)"
                    style={{...fi(),width:'100%',fontWeight:700,fontSize:14,background:'transparent',border:'none',padding:0,cursor:'text'}} onClick={e=>e.stopPropagation()}/>
                  <p style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{Object.keys(group.options||{}).length} option{Object.keys(group.options||{}).length!==1?'s':''}</p>
                </div>
                <div style={{display:'flex',gap:8}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>addOption(gKey)} className="btn-secondary" style={{fontSize:11,padding:'5px 12px'}}>+ Option</button>
                  <button onClick={()=>deleteGroup(gKey)} style={{padding:'5px 10px',borderRadius:7,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.18)',color:'#fca5a5',fontSize:11,cursor:'pointer',fontFamily:'Manrope,sans-serif'}}>✕</button>
                </div>
              </div>

              {open && (
                <div style={{borderTop:'1px solid var(--border)',padding:'16px 18px'}}>
                  {Object.keys(group.options||{}).length===0 && (
                    <div style={{textAlign:'center',padding:'16px',color:'var(--text-muted)',fontSize:13,borderRadius:10,background:'rgba(255,255,255,0.02)'}}>
                      No options yet. <button onClick={()=>addOption(gKey)} style={{color:'#a5b4fc',background:'none',border:'none',cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'Manrope,sans-serif'}}>Add one →</button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {Object.entries(group.options||{}).map(([oKey,option])=>{
                      const optOpen = expandedOption===oKey;
                      const markets = option.markets||{};
                      const prices = Object.values(markets).map(m=>m.price||0).filter(p=>p>0);
                      return (
                        <div key={oKey} style={{borderRadius:11,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',overflow:'hidden'}}>
                          <div style={{padding:'11px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>setExpOpt(optOpen?null:oKey)}>
                            <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{transform:optOpen?'rotate(90deg)':'none',transition:'0.2s',flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
                            <div style={{flex:1}} onClick={e=>e.stopPropagation()}>
                              <input value={option.label} onChange={e=>updateOptionLabel(gKey,oKey,e.target.value)} placeholder="Option name (e.g. 30 Seconds Peak Time)"
                                style={{...fi(),width:'100%',fontSize:13,background:'transparent',border:'none',padding:0,cursor:'text'}} onClick={e=>e.stopPropagation()}/>
                              <p style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>
                                {Object.keys(markets).length} market{Object.keys(markets).length!==1?'s':''}
                                {prices.length>0&&` · from ₦${Math.min(...prices).toLocaleString()}`}
                              </p>
                            </div>
                            <div onClick={e=>e.stopPropagation()}>
                              <button onClick={()=>deleteOption(gKey,oKey)} style={{padding:'4px 9px',borderRadius:6,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',color:'#fca5a5',fontSize:11,cursor:'pointer',fontFamily:'Manrope,sans-serif'}}>✕</button>
                            </div>
                          </div>

                          {optOpen && (
                            <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'12px 14px'}}>
                              <p style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Markets & Pricing</p>
                              {Object.entries(markets).map(([mKey,market])=>(
                                <div key={mKey} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7,padding:'8px 10px',borderRadius:8,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
                                  <input defaultValue={mKey.replaceAll('_',' ')} onBlur={e=>renameMarket(gKey,oKey,mKey,e.target.value)} placeholder="Market" style={{...fi(),flex:1,fontSize:12}}/>
                                  <span style={{fontSize:11,color:'var(--text-muted)',flexShrink:0}}>₦</span>
                                  <input type="number" value={market.price||''} onChange={e=>updateMarketPrice(gKey,oKey,mKey,e.target.value)} placeholder="Price" style={{...fi(),width:120,fontSize:12}}/>
                                  {market.price>0&&<span style={{fontSize:10,color:'#a5b4fc',fontWeight:600,flexShrink:0,minWidth:80}}>₦{Number(market.price).toLocaleString()}</span>}
                                  <button onClick={()=>deleteMarket(gKey,oKey,mKey)} style={{width:24,height:24,borderRadius:6,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',color:'#fca5a5',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'Manrope,sans-serif'}}>✕</button>
                                </div>
                              ))}
                              <div style={{display:'flex',gap:8,marginTop:10,position:'relative'}}>
                                <div style={{flex:1,position:'relative'}}>
                                  <input value={newMarketInputs[oKey]||''} onChange={e=>setNMI(p=>({...p,[oKey]:e.target.value}))}
                                    onKeyDown={e=>{if(e.key==='Enter'){addMarket(gKey,oKey,newMarketInputs[oKey]||'');setNMI(p=>({...p,[oKey]:''}));}}}
                                    placeholder="Market name + Enter (e.g. Lagos)" style={{...fi(),width:'100%',fontSize:12}}/>
                                  {newMarketInputs[oKey] && (
                                    <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:20,background:'#1a1a2e',border:'1px solid var(--border)',borderRadius:9,marginTop:4,overflow:'hidden'}}>
                                      {MARKET_SUGGESTIONS.filter(s=>s.includes((newMarketInputs[oKey]||'').toUpperCase())&&!Object.keys(markets).includes(s)).slice(0,5).map(s=>(
                                        <button key={s} onClick={()=>{addMarket(gKey,oKey,s);setNMI(p=>({...p,[oKey]:''}));}}
                                          style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',background:'none',border:'none',color:'rgba(255,255,255,0.7)',fontSize:12,cursor:'pointer',fontFamily:'Manrope,sans-serif'}}
                                          onMouseEnter={e=>e.target.style.background='rgba(99,102,241,0.12)'}
                                          onMouseLeave={e=>e.target.style.background='none'}>
                                          {s.replaceAll('_',' ')}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button onClick={()=>{addMarket(gKey,oKey,newMarketInputs[oKey]||'');setNMI(p=>({...p,[oKey]:''}));}}
                                  style={{padding:'8px 14px',borderRadius:8,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',color:'#a5b4fc',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Manrope,sans-serif',whiteSpace:'nowrap'}}>+ Add</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={()=>addOption(gKey)} style={{marginTop:12,width:'100%',padding:'9px',borderRadius:9,background:'rgba(99,102,241,0.05)',border:'1px dashed rgba(99,102,241,0.22)',color:'#a5b4fc',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Manrope,sans-serif'}}>
                    + Add Option to {group.label||'this group'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(inventory).length>0&&(
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button onClick={addGroup} className="btn-secondary" style={{fontSize:12}}>+ Add Another Group</button>
          <button onClick={save} disabled={saving} className="btn-primary" style={{fontSize:13,padding:'10px 24px'}}>
            {saving?<><Spinner size={13}/> Saving…</>:'💾 Save All Changes'}
          </button>
        </div>
      )}
    </Layout>
  );
}