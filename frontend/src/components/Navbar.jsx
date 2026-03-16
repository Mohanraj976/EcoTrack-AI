// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../firebase/auth';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tracker', label: 'Tracker' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/habits', label: 'Habits' },
  { to: '/upload-bill', label: 'Bill Scanner' },
  { to: '/product-scanner', label: 'Products' },
  { to: '/tree-offset', label: 'Tree Offset' },
];

export default function Navbar() {
  const { user, userDoc } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav style={{
      background: 'rgba(10,20,10,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e3a1e', position: 'sticky', top: 0, zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>🌱</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-lime)', letterSpacing: '-0.02em' }}>
            EcoTrack AI
          </span>
        </Link>

        {user && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: 500,
                color: location.pathname === link.to ? 'var(--accent-lime)' : 'var(--text-secondary)',
                background: location.pathname === link.to ? 'rgba(165,214,91,0.1)' : 'transparent',
                transition: 'var(--transition)'
              }}>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              {userDoc && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(76,175,80,0.1)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                  <span>⚡</span> {userDoc.ecoPoints || 0} pts
                </span>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}