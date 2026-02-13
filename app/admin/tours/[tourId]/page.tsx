'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import TourForm from '@/components/admin/TourForm';
import SceneCard from '@/components/admin/SceneCard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { TourConfig } from '@/types/tour';
import { Property } from '@/types/admin';

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<TourConfig | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteSceneId, setDeleteSceneId] = useState<string | null>(null);

  const fetchTour = async () => {
    try {
      const [tourRes, propsRes] = await Promise.all([
        fetch(`/api/admin/tours/${tourId}`),
        fetch('/api/admin/properties'),
      ]);
      const tourData = await tourRes.json();
      const propsData = await propsRes.json();

      if (tourData.success) {
        setTour(tourData.data);
      }
      if (propsData.success) {
        const ownerProperty = (propsData.data as Property[]).find(p =>
          p.tourIds.includes(tourId)
        );
        setProperty(ownerProperty || null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTour();
  }, [tourId]);

  const handleUpdateTour = async (values: { name: string; description: string; author?: string }) => {
    const res = await fetch(`/api/admin/tours/${tourId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (data.success) {
      setTour(data.data);
      setEditing(false);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    await fetch(`/api/admin/tours/${tourId}/scenes/${sceneId}`, { method: 'DELETE' });
    setDeleteSceneId(null);
    fetchTour();
  };

  const handleSetDefault = async (sceneId: string) => {
    const res = await fetch(`/api/admin/tours/${tourId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultScene: sceneId }),
    });
    const data = await res.json();
    if (data.success) {
      setTour(data.data);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading tour...</div>;
  }

  if (!tour) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-title">Tour not found</div>
        <Link href="/admin" className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          ...(property ? [{ label: property.name, href: `/admin/properties/${property.id}` }] : []),
          { label: tour.name },
        ]}
        title={tour.name}
        description={tour.description}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/tour/${tour.id}`} target="_blank" className="admin-btn admin-btn-secondary">
              Preview Tour
            </Link>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit Details'}
            </button>
          </div>
        }
      />

      {editing && (
        <div style={{ marginBottom: 32 }}>
          <TourForm
            initialValues={{ name: tour.name, description: tour.description, author: tour.author }}
            onSubmit={handleUpdateTour}
            submitLabel="Save Changes"
          />
        </div>
      )}

      {/* Scenes Section */}
      <div style={{ marginTop: editing ? 0 : 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Rooms / Scenes</h2>
          <Link href={`/admin/tours/${tourId}/scenes/new`} className="admin-btn admin-btn-primary admin-btn-sm">
            + Add Room
          </Link>
        </div>

        {tour.scenes.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">+</div>
            <div className="admin-empty-title">No rooms yet</div>
            <p className="admin-empty-text">Upload 360 photos to add rooms to this tour.</p>
            <Link href={`/admin/tours/${tourId}/scenes/new`} className="admin-btn admin-btn-primary">
              + Add First Room
            </Link>
          </div>
        ) : (
          <div className="admin-card-grid">
            {tour.scenes.map(scene => (
              <SceneCard
                key={scene.id}
                tourId={tourId}
                scene={scene}
                isDefault={tour.defaultScene === scene.id}
                onDelete={(id) => setDeleteSceneId(id)}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}
      </div>

      {deleteSceneId && (
        <ConfirmDialog
          title="Delete Room"
          message="This will permanently delete this room, its 360 photo, and all hotspots. This action cannot be undone."
          onConfirm={() => handleDeleteScene(deleteSceneId)}
          onCancel={() => setDeleteSceneId(null)}
        />
      )}
    </>
  );
}
