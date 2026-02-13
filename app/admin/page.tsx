'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import PropertyCard from '@/components/admin/PropertyCard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Property } from '@/types/admin';

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/admin/properties');
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchProperties();
  };

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Admin' }]}
        title="Properties"
        description="Manage your properties and virtual tours"
        action={
          <Link href="/admin/properties/new" className="admin-btn admin-btn-primary">
            + New Property
          </Link>
        }
      />

      {loading ? (
        <div className="admin-loading">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.3 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="admin-empty-title">No properties yet</div>
          <p className="admin-empty-text">Create your first property to start organizing virtual tours.</p>
          <Link href="/admin/properties/new" className="admin-btn admin-btn-primary">
            + Create Property
          </Link>
        </div>
      ) : (
        <div className="admin-card-grid">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Property"
          message="This will permanently delete this property and all its tours, scenes, photos, and hotspots. This action cannot be undone."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
