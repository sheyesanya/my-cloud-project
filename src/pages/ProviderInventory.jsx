import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Toast, Spinner } from '../components/UI';
import { getMedia } from '../services/api';
import axios from 'axios';
import { auth } from '../lib/firebase';

const API = import.meta.env.VITE_API_URL;

const CATEGORY_OPTIONS = [
  { value:'TELEVISION',   label:'Television' },
  { value:'RADIO_AUDIO',  label:'Radio & Audio' },
  { value:'PODCASTS',     label:'Podcasts' },
  { value:'OUT_OF_HOME',  label:'Out-of-Home' },
  { value:'PRINT_MEDIA',  label:'Print Media' },
  { value:'INFLUENCERS',  label:'Influencers' },
];

const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const emptyGroup  = () => ({ label:'', options:{} });
const emptyOption = () => ({ label:'', markets:{} });
const emptyMarket = () => ({ price: 0 });

export default function ProviderInventory({ adminMediaId }) {
  const [mediaList, setMediaList]   = useState([]);
  const [selectedId, setSelectedId] = useState(adminMediaId || '');
  const [inventory, setInventory]   = useState({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [expandedGroup, setExpGroup]= useState(null);

  const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 3000); };

  // Load media list (admin sees all, provider sees their own)
  useEffect(() => {
    getMedia()
      .then(r => {
        const list = Array.isArray(r) ? r : r.media ?? r.data ?? [];
        setMediaList(list);
        if (!adminMediaId && list.length > 0) setSelectedId(list[0].mediaId);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load inventory when selection changes
  useEffect(() => {
    if (!selectedId) return;
    const m = mediaList.find(m => m.mediaId === selectedId);
    if (!m) return;
    let inv = m.inventory;
    if (typeof inv === 'string') { try { inv = JSON.parse(inv); } catch { inv = {}; } }
    setInventory(inv || {});
    setExpGroup(null);
  }, [selectedId, mediaList]);

  const selectedMedia = mediaList.find(m => m.mediaId === selectedId);

  // ── Save inventory to backend
  const save = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const headers = await authHeader();
      await axios.patch(`${API}/media/${selectedId}`, { inventory }, { headers: { 'Content-Type':'application/json', ...headers } });
      showToast('success', 'Inventory saved successfully');
      // Update local list
      setMediaList(prev => prev.map(m => m.mediaId === selectedId ? { ...m, inventory } : m));
    } catch(e) { showToast('error', e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  // ── Group operations
  const addGroup = () => {
    const key = `GROUP_${Date.now()}`;
    setInventory(prev => ({ ...prev, [key]: emptyGroup() }));
    setExpGroup(key);
  };

  const updateGroupLabel = (gKey, label) =>
    setInventory(prev => ({ ...prev, [gKey]: { ...prev[gKey], label } }));

  const deleteGroup = (gKey) => {
    setInventory(prev => { const n = { ...prev }; delete n[gKey]; return n; });
    if (expandedGroup === gKey) setExpGroup(null);
  };

  const renameGroupKey = (oldKey, newKey) => {
    if (!newKey || oldKey === newKey || inventory[newKey]) return;
    setInventory(prev => {
      const n = { ...prev };
      n[newKey] = n[oldKey];
      delete n[oldKey];
      return n;
    });
    if (expandedGroup === oldKey) setExpGroup(newKey);
  };

  // ── Option operations
  const addOption = (gKey) => {
    const key = `OPTION_${Date.now()}`;
    setInventory(prev => ({
      ...prev,
      [gKey]: { ...prev[gKey], options: { ...(prev[gKey].options||{}), [key]: emptyOption() } }
    }));
  };

  const updateOption = (gKey, oKey, field, value) =>
    setInventory(prev => ({
      ...prev,
      [gKey]: { ...prev[gKey], options: { ...prev[gKey].options, [oKey]: { ...prev[gKey].options[oKey], [field]: value } } }
    }));

  const deleteOption = (gKey, oKey) =>
    setInventory(prev => {
      const n = { ...prev };
      const opts = { ...n[gKey].options };
      delete opts[oKey];
      n[gKey] = { ...n[gKey], options: opts };
      return n;
    });

  // ── Market operations
  const addMarket = (gKey, oKey) => {
    const key = `MARKET_${Date.now()}`;
    setInventory(prev => ({
      ...prev,
      [gKey]: {
        ...prev[gKey],
        options: {
          ...prev[gKey].options,
          [oKey]: { ...prev[gKey].options[oKey], markets: { ...(prev[gKey].options[oKey].markets||{}), [key]: emptyMarket() } }
        }
      }
    }));
  };

  const updateMarket = (gKey, oKey, mKey, field, value) =>
    setInventory(prev => ({
      ...prev,
      [gKey]: {
        ...prev[gKey],
        options: {
          ...prev[gKey].options,
          [oKey]: {
            ...prev[gKey].options[oKey],
            markets: { ...prev[gKey].options[oKey].markets, [mKey]: { ...prev[gKey].options[oKey].markets[mKey], [field]: value } }
          }
        }
      }
    }));

  const renameMarket = (gKey, oKey, oldMKey, newMKey) => {
    if (!newMKey || oldMKey === newMKey) return;
    setInventory(prev => {
      const markets = { ...prev[gKey].options[oKey].markets };
      markets[newMKey] = markets[oldMKey];
      delete markets[oldMKey];
      return { ...prev, [gKey]: { ...prev[gKey], options: { ...prev[gKey].options, [oKey]: { ...prev[gKey].options[oKey], markets } } } };
    });
  };

  const deleteMarket = (gKey, oKey, mKey) =>
    setInventory(prev => {
      const markets = { ...prev[gKey].options[oKey].markets };
      delete markets[mKey];
      return { ...prev, [gKey]: { ...prev[gKey], options: { ...prev[gKey].options, [oKey]: { ...prev[gKey].options[oKey], markets } } } };
    });

  const inp = { padding:'8px 12px', borderRadius:8, fontSize:12, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontFamily:'Manrope,sans-serif' };

  if (loading) return <Layout title="Inventory Manager"><div style={{ color:'var(--text-muted)', padding:40 }}>Loading…</div></Layout>;

  return (
    <Layout
      title={adminMediaId ? `Inventory: ${selectedMedia?.name || ''}` : 'My Inventory'}
      subtitle="Manage your advertising inventory, options and pricing"
      actions={
        <button onClick={save} disabled={saving} className="btn-primary" style={{ padding:'9px 20px', fontSize:13 }}>
          {saving ? <><Spinner size={13}/> Saving…</> : '💾 Save Inventory'}
        </button>
      }
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      {/* Admin: provider selector */}
      {!adminMediaId && mediaList.length > 1 && (
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Select Provider</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
            style={{ ...inp, width:320 }}>
            {mediaList.map(m => <option key={m.mediaId} value={m.mediaId}>{m.name} — {m.category?.replaceAll('_',' ')}</option>)}
          </select>
        </div>
      )}

      {/* Provider info */}
      {selectedMedia && (
        <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.18)', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontWeight:700, color:'white', fontSize:15 }}>{selectedMedia.name}</p>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{selectedMedia.category?.replaceAll('_',' ')} · {Object.keys(inventory).length} inventory group{Object.keys(inventory).length!==1?'s':''}</p>
          </div>
          <button onClick={addGroup} className="btn-primary" style={{ fontSize:12, padding:'8px 16px' }}>
            + Add Inventory Group
          </button>
        </div>
      )}

      {Object.keys(inventory).length === 0 && (
        <div style={{ padding:48, textAlign:'center', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.1)' }}>
          <p style={{ fontWeight:700, color:'white', marginBottom:8 }}>No inventory yet</p>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Add inventory groups to define what clients can book — e.g. "Commercial Spots", "Sponsorships", "Social Media".</p>
          <button onClick={addGroup} className="btn-primary">+ Add First Inventory Group</button>
        </div>
      )}

      {/* Inventory groups */}
      <div className="space-y-4">
        {Object.entries(inventory).map(([gKey, group]) => {
          const isOpen = expandedGroup === gKey;
          const optionCount = Object.keys(group.options || {}).length;
          return (
            <div key={gKey} style={{ borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)', overflow:'hidden' }}>

              {/* Group header */}
              <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }} onClick={() => setExpGroup(isOpen ? null : gKey)}>
                <div style={{ flex:1, display:'flex', alignItems:'center', gap:12 }}>
                  <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition:'0.2s', flexShrink:0 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <div style={{ flex:1 }}>
                    <input
                      value={group.label}
                      onChange={e => { e.stopPropagation(); updateGroupLabel(gKey, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      placeholder="Group name (e.g. Commercial Spots)"
                      style={{ ...inp, width:'100%', fontWeight:700, fontSize:14, background:'transparent', border:'none', padding:'0' }}
                    />
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{optionCount} option{optionCount!==1?'s':''}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => addOption(gKey)} className="btn-secondary" style={{ fontSize:11, padding:'5px 12px' }}>+ Option</button>
                  <button onClick={() => deleteGroup(gKey)} style={{ padding:'5px 10px', borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#fca5a5', fontSize:11, cursor:'pointer' }}>✕</button>
                </div>
              </div>

              {/* Options */}
              {isOpen && (
                <div style={{ borderTop:'1px solid var(--border)', padding:'16px 20px' }}>
                  {Object.keys(group.options || {}).length === 0 && (
                    <div style={{ textAlign:'center', padding:'20px', color:'var(--text-muted)', fontSize:13 }}>
                      No options yet. <button onClick={() => addOption(gKey)} style={{ color:'#a5b4fc', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontSize:13 }}>Add one →</button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {Object.entries(group.options || {}).map(([oKey, option]) => (
                      <div key={oKey} style={{ padding:'14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>

                        {/* Option row */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                          <div style={{ flex:1 }}>
                            <label style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Option Name</label>
                            <input value={option.label} onChange={e => updateOption(gKey, oKey, 'label', e.target.value)}
                              placeholder="e.g. 30 Seconds Peak Time"
                              style={{ ...inp, width:'100%', fontSize:13 }}/>
                          </div>
                          <div style={{ display:'flex', gap:6, marginTop:18 }}>
                            <button onClick={() => addMarket(gKey, oKey)} className="btn-secondary" style={{ fontSize:11, padding:'5px 12px', whiteSpace:'nowrap' }}>+ Market</button>
                            <button onClick={() => deleteOption(gKey, oKey)} style={{ padding:'5px 10px', borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#fca5a5', fontSize:11, cursor:'pointer' }}>✕</button>
                          </div>
                        </div>

                        {/* Markets */}
                        {Object.keys(option.markets || {}).length > 0 && (
                          <div>
                            <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Markets & Pricing</p>
                            <div style={{ display:'grid', gap:6 }}>
                              {Object.entries(option.markets || {}).map(([mKey, market]) => (
                                <div key={mKey} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
                                  <input
                                    value={mKey.startsWith('MARKET_') ? '' : mKey}
                                    onChange={e => {}}
                                    onBlur={e => renameMarket(gKey, oKey, mKey, e.target.value.toUpperCase().replaceAll(' ','_'))}
                                    placeholder="Market name (e.g. LAGOS)"
                                    style={{ ...inp, flex:1, fontSize:12 }}
                                  />
                                  <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>₦</span>
                                  <input
                                    type="number"
                                    value={market.price || ''}
                                    onChange={e => updateMarket(gKey, oKey, mKey, 'price', Number(e.target.value))}
                                    placeholder="Price"
                                    style={{ ...inp, width:130, fontSize:12 }}
                                  />
                                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', flexShrink:0 }}>{market.price > 0 ? `₦${Number(market.price).toLocaleString()}` : ''}</span>
                                  <button onClick={() => deleteMarket(gKey, oKey, mKey)} style={{ width:26, height:26, borderRadius:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', color:'#fca5a5', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button onClick={() => addOption(gKey)} style={{ marginTop:12, width:'100%', padding:'9px', borderRadius:9, background:'rgba(99,102,241,0.06)', border:'1px dashed rgba(99,102,241,0.25)', color:'#a5b4fc', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    + Add Option
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(inventory).length > 0 && (
        <div style={{ marginTop:20, display:'flex', gap:10 }}>
          <button onClick={addGroup} className="btn-secondary" style={{ fontSize:12 }}>+ Add Another Group</button>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ fontSize:13, padding:'10px 24px' }}>
            {saving ? <><Spinner size={13}/> Saving…</> : '💾 Save All Changes'}
          </button>
        </div>
      )}
    </Layout>
  );
}