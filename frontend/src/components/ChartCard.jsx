// src/components/ChartCard.jsx
import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const COLORS = ['#4caf50', '#a5d65b', '#26c6a2', '#ffb74d', '#e57373', '#80cbc4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#162316', border: '1px solid #2d5a2d', borderRadius: 10, padding: '10px 14px' }}>
        {label && <p style={{ color: '#8aad8a', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, fontSize: '0.9rem', fontWeight: 600 }}>
            {entry.name}: {entry.value} kg CO₂
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function EmissionLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a1e" />
        <XAxis dataKey="date" stroke="#4a6e4a" tick={{ fontSize: 12 }} />
        <YAxis stroke="#4a6e4a" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="emission" stroke="#4caf50" strokeWidth={2} dot={{ fill: '#4caf50' }} name="Emission" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EmissionBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a1e" />
        <XAxis dataKey="category" stroke="#4a6e4a" tick={{ fontSize: 12 }} />
        <YAxis stroke="#4a6e4a" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="emission" fill="#4caf50" radius={[6, 6, 0, 0]} name="Emission" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EmissionPieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => [`${v} tons CO₂`, '']} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card">
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{title}</h3>
        {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}