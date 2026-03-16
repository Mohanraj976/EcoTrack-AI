// src/pages/HabitTracker.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { HABIT_SAVINGS } from '../services/carbonService';
import { addHabit, getUserHabits } from '../firebase/firestore';
import { updateUserDocument } from '../firebase/firestore';

const BADGES = [
  { id: 'first_habit', label: '🌱 First Step', threshold: 1 },
  { id: 'eco10',       label: '♻️ Eco Warrior', threshold: 10 },
  { id: 'eco50',       label: '🌍 Planet Guardian', threshold: 50 },
  { id: 'pts100',      label: '⚡ Green Champion', threshold: 100, type: 'points' },
];

export default function HabitTracker() {
  const { user, userDoc, refreshUserDoc } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getUserHabits(user.uid).then(setHabits); }, [user]);

  const totalSaved = habits.reduce((s, h) => s + (h.saving || 0), 0).toFixed(1);

  const handleLog = async (key) => {
    const habit = HABIT_SAVINGS[key];
    setLoading(true);
    try {
      await addHabit(user.uid, { key, label: habit.label, saving: habit.saving, points: habit.points });
      await updateUserDocument(user.uid, {
        ecoPoints: (userDoc?.ecoPoints || 0) + habit.points
      });
      await refreshUserDoc();
      setHabits(await getUserHabits(user.uid));
      toast.success(`+${habit.points} eco points! -${habit.saving} kg CO₂`);
    } catch (err) {
      toast.error('Failed to log habit');
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = BADGES.filter(b => {
    if (b.type === 'points') return (userDoc?.ecoPoints || 0) >= b.threshold;
    return habits.length >= b.threshold;
  });

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🏆 Green Habit Tracker</h1>
          <p className="page-subtitle">Earn eco points for sustainable actions. Build a greener lifestyle.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {[
            { icon: '⚡', value: userDoc?.ecoPoints || 0, label: 'Eco Points' },
            { icon: '💨', value: `${totalSaved} kg`, label: 'CO₂ Saved' },
            { icon: '🎯', value: habits.length, label: 'Habits Logged' },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Log a Green Action</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(HABIT_SAVINGS).map(([key, habit]) => (
                <button key={key} onClick={() => handleLog(key)} disabled={loading}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', transition: 'var(--transition)' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{habit.label}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-green">-{habit.saving} kg</span>
                    <span className="badge badge-teal">+{habit.points} pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>🏅 Badges</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {BADGES.map(b => (
                  <div key={b.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10, textAlign: 'center', opacity: earnedBadges.find(e => e.id === b.id) ? 1 : 0.3 }}>
                    <div style={{ fontSize: '1.8rem' }}>{b.label.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>{b.label.split(' ').slice(1).join(' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Recent Actions</h3>
              {habits.slice(0, 5).map(h => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{h.label}</span>
                  <span className="badge badge-green">-{h.saving} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}