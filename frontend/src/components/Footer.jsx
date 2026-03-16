// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
      padding: '40px 0 24px'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '1.4rem' }}>🌱</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-lime)' }}>EcoTrack AI</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              AI-powered carbon reduction platform helping you live more sustainably.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Features</h4>
            {[
              { to: '/upload-bill', label: 'Bill Scanner' },
              { to: '/tracker', label: 'Daily Tracker' },
              { to: '/calculator', label: 'Calculator' },
              { to: '/habits', label: 'Habit Tracker' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 6 }}>{l.label}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>More</h4>
            {[
              { to: '/product-scanner', label: 'Product Scanner' },
              { to: '/tree-offset', label: 'Tree Offset' },
              { to: '/dashboard', label: 'Analytics Dashboard' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 6 }}>{l.label}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Impact</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              🌍 Every action counts.<br/>
              🌲 1 tree = 21 kg CO₂/year<br/>
              ⚡ Track. Reduce. Offset.
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} EcoTrack AI — Built for a greener planet 🌿
        </div>
      </div>
    </footer>
  );
}