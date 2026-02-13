'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import TourCard from '@/components/admin/TourCard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { TourIndexEntry } from '@/types/admin';

export default function AdminDashboard() {
  const [tours, setTours] = useState<TourIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/admin/tours');
      const data = await res.json();
      if (data.success) {
        setTours(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/tours/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchTours();
  };

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Admin' }]}
        title="Tours"
        description="Manage your virtual tour properties"
        action={
          <Link href="/admin/tours/new" className="admin-btn admin-btn-primary">
            + New Tour
          </Link>
        }
      />

      {loading ? (
        <div className="admin-loading">Loading tours...</div>
      ) : tours.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">360</div>
          <div className="admin-empty-title">No tours yet</div>
          <p className="admin-empty-text">Create your first virtual tour to get started.</p>
          <Link href="/admin/tours/new" className="admin-btn admin-btn-primary">
            + Create Tour
          </Link>
        </div>
      ) : (
        <div className="admin-card-grid">
          {tours.map(tour => (
            <TourCard
              key={tour.id}
              tour={tour}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Tour"
          message="This will permanently delete this tour and all its scenes, photos, and hotspots. This action cannot be undone."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
