// src/pages/Calculator.jsx
import React, { useState } from 'react';
import { calcYearlyEmission, getEmissionStatus, calcTreesNeeded } from '../services/carbonService';
import { EmissionPieChart } from '../components/ChartCard';

const initForm = {
  transport: { kmPerDay: 20, mode: 'car_petrol' },
  electricity: { monthlyKwh: 200 },
  flights: { domesticFlights: 2, internationalFlights: 1 },
  diet: { meatMealsPerWeek: 7, dairyServingsPerDay: 2 }
};

const TRANSPORT_OPTIONS = [
  { value: 'car_petrol',  label: '🚗 Car (Petrol)' },
  { value: 'car_diesel',  label: '🚙 Car (Diesel)' },
  { value: 'motorbike',   label: '🏍️ Motorbike' },
  { value: 'bus',         label: '🚌 Bus' },
  { value: 'train',       label: '🚆 Train' },
];

export default function Calculator() {
  const [form, setForm] = useState(initForm);
  const [result, setResult] = useState(null);

  const handleCalc = (e) => {
    e.preventDefault();
    setResult(calcYearlyEmission(form));
  };

  const set = (section, key, value) =>
    setForm(f => ({ ...f, [section]: { ...f[section], [key]: isNaN(parseFloat(value)) ? value : parseFloat(value) } }));

  const pieData = result
    ? [
        { name: 'Transport',   value: result.transport },
        { name: 'Electricity', value: result.electricity },
        { name: 'Flights',     value: result.flights },
        { name: 'Diet',        value: result.diet },
      ].filter(d => d.value > 0)
    : [];

  const status = result ? getEmissionStatus(result.total) : null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="page-header">
          <h1 className="page-title">🧮 Carbon Footprint Calculator</h1>
          <p className="page-subtitle">Estimate your total yearly carbon emissions based on lifestyle inputs.</p>
        </div>

        <form onSubmit={handleCalc}>
          {/* Transport */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>🚗 Daily Transport</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Km travelled per day</label>
                <input
                  className="form-input" type="number" min="0" step="1"
                  value={form.transport.kmPerDay}
                  onChange={e => set('transport', 'kmPerDay', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Primary vehicle</label>
                <select
                  className="form-select" value={form.transport.mode}
                  onChange={e => set('transport', 'mode', e.target.value)}
                >
                  {TRANSPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Electricity */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>⚡ Home Electricity</h3>
            <div className="form-group" style={{ margin: 0, maxWidth: 320 }}>
              <label className="form-label">Monthly usage (kWh)</label>
              <input
                className="form-input" type="number" min="0" step="10"
                value={form.electricity.monthlyKwh}
                onChange={e => set('electricity', 'monthlyKwh', e.target.value)}
              />
              <p className="form-hint">Average Indian household: 80–200 kWh/month</p>
            </div>
          </div>

          {/* Flights */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>✈️ Air Travel (per year)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Domestic flights</label>
                <input
                  className="form-input" type="number" min="0" step="1"
                  value={form.flights.domesticFlights}
                  onChange={e => set('flights', 'domesticFlights', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">International flights</label>
                <input
                  className="form-input" type="number" min="0" step="1"
                  value={form.flights.internationalFlights}
                  onChange={e => set('flights', 'internationalFlights', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Diet */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>🍽️ Diet</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Meat meals per week</label>
                <input
                  className="form-input" type="number" min="0" max="21" step="1"
                  value={form.diet.meatMealsPerWeek}
                  onChange={e => set('diet', 'meatMealsPerWeek', e.target.value)}
                />
                <p className="form-hint">0 = full vegetarian</p>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Dairy servings per day</label>
                <input
                  className="form-input" type="number" min="0" max="10" step="1"
                  value={form.diet.dairyServingsPerDay}
                  onChange={e => set('diet', 'dairyServingsPerDay', e.target.value)}
                />
                <p className="form-hint">milk, yogurt, cheese etc.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ fontSize: '1rem', padding: '15px' }}>
            🧮 Calculate My Yearly Footprint
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="result-box" style={{ marginTop: 32 }}>
            <p className="result-title">Your Yearly Carbon Footprint</p>
            <div className="result-value">
              {result.total}
              <span style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginLeft: 8 }}>tons CO₂</span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <span className={`badge ${status.color}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                {status.label}
              </span>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                🌍 Global avg: 4 tons
              </span>
            </div>

            {/* Breakdown cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 28 }}>
              {[
                ['🚗', 'Transport',   result.transport],
                ['⚡', 'Electricity', result.electricity],
                ['✈️', 'Flights',     result.flights],
                ['🍽️', 'Diet',        result.diet],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ background: 'var(--bg-card)', padding: '16px 12px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-lime)', fontSize: '1.15rem' }}>{val}t</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Progress vs global avg */}
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Your footprint vs. global average</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{result.total}t / 4t</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min((result.total / 8) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Trees to offset */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '16px', marginTop: 20 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 4 }}>
                🌲 Trees needed to fully offset per year:
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--accent-lime)' }}>
                {calcTreesNeeded(result.total * 1000)} trees
              </p>
            </div>

            {/* Pie chart */}
            {pieData.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>Emission Breakdown</p>
                <EmissionPieChart data={pieData} />
              </div>
            )}

            {/* Tips */}
            <div style={{ textAlign: 'left', marginTop: 24 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>💡 Reduction Tips</p>
              {result.total > 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.transport > 1 && <div className="alert alert-info" style={{ marginBottom: 0 }}>🚌 Switch to public transport 3 days/week — could save ~0.5t CO₂/year</div>}
                  {result.flights > 0.5 && <div className="alert alert-info" style={{ marginBottom: 0 }}>🚆 Replace short flights with train journeys — up to 10x lower emissions</div>}
                  {result.diet > 0.8 && <div className="alert alert-info" style={{ marginBottom: 0 }}>🥗 One meatless day per week saves ~0.3t CO₂/year</div>}
                </div>
              )}
              {result.total <= 4 && (
                <div className="alert alert-success">✅ Great job! Keep tracking your habits to maintain this footprint.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}