'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import { Property } from '@/types/admin';
import { TourConfig, Floor, Room } from '@/types/tour';

export default function NewScenePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = params.tourId as string;
  const floorId = searchParams.get('floorId');
  const roomId = searchParams.get('roomId');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [tourName, setTourName] = useState('Tour');
  const [floorName, setFloorName] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/tours/${tourId}`).then(r => r.json()),
      fetch('/api/admin/properties').then(r => r.json()),
    ]).then(([tourData, propsData]) => {
      if (tourData.success) {
        const t = tourData.data as TourConfig;
        setTourName(t.name);
        if (floorId && t.floors) {
          const floor = t.floors.find((f: Floor) => f.id === floorId);
          setFloorName(floor?.name || null);
        }
        if (roomId && t.rooms) {
          const room = t.rooms.find((r: Room) => r.id === roomId);
          setRoomName(room?.name || null);
        }
      }
      if (propsData.success) {
        const p = (propsData.data as Property[]).find(p => p.tourIds.includes(tourId));
        setProperty(p || null);
      }
    });
  }, [tourId, floorId, roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || imageFiles.length === 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (description.trim()) formData.append('description', description.trim());
      if (floorId) formData.append('floorId', floorId);
      if (roomId) formData.append('roomId', roomId);

      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`/api/admin/tours/${tourId}/scenes`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        if (roomId) {
          router.push(`/admin/tours/${tourId}/rooms/${roomId}`);
        } else {
          router.push(`/admin/tours/${tourId}`);
        }
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
          ...(floorName ? [{ label: floorName }] : []),
          ...(roomName && roomId ? [{ label: roomName, href: `/admin/tours/${tourId}/rooms/${roomId}` }] : []),
          { label: 'Add Photos' },
        ]}
        title="Add Photos"
        description={roomName ? `Upload 360 photos to ${roomName}` : 'Upload one or more 360 photos'}
      />

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label className="admin-label">Photo Name</label>
          <input
            className="admin-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. View 1, Corner A, Entrance"
            required
          />
          <span className="admin-field-hint">
            When uploading multiple photos, they will be numbered automatically
          </span>
        </div>

        <div className="admin-field">
          <label className="admin-label">Description (optional)</label>
          <textarea
            className="admin-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe these photos..."
          />
        </div>

        <ImageUpload
          multiple
          onFileSelect={(file) => setImageFiles([file])}
          onFilesSelect={setImageFiles}
        />

        {photoCount > 1 && (
          <div className="admin-upload-file-count">
            {photoCount} photos selected
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
                ? `Upload ${photoCount} Photos`
                : 'Upload Photo'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              if (roomId) {
                router.push(`/admin/tours/${tourId}/rooms/${roomId}`);
              } else {
                router.push(`/admin/tours/${tourId}`);
              }
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
