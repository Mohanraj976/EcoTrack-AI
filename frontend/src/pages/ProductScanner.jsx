// src/pages/ProductScanner.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { scanBarcode } from '../services/api';
import { saveProductScan, getUserProducts } from '../firebase/firestore';

const SAMPLE_PRODUCTS = {
  '5449000000996': { name: 'Coca-Cola 500ml',      emission: 0.35, category: 'Beverage',   eco: 'Water in a reusable bottle (0.01 kg CO₂)' },
  '5000159407236': { name: 'Plastic Water Bottle', emission: 0.45, category: 'Beverage',   eco: 'Steel reusable bottle (0.05 kg CO₂/use)' },
  '7622210449283': { name: 'Oreo Cookies 154g',    emission: 0.62, category: 'Snack',      eco: 'Homemade oat cookies' },
  '8901725163003': { name: 'Maggi Noodles 70g',    emission: 0.31, category: 'Food',       eco: 'Home-cooked rice and lentils (0.12 kg CO₂)' },
  '4006381333931': { name: 'Faber-Castell Pen',    emission: 0.08, category: 'Stationery', eco: 'Refillable pen' },
};

const DEMO_BARCODES = Object.keys(SAMPLE_PRODUCTS);

export default function ProductScanner() {
  const { user } = useAuth();
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) getUserProducts(user.uid).then(setHistory);
  }, [user]);

  const doScan = async (code) => {
    if (!code.trim()) return;
    setLoading(true);
    setProduct(null);
    try {
      let data;
      try {
        data = await scanBarcode(code);
      } catch {
        data = SAMPLE_PRODUCTS[code] || null;
        if (!data) {
          toast.error('Product not found. Try a demo barcode below.');
          setLoading(false);
          return;
        }
      }
      setProduct(data);
      await saveProductScan(user.uid, { ...data, barcode: code });
      const updated = await getUserProducts(user.uid);
      setHistory(updated);
      toast.success('Product found!');
    } catch {
      toast.error('Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); doScan(barcode); };

  const getEmissionClass = (e) => {
    const n = parseFloat(e);
    if (n < 0.3)  return 'badge-green';
    if (n < 0.8)  return 'badge-yellow';
    return 'badge-red';
  };

  const getEmissionLabel = (e) => {
    const n = parseFloat(e);
    if (n < 0.3)  return '🟢 Low';
    if (n < 0.8)  return '🟡 Medium';
    return '🔴 High';
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 740 }}>
        <div className="page-header">
          <h1 className="page-title">📦 Product Carbon Scanner</h1>
          <p className="page-subtitle">Enter a product barcode to see its carbon footprint and discover eco alternatives.</p>
        </div>

        {/* Scan form */}
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
            <input
              className="form-input" style={{ flex: 1 }}
              type="text"
              placeholder="Enter barcode number…"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !barcode.trim()}>
              {loading ? '🔍…' : '🔍 Scan'}
            </button>
          </form>

          {/* Demo barcodes */}
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Try demo barcodes:</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DEMO_BARCODES.map(b => (
                <button
                  key={b}
                  onClick={() => { setBarcode(b); doScan(b); }}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: '0.78rem',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer'
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result card */}
        {product && (
          <div className="card" style={{ marginBottom: 24, border: '1px solid var(--border-bright)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 6 }}>
                  {product.name}
                </h3>
                <span className="badge badge-teal">{product.category}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--accent-lime)' }}>
                  {product.emission} kg
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CO₂ per unit</div>
              </div>
            </div>

            {/* Emission meter */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Carbon impact</span>
                <span className={`badge ${getEmissionClass(product.emission)}`}>{getEmissionLabel(product.emission)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min((parseFloat(product.emission) / 2) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Eco alternative */}
            <div style={{ background: 'rgba(38,198,162,0.08)', border: '1px solid rgba(38,198,162,0.2)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>💡 Eco-Friendly Alternative</p>
              <p style={{ color: 'var(--accent-teal)', fontWeight: 500, fontSize: '0.92rem' }}>{product.eco}</p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
              Scan History ({history.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice(0, 15).map((p, i) => (
                <div
                  key={p.id || i}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.barcode} · {p.category}</div>
                  </div>
                  <span className={`badge ${getEmissionClass(p.emission)}`}>{p.emission} kg CO₂</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}