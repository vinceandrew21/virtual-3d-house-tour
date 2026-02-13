'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import PropertyForm from '@/components/admin/PropertyForm';
import TourCard from '@/components/admin/TourCard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Property, TourIndexEntry } from '@/types/admin';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [tours, setTours] = useState<TourIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteTourId, setDeleteTourId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [propRes, toursRes] = await Promise.all([
        fetch(`/api/admin/properties/${propertyId}`),
        fetch('/api/admin/tours'),
      ]);
      const propData = await propRes.json();
      const toursData = await toursRes.json();

      if (propData.success) {
        setProperty(propData.data);

        // Filter tours to only those belonging to this property
        if (toursData.success) {
          const propertyTourIds = propData.data.tourIds as string[];
          const filtered = (toursData.data as TourIndexEntry[]).filter(t =>
            propertyTourIds.includes(t.id)
          );
          setTours(filtered);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const handleUpdate = async (values: {
    name: string;
    address?: string;
    clientName?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
  }) => {
    const res = await fetch(`/api/admin/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (data.success) {
      setProperty(data.data);
      setEditing(false);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    await fetch(`/api/admin/tours/${tourId}`, { method: 'DELETE' });
    // Also remove from property
    await fetch(`/api/admin/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setDeleteTourId(null);
    fetchData();
  };

  if (loading) {
    return <div className="admin-loading">Loading property...</div>;
  }

  if (!property) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-title">Property not found</div>
        <Link href="/admin" className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const subtitle = [property.clientName, property.address].filter(Boolean).join(' — ');

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: property.name },
        ]}
        title={property.name}
        description={subtitle || 'No details added'}
        action={
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Property'}
          </button>
        }
      />

      {/* Property Info */}
      {!editing && (property.contactPhone || property.contactEmail || property.notes) && (
        <div className="admin-property-info">
          {property.contactPhone && (
            <div className="admin-property-info-item">
              <span className="admin-property-info-label">Phone</span>
              <span>{property.contactPhone}</span>
            </div>
          )}
          {property.contactEmail && (
            <div className="admin-property-info-item">
              <span className="admin-property-info-label">Email</span>
              <span>{property.contactEmail}</span>
            </div>
          )}
          {property.notes && (
            <div className="admin-property-info-item">
              <span className="admin-property-info-label">Notes</span>
              <span>{property.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div style={{ marginBottom: 32 }}>
          <PropertyForm
            initialValues={{
              name: property.name,
              address: property.address,
              clientName: property.clientName,
              contactPhone: property.contactPhone,
              contactEmail: property.contactEmail,
              notes: property.notes,
            }}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
          />
        </div>
      )}

      {/* Tours Section */}
      <div style={{ marginTop: editing ? 0 : 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Tours ({tours.length})</h2>
          <Link
            href={`/admin/properties/${propertyId}/tours/new`}
            className="admin-btn admin-btn-primary admin-btn-sm"
          >
            + Add Tour
          </Link>
        </div>

        {tours.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">+</div>
            <div className="admin-empty-title">No tours yet</div>
            <p className="admin-empty-text">Create a virtual tour for this property.</p>
            <Link
              href={`/admin/properties/${propertyId}/tours/new`}
              className="admin-btn admin-btn-primary"
            >
              + Add First Tour
            </Link>
          </div>
        ) : (
          <div className="admin-card-grid">
            {tours.map(tour => (
              <TourCard
                key={tour.id}
                tour={tour}
                onDelete={(id) => setDeleteTourId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {deleteTourId && (
        <ConfirmDialog
          title="Delete Tour"
          message="This will permanently delete this tour and all its scenes, photos, and hotspots. This action cannot be undone."
          onConfirm={() => handleDeleteTour(deleteTourId)}
          onCancel={() => setDeleteTourId(null)}
        />
      )}
    </>
  );
}
