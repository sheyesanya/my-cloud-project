import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingBlock, ErrorBlock } from '../components/UI';
import { getAnalytics } from '../services/api';

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const res = await getAnalytics();
      if (typeof res === 'string' && res.includes('<!doctype html>')) {
        throw new Error('Analytics endpoint returned HTML instead of JSON.');
      }
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <Layout title="Analytics" subtitle="Platform performance and campaign intelligence">
      {loading && <LoadingBlock message="Fetching analytics…" />}
      {error   && <ErrorBlock message={error} onRetry={fetchData} />}

      {!loading && !error && data && (
        <div className="space-y-6">

          {/* Spend Gradient Banner */}
          <div className="rounded-2xl p-6" style={{ background:'linear-gradient(135deg,#4641f5 0%,#6460ff 60%,#ff4d1f 100%)' }}>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', marginBottom:'6px' }}>Total Platform Revenue</p>
            <p style={{ fontWeight:800, fontSize:'38px', color:'white' }}>
              ₦{Number(data.totalRevenue ?? data.revenue ?? 0).toLocaleString()}
            </p>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data)
              .filter(([, val]) => typeof val !== 'object' && !String(val).includes('<!doctype html>'))
              .map(([key, val]) => (
                <div
                  key={key}
                  className="page-card p-5"
                >
                  <p style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', fontWeight:700 }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p style={{ marginTop:'12px', fontSize:'26px', fontWeight:700, color:'#0f172a', letterSpacing:'-0.04em' }}>
                    {typeof val === 'number' ? val.toLocaleString() : String(val)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </Layout>
  );
}