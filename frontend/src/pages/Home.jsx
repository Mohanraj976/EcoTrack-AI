// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📄', title: 'AI Bill Scanner', desc: 'Upload your electricity bill and get instant carbon emission analysis.', to: '/upload-bill' },
  { icon: '📊', title: 'Daily Tracker', desc: 'Log travel, energy and food habits to track daily emissions.', to: '/tracker' },
  { icon: '🧮', title: 'Carbon Calculator', desc: 'Estimate your yearly carbon footprint based on lifestyle inputs.', to: '/calculator' },
  { icon: '🏆', title: 'Green Habits', desc: 'Earn eco points and badges for sustainable actions.', to: '/habits' },
  { icon: '📦', title: 'Product Scanner', desc: 'Scan barcodes to discover the carbon footprint of products.', to: '/product-scanner' },
  { icon: '🌲', title: 'Tree Offset', desc: 'Calculate how many trees you need to plant to neutralize your emissions.', to: '/tree-offset' },
];

const stats = [
  { number: '8B+', label: 'Tons CO₂ emitted yearly globally' },
  { number: '4 tons', label: 'Global average per person / year' },
  { number: '21 kg', label: 'CO₂ absorbed per tree per year' },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '96px 0 80px', background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(76,175,80,0.12) 0%, transparent 70%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 24, fontSize: '0.85rem', color: 'var(--accent-green)' }}>
            🌍 AI-Powered Carbon Reduction Platform
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Track, Reduce &<br />
            <span style={{ color: 'var(--accent-lime)' }}>Offset Your Carbon</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Use AI to scan electricity bills, track daily habits, calculate your footprint, and plant trees to offset your impact on the planet.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>Get Started Free</Link>
                <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>Log In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '48px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-lime)' }}>{s.number}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Everything you need to go green
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 10 }}>Powerful AI tools for every step of your sustainability journey.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map(f => (
              <Link key={f.to} to={user ? f.to : '/signup'} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, fontSize: '1.1rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '80px 0', textAlign: 'center', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>
              Start your green journey today 🌱
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Free to use. No credit card required.</p>
            <Link to="/signup" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 40px' }}>Create Free Account</Link>
          </div>
        </section>
      )}
    </div>
  );
}