import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadBill from './pages/UploadBill';
import Tracker from './pages/Tracker';
import Calculator from './pages/Calculator';
import HabitTracker from './pages/HabitTracker';
import ProductScanner from './pages/ProductScanner';
import Dashboard from './pages/Dashboard';
import TreeOffset from './pages/TreeOffset';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Redirects logged-in users away from login/signup
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload-bill" element={<ProtectedRoute><UploadBill /></ProtectedRoute>} />
          <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><HabitTracker /></ProtectedRoute>} />
          <Route path="/product-scanner" element={<ProtectedRoute><ProductScanner /></ProtectedRoute>} />
          <Route path="/tree-offset" element={<ProtectedRoute><TreeOffset /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1a2e1a', color: '#a8d8a8', border: '1px solid #3d7a3d' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}