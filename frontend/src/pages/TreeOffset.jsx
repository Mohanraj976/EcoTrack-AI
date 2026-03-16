// src/pages/TreeOffset.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { calcTreesNeeded } from '../services/carbonService';
import { updateUserDocument } from '../firebase/firestore';

const QUICK_REF = [
  { activity: 'Monthly electricity bill (200 kWh)', co2: 164,  trees: 8  },
  { activity: '10 km car trip daily for a month',   co2: 63,   trees: 3  },
  { activity: 'One domestic flight (~500 km)',       co2: 128,  trees: 7  },
  { activity: 'One international flight (~8000 km)', co2: 1560, trees: 75 },
  { activity: 'Yearly avg footprint (India)',        co2: 1900, trees: 91 },
  { activity: 'Yearly avg footprint (Global)',       co2: 4000, trees: 191},
];

export default function TreeOffset() {
  const { user, userDoc, refreshUserDoc } = useAuth();
  const [emission, setEmission] = useState('');
  const [result,   setResult]   = useState(null);
  const [sessionPlanted, setSessionPlanted] = useState(0);

  const handleCalc = (e) => {
    e.preventDefault();
    const kg = parseFloat(emission);
    if (!kg || kg <= 0) return;
    const trees = calcTreesNeeded(kg);
    setResult({
      kg,
      trees,
      absorbedPerYear: trees * 21,
      yearsAtOneTree: parseFloat((kg / 21).toFixed(1))
    });
  };

  const handlePlant = async (count) => {
    if (!user || !count) return;
    const newTrees = (userDoc?.treesPlanted || 0) + count;
    const newPoints = (userDoc?.ecoPoints || 0) + (count * 100);
    try {
      await updateUserDocument(user.uid, { treesPlanted: newTrees, ecoPoints: newPoints });
      await refreshUserDoc();
      setSessionPlanted(p => p + count);
      toast.success(`🌲 Logged ${count} tree${count > 1 ? 's' : ''} planted! +${count * 100} eco points`);
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <h1 className="page-title">🌲 Tree Offset System</h1>
          <p className="page-subtitle">Calculate how many trees you need to plant to neutralize your carbon emissions.</p>
        </div>

        {/* Info banner */}
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          🌱 One tree absorbs approximately <strong>21 kg of CO₂ per year</strong>. Trees also improve air quality, support biodiversity, and prevent soil erosion.
        </div>

        {/* Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '🌲', value: userDoc?.treesPlanted || 0,                             label: 'Trees Planted' },
            { icon: '💨', value: `${((userDoc?.treesPlanted || 0) * 21)} kg`,            label: 'CO₂ Offset / Year' },
            { icon: '⚡', value: userDoc?.ecoPoints || 0,                                label: 'Eco Points' },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Calculator */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
            Calculate Trees Needed
          </h3>
          <form onSubmit={handleCalc}>
            <div className="form-group">
              <label className="form-label">Carbon Emission to Offset (kg CO₂)</label>
              <input
                className="form-input"
                type="number" min="0" step="0.1"
                placeholder="e.g. 500"
                value={emission}
                onChange={e => setEmission(e.target.value)}
                required
              />
              <p className="form-hint">Formula: kg CO₂ ÷ 21 = trees needed per year</p>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={!emission}>
              🌱 Calculate Trees Needed
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="result-box" style={{ marginBottom: 24 }}>
            <p className="result-title">Trees Required to Offset</p>
            <div className="result-value">🌲 {result.trees}</div>
            <p className="result-sub" style={{ marginTop: 8 }}>
              trees to offset <strong>{result.kg} kg CO₂</strong> in 1 year
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
              {[
                { label: 'Absorbed / year',   value: `${result.absorbedPerYear} kg`, color: 'var(--accent-lime)' },
                { label: 'Years at 1 tree',   value: `${result.yearsAtOneTree} yr`,  color: 'var(--accent-teal)' },
                { label: 'Eco points (log all)', value: `+${result.trees * 100}`,    color: 'var(--warning)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: s.color }}>{s.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <button onClick={() => handlePlant(1)} className="btn btn-secondary">
                🌱 Log 1 Tree
              </button>
              <button onClick={() => handlePlant(result.trees)} className="btn btn-primary">
                🌲 Log All {result.trees} Trees (+{result.trees * 100} pts)
              </button>
            </div>
          </div>
        )}

        {sessionPlanted > 0 && (
          <div className="alert alert-success" style={{ marginBottom: 24 }}>
            🌲 You've logged <strong>{sessionPlanted} trees</strong> this session!
            That's <strong>{sessionPlanted * 21} kg CO₂</strong> absorbed per year.
          </div>
        )}

        {/* Quick reference table */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
            🌿 Quick Reference
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Activity', 'CO₂', 'Trees / year'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUICK_REF.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{r.activity}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-yellow">{r.co2} kg</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-green">🌲 {r.trees}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}