// src/components/ActivityForm.jsx
import React, { useState } from 'react';
import { EMISSION_FACTORS } from '../services/carbonService';

const ACTIVITY_TYPES = [
  { value: 'car_petrol',    label: '🚗 Car (Petrol)', unit: 'km' },
  { value: 'car_diesel',    label: '🚙 Car (Diesel)', unit: 'km' },
  { value: 'motorbike',     label: '🏍️ Motorbike', unit: 'km' },
  { value: 'bus',           label: '🚌 Bus', unit: 'km' },
  { value: 'train',         label: '🚆 Train', unit: 'km' },
  { value: 'electricity',   label: '⚡ Electricity', unit: 'kWh' },
  { value: 'flight_domestic', label: '✈️ Domestic Flight', unit: 'km' },
];

export default function ActivityForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ type: 'car_petrol', quantity: '', note: '' });

  const selectedActivity = ACTIVITY_TYPES.find(a => a.value === form.type);
  const previewEmission = form.quantity
    ? ((parseFloat(form.quantity) || 0) * (EMISSION_FACTORS[form.type] || 0)).toFixed(2)
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.quantity || parseFloat(form.quantity) <= 0) return;
    onSubmit({
      type: form.type,
      quantity: parseFloat(form.quantity),
      unit: selectedActivity?.unit,
      emission: parseFloat(previewEmission),
      note: form.note,
      label: selectedActivity?.label
    });
    setForm(f => ({ ...f, quantity: '', note: '' }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Activity Type</label>
        <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {ACTIVITY_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Amount ({selectedActivity?.unit})</label>
        <input
          className="form-input" type="number" min="0" step="0.1"
          placeholder={`Enter ${selectedActivity?.unit}`}
          value={form.quantity}
          onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
          required
        />
        {previewEmission && (
          <p className="form-hint" style={{ color: 'var(--accent-lime)', fontWeight: 600 }}>
            ≈ {previewEmission} kg CO₂
          </p>
        )}
      </div>
      <div className="form-group">
        <label className="form-label">Note (optional)</label>
        <input className="form-input" type="text" placeholder="e.g. Commute to work" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
      </div>
      <button type="submit" className="btn btn-primary btn-full" disabled={loading || !form.quantity}>
        {loading ? 'Logging…' : '+ Log Activity'}
      </button>
    </form>
  );
}