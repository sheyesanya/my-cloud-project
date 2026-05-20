import { useState } from 'react';
import Layout from '../components/Layout';
import { Spinner, Toast } from '../components/UI';
import { INVENTORY_CONFIG } from '../config/inventoryConfig';
import { createMedia } from '../services/api';

const MARKETS = ['LAGOS','ABUJA','PH','KANO','ONITSHA','ENUGU'];

const EMPTY_FORM = { name:'', category:'', contactEmail:'', inventory:{} };

export default function CreateMedia() {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())         errs.name  = 'Media name is required';
    if (!form.category)            errs.category = 'Select a category';
    if (!form.contactEmail.trim()) errs.contactEmail = 'Provider email is required';
    else if (!/\S+@\S+\.\S+/.test(form.contactEmail)) errs.contactEmail = 'Enter a valid email';
    return errs;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setLoading(true);
      await createMedia(form);
      showToast('success', `${form.name} created successfully!`);
      // ── FIX: reset all fields including contactEmail (was missing before)
      setForm(EMPTY_FORM);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = (groupKey, optionKey, market, value) => {
    setForm((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [groupKey]: {
          ...(prev.inventory[groupKey] || {}),
          options: {
            ...(prev.inventory[groupKey]?.options || {}),
            [optionKey]: {
              ...(prev.inventory[groupKey]?.options?.[optionKey] || {}),
              markets: {
                ...(prev.inventory[groupKey]?.options?.[optionKey]?.markets || {}),
                [market]: { price: Number(value) || 0 },
              },
            },
          },
        },
      },
    }));
  };

  const selectedCategory  = INVENTORY_CONFIG[form.category];
  const inventoryGroups   = selectedCategory?.inventoryGroups || {};

  const inputStyle = (field) => ({
    width:'100%', padding:'14px 16px', fontSize:'13px', borderRadius:16, outline:'none',
    border: errors[field] ? '1.5px solid #ef4444' : '1px solid rgba(255,255,255,0.7)',
    background:'rgba(255,255,255,0.8)', backdropFilter:'blur(14px)', color:'#12121e',
    boxShadow:'0 8px 24px rgba(15,23,42,0.04)',
  });

  return (
    <Layout title="Add Media" subtitle="Create media inventory and configure pricing">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="max-w-3xl">
        <div className="page-card p-6 space-y-6">

          {/* Media Name */}
          <div>
            <label className="form-label">Media Name *</label>
            <input style={inputStyle('name')} placeholder="e.g. Cool FM" value={form.name} onChange={(e) => set('name', e.target.value)} />
            {errors.name && <p style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px' }}>{errors.name}</p>}
          </div>

          {/* Provider Email */}
          <div>
            <label className="form-label">Provider Email *</label>
            <input type="email" style={inputStyle('contactEmail')} placeholder="bookings@media.com" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
            {errors.contactEmail && <p style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px' }}>{errors.contactEmail}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="form-label">Category *</label>
            <select style={inputStyle('category')} value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select category</option>
              {Object.entries(INVENTORY_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            {errors.category && <p style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px' }}>{errors.category}</p>}
          </div>

          {/* Inventory Builder */}
          {form.category && (
            <div className="space-y-6">
              <div>
                <h2 style={{ fontFamily:'Fraunces,serif', fontWeight:600, fontSize:'22px', color:'#12121e', marginBottom:'4px' }}>Inventory Pricing</h2>
                <p style={{ fontSize:'13px', color:'#64748b' }}>Configure market pricing for each inventory type</p>
              </div>

              {Object.entries(inventoryGroups).map(([groupKey, groupVal]) => (
                <div key={groupKey} className="rounded-2xl p-5 space-y-5" style={{ border:'1px solid rgba(226,232,240,0.9)', background:'rgba(255,255,255,0.5)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'15px', color:'#12121e' }}>{groupVal.label}</h3>

                  {Object.entries(groupVal.options).map(([optionKey, optionVal]) => (
                    <div key={optionKey} className="rounded-xl p-4" style={{ border:'1px solid rgba(226,232,240,0.7)', background:'rgba(255,255,255,0.6)' }}>
                      <h4 style={{ fontWeight:600, fontSize:'13px', color:'#334155', marginBottom:'16px' }}>{optionVal.label}</h4>

                      {/* Show option's own markets if defined, else fall back to MARKETS list */}
                      <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(optionVal.markets || {}).length > 0
                          ? Object.keys(optionVal.markets)
                          : MARKETS
                        ).map((market) => (
                          <div key={market}>
                            <label className="form-label">{market.replaceAll('_', ' ')}</label>
                            <input
                              type="number"
                              min="0"
                              placeholder={optionVal.markets?.[market]?.price ?? '0'}
                              style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:'1px solid rgba(226,232,240,0.9)', background:'white', fontSize:'13px', outline:'none' }}
                              value={form.inventory?.[groupKey]?.options?.[optionKey]?.markets?.[market]?.price || ''}
                              onChange={(e) => updatePrice(groupKey, optionKey, market, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <button onClick={submit} disabled={loading} className="btn-primary">
                {loading ? <><Spinner size={14} /> Saving…</> : 'Create Media'}
              </button>
            </div>
          )}

          {/* Allow saving even without inventory section */}
          {!form.category && (
            <button onClick={submit} disabled={loading} className="btn-primary">
              {loading ? <><Spinner size={14} /> Saving…</> : 'Create Media'}
            </button>
          )}

        </div>
      </div>
    </Layout>
  );
}