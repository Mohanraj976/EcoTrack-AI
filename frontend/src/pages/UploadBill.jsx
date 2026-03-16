// src/pages/UploadBill.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { uploadBill } from '../services/api';
import { saveBill } from '../firebase/firestore';
import { calcElectricityEmission } from '../services/carbonService';

export default function UploadBill() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] }, maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bill', file);
      const data = await uploadBill(formData);
      setResult(data);
      await saveBill(user.uid, {
        units: data.units,
        emission: data.emission,
        month: data.month,
        filename: file.name
      });
      toast.success('Bill analyzed successfully!');
    } catch (err) {
      // OCR failed — show friendly message, let user use manual entry
      toast.error('AI scan failed. Please use the manual entry below ↓');
    } finally {
      setLoading(false);
    }
  };

  const handleManual = async (e) => {
    e.preventDefault();
    const units = parseFloat(e.target.units.value);
    if (!units) return;
    const emission = calcElectricityEmission(units);
    const res = {
      units,
      emission,
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      source: 'manual'
    };
    setResult(res);
    await saveBill(user.uid, { ...res });
    toast.success('Bill logged!');
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="page-header">
          <h1 className="page-title">📄 AI Bill Scanner</h1>
          <p className="page-subtitle">Upload your electricity bill — AI reads the units and calculates CO₂ emissions instantly.</p>
        </div>

        {/* Formula info */}
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          ⚡ Formula: <strong>Units (kWh) × 0.82</strong> = kg CO₂ emitted
        </div>

        {/* Dropzone */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Upload Bill Image</h3>
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--accent-green)' : 'var(--border-bright)'}`,
              borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? 'rgba(76,175,80,0.05)' : 'transparent',
              transition: 'var(--transition)'
            }}
          >
            <input {...getInputProps()} />
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{file ? '📋' : '☁️'}</div>
            <p style={{ color: file ? 'var(--accent-lime)' : 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
              {file ? file.name : isDragActive ? 'Drop your bill here…' : 'Drag & drop bill here, or click to select'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>PDF or image files supported (max 10 MB)</p>
          </div>
          {file && (
            <button
              onClick={handleAnalyze}
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: 16 }}
            >
              {loading ? '🔍 Analyzing with AI…' : '🔍 Analyze Bill with AI'}
            </button>
          )}
        </div>

        {/* Manual entry */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Or Enter Manually</h3>
          <form onSubmit={handleManual}>
            <div className="form-group">
              <label className="form-label">Units Consumed (kWh)</label>
              <input
                className="form-input"
                type="number"
                name="units"
                min="0"
                step="0.1"
                placeholder="e.g. 250"
                required
              />
              <p className="form-hint">Check your bill for "Units Consumed" or "kWh Used"</p>
            </div>
            <button type="submit" className="btn btn-secondary btn-full">Calculate Emission</button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="result-box">
            <p className="result-title">⚡ Bill Analysis Result</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="stat-card">
                <div className="stat-number">{result.units}<span className="stat-unit"> kWh</span></div>
                <div className="stat-label">Units Consumed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{result.emission}<span className="stat-unit"> kg</span></div>
                <div className="stat-label">CO₂ Emitted</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '14px 20px', marginTop: 8 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                🌲 Trees needed to offset this bill:{' '}
                <strong style={{ color: 'var(--accent-lime)', fontSize: '1.1rem' }}>
                  {Math.ceil(result.emission / 21)}
                </strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                Period: {result.month}
                {result.source === 'manual' && ' · Manually entered'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}