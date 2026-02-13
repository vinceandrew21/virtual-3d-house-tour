'use client';

import { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const checkAuth = () => {
    fetch('/api/admin/auth')
      .then(r => r.json())
      .then(data => {
        setStatus(data.authenticated ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => setStatus('unauthenticated'));
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (status === 'loading') {
    return (
      <div className="admin-login-backdrop">
        <div className="admin-loading">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <AdminLogin onSuccess={() => setStatus('authenticated')} />;
  }

  return <>{children}</>;
}
