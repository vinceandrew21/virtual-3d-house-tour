'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import { Property } from '@/types/admin';
import { TourConfig } from '@/types/tour';

export default function NewScenePage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [tourName, setTourName] = useState('Tour');

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/tours/${tourId}`).then(r => r.json()),
      fetch('/api/admin/properties').then(r => r.json()),
    ]).then(([tourData, propsData]) => {
      if (tourData.success) setTourName(tourData.data.name);
      if (propsData.success) {
        const p = (propsData.data as Property[]).find(p => p.tourIds.includes(tourId));
        setProperty(p || null);
      }
    });
  }, [tourId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || imageFiles.length === 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (description.trim()) formData.append('description', description.trim());

      // Append each image file
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`/api/admin/tours/${tourId}/scenes`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/admin/tours/${tourId}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const photoCount = imageFiles.length;

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          ...(property ? [{ label: property.name, href: `/admin/properties/${property.id}` }] : []),
          { label: tourName, href: `/admin/tours/${tourId}` },
          { label: 'New Room' },
        ]}
        title="Add New Room"
        description="Upload one or more 360 photos to add a new room to this tour"
      />

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label className="admin-label">Room Name</label>
          <input
            className="admin-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Living Room, Kitchen, Bedroom"
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Description (optional)</label>
          <textarea
            className="admin-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe this room..."
          />
        </div>

        <ImageUpload
          multiple
          onFileSelect={(file) => setImageFiles([file])}
          onFilesSelect={setImageFiles}
        />

        {photoCount > 1 && (
          <div className="admin-upload-file-count">
            {photoCount} photos selected — navigation hotspots will be auto-created between consecutive photos
          </div>
        )}

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={submitting || !name.trim() || photoCount === 0}
          >
            {submitting
              ? `Uploading ${photoCount} photo${photoCount !== 1 ? 's' : ''}...`
              : photoCount > 1
                ? `Add Room (${photoCount} photos)`
                : 'Add Room'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => router.push(`/admin/tours/${tourId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
