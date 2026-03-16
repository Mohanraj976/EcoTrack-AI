// src/pages/Tracker.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ActivityForm from '../components/ActivityForm';
import { addActivity, getUserActivities } from '../firebase/firestore';
import { EmissionLineChart } from '../components/ChartCard';

export default function Tracker() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('form'); // 'form' | 'history'

  useEffect(() => {
    if (user) getUserActivities(user.uid).then(setActivities);
  }, [user]);

  const todayActivities = activities.filter(a => {
    const d = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    return d.toDateString() === new Date().toDateString();
  });

  const totalToday = todayActivities.reduce((s, a) => s + (a.emission || 0), 0).toFixed(2);
  const totalAll = activities.reduce((s, a) => s + (a.emission || 0), 0).toFixed(1);

  // Build last 7 days chart data
  const chartData = (() => {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toLocaleDateString()] = 0;
    }
    activities.forEach(a => {
      const d = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const key = d.toLocaleDateString();
      if (key in days) days[key] += a.emission || 0;
    });
    return Object.entries(days).map(([date, emission]) => ({
      date: date.slice(0, 5), emission: parseFloat(emission.toFixed(2))
    }));
  })();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await addActivity(user.uid, data);
      const updated = await getUserActivities(user.uid);
      setActivities(updated);
      toast.success(`✅ Logged ${data.emission} kg CO₂`);
    } catch (err) {
      toast.error('Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const emissionColor = (e) => {
    if (e < 1) return 'badge-green';
    if (e < 3) return 'badge-yellow';
    return 'badge-red';
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📊 Daily Carbon Tracker</h1>
          <p className="page-subtitle">Log your daily travel, energy usage and food habits to track emissions.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
          {[
            { icon: '☀️', value: `${totalToday} kg`, label: "Today's Emissions" },
            { icon: '📦', value: activities.length,  label: 'Activities Logged' },
            { icon: '💨', value: `${totalAll} kg`,   label: 'Total CO₂ Logged' },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 7-day chart */}
        <div className="card" style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
            Last 7 Days
          </h3>
          <EmissionLineChart data={chartData} />
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['form', 'history'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '8px 20px', fontSize: '0.88rem' }}
            >
              {t === 'form' ? '+ Log Activity' : '📋 History'}
            </button>
          ))}
        </div>

        {tab === 'form' ? (
          <div className="card" style={{ maxWidth: 500 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Log New Activity</h3>
            <ActivityForm onSubmit={handleSubmit} loading={loading} />
          </div>
        ) : (
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>
              All Activities ({activities.length})
            </h3>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                <p>No activities logged yet. Switch to "Log Activity" to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activities.map(a => {
                  const date = a.createdAt?.toDate
                    ? a.createdAt.toDate().toLocaleDateString()
                    : new Date(a.createdAt || 0).toLocaleDateString();
                  return (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 16px', background: 'var(--bg-secondary)',
                        borderRadius: 10, border: '1px solid var(--border)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.label || a.type}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                          {a.quantity} {a.unit}
                          {a.note ? ` · ${a.note}` : ''}
                          {' · '}{date}
                        </div>
                      </div>
                      <span className={`badge ${emissionColor(a.emission)}`}>
                        {a.emission} kg CO₂
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}