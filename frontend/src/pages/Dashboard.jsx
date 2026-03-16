// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserActivities, getUserBills, getUserHabits, getLeaderboard } from '../firebase/firestore';
import ChartCard, { EmissionLineChart, EmissionBarChart } from '../components/ChartCard';
import { calcTreesNeeded } from '../services/carbonService';

const QUICK_ACTIONS = [
  { to: '/tracker',         icon: '📊', label: 'Log Activity' },
  { to: '/upload-bill',     icon: '📄', label: 'Scan Bill' },
  { to: '/habits',          icon: '🏆', label: 'Log Habit' },
  { to: '/calculator',      icon: '🧮', label: 'Calculator' },
  { to: '/product-scanner', icon: '📦', label: 'Scan Product' },
  { to: '/tree-offset',     icon: '🌲', label: 'Plant Trees' },
];

export default function Dashboard() {
  const { user, userDoc } = useAuth();
  const [activities,   setActivities]   = useState([]);
  const [habits,       setHabits]       = useState([]);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch each collection independently so one failure doesn't block others
      try {
        const acts = await getUserActivities(user.uid, 50);
        setActivities(acts);
      } catch (e) { console.warn('activities fetch failed', e); }

      try {
        const hbts = await getUserHabits(user.uid);
        setHabits(hbts);
      } catch (e) { console.warn('habits fetch failed', e); }

      try {
        const lb = await getLeaderboard();
        setLeaderboard(lb);
      } catch (e) {
        // Leaderboard needs a Firestore index — fails silently until index is created
        console.warn('leaderboard fetch failed (index may be missing)', e);
        setLeaderboard([]);
      }

      // ✅ Always stop loading no matter what
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const totalEmission = activities.reduce((s, a) => s + (a.emission || 0), 0);
  const totalSaved    = habits.reduce((s, h) => s + (h.saving  || 0), 0);
  const treesNeeded   = calcTreesNeeded(totalEmission);

  // Last 7 days line chart
  const lineData = (() => {
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

  // Category bar chart
  const barData = Object.entries(
    activities.reduce((acc, a) => {
      const cat = (a.type || 'other').replace(/_/g, ' ');
      acc[cat] = (acc[cat] || 0) + (a.emission || 0);
      return acc;
    }, {})
  ).map(([category, emission]) => ({ category, emission: parseFloat(emission.toFixed(2)) }))
   .sort((a, b) => b.emission - a.emission)
   .slice(0, 6);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  const myRank = leaderboard.findIndex(u => u.uid === user?.uid);

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">🌍 Dashboard</h1>
          <p className="page-subtitle">
            Welcome back,{' '}
            <strong style={{ color: 'var(--accent-lime)' }}>
              {user?.displayName || userDoc?.displayName || 'Eco Warrior'}
            </strong>!
            {myRank >= 0 && ` You're ranked #${myRank + 1} on the leaderboard.`}
          </p>
        </div>

        {/* Key stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '💨', value: `${totalEmission.toFixed(1)} kg`, label: 'CO₂ Emitted',  color: 'var(--danger)' },
            { icon: '🌱', value: `${totalSaved.toFixed(1)} kg`,    label: 'CO₂ Saved',     color: 'var(--accent-green)' },
            { icon: '⚡', value: userDoc?.ecoPoints    || 0,        label: 'Eco Points',    color: 'var(--accent-teal)' },
            { icon: '🌲', value: userDoc?.treesPlanted || 0,        label: 'Trees Planted', color: 'var(--accent-lime)' },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-number" style={{ color: s.color, fontSize: '1.9rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Offset reminder */}
        {totalEmission > 0 && (
          <div style={{
            background: 'rgba(165,214,91,0.07)', border: '1px solid rgba(165,214,91,0.2)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              🌲 You need{' '}
              <strong style={{ color: 'var(--accent-lime)' }}>{treesNeeded} trees</strong>
              {' '}to offset your logged emissions this year.
            </p>
            <Link to="/tree-offset" className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.82rem' }}>
              Offset Now →
            </Link>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28 }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ textAlign: 'center', padding: '18px 12px', cursor: 'pointer' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {a.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <ChartCard title="Emissions – Last 7 Days" subtitle="Daily CO₂ from tracked activities">
            {lineData.some(d => d.emission > 0)
              ? <EmissionLineChart data={lineData} />
              : <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p style={{ marginBottom: 8 }}>No activity data yet.</p>
                  <Link to="/tracker" style={{ color: 'var(--accent-green)', fontSize: '0.85rem', textDecoration: 'none' }}>
                    Log your first activity →
                  </Link>
                </div>
            }
          </ChartCard>

          <ChartCard title="Emissions by Category" subtitle="All-time breakdown">
            {barData.length > 0
              ? <EmissionBarChart data={barData} />
              : <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p style={{ marginBottom: 8 }}>No category data yet.</p>
                  <Link to="/tracker" style={{ color: 'var(--accent-green)', fontSize: '0.85rem', textDecoration: 'none' }}>
                    Start tracking →
                  </Link>
                </div>
            }
          </ChartCard>
        </div>

        {/* Leaderboard + Recent activities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Leaderboard */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>🏆 Eco Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <p>No leaderboard data yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: 6 }}>
                  Create a Firestore index on <code>ecoPoints</code> to enable this.
                </p>
              </div>
            ) : leaderboard.map((u, i) => {
              const isMe = u.uid === user?.uid;
              return (
                <div key={u.id || u.uid} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                  paddingLeft: isMe ? 8 : 0,
                  background: isMe ? 'rgba(76,175,80,0.05)' : 'transparent',
                  borderRadius: isMe ? 8 : 0,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: '1.1rem', width: 26,
                    color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text-muted)'
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isMe ? 'var(--accent-lime)' : 'var(--text-primary)' }}>
                      {u.displayName || 'Anonymous'} {isMe && '(you)'}
                    </div>
                  </div>
                  <span className="badge badge-teal">⚡ {u.ecoPoints || 0}</span>
                </div>
              );
            })}
          </div>

          {/* Recent activities */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>📋 Recent Activities</h3>
              <Link to="/tracker" style={{ color: 'var(--accent-green)', fontSize: '0.82rem', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: 8 }}>No activities yet.</p>
                <Link to="/tracker" style={{ color: 'var(--accent-green)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Log your first activity →
                </Link>
              </div>
            ) : activities.slice(0, 7).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{a.label || a.type}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{a.quantity} {a.unit}</div>
                </div>
                <span className="badge badge-yellow">{a.emission} kg CO₂</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}