'use client';

import { useState } from 'react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError('Invalid password');
        setPassword('');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-backdrop">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="admin-login-title">Admin Access</h1>
          <p className="admin-login-subtitle">Enter the password to continue</p>
        </div>

        {error && (
          <div className="admin-login-error">{error}</div>
        )}

        <div className="admin-field">
          <input
            className="admin-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            required
          />
        </div>

        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          style={{ width: '100%' }}
          disabled={submitting || !password.trim()}
        >
          {submitting ? 'Verifying...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
