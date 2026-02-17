'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import SceneCard from '@/components/admin/SceneCard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { TourConfig, Room, Scene } from '@/types/tour';
import { Property } from '@/types/admin';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;
  const roomId = params.roomId as string;

  const [tour, setTour] = useState<TourConfig | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  // Room editing
  const [editingRoom, setEditingRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [savingRoom, setSavingRoom] = useState(false);

  // Photo upload
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Delete photo
  const [deleteSceneId, setDeleteSceneId] = useState<string | null>(null);
  // Delete room
  const [showDeleteRoom, setShowDeleteRoom] = useState(false);

  const fetchData = async () => {
    try {
      const [tourRes, propsRes] = await Promise.all([
        fetch(`/api/admin/tours/${tourId}`),
        fetch('/api/admin/properties'),
      ]);
      const tourData = await tourRes.json();
      const propsData = await propsRes.json();

      if (tourData.success) {
        const t = tourData.data as TourConfig;
        setTour(t);
        const r = (t.rooms || []).find(r => r.id === roomId);
        setRoom(r || null);
        if (r) {
          setRoomName(r.name);
          setRoomDesc(r.description || '');
        }
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
    fetchData();
  }, [tourId, roomId]);

  const handleSaveRoom = async () => {
    if (!roomName.trim()) return;
    setSavingRoom(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName.trim(), description: roomDesc.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingRoom(false);
        fetchData();
      }
    } finally {
      setSavingRoom(false);
    }
  };

  const handleUploadPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim() || uploadFiles.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', uploadName.trim());
      formData.append('roomId', roomId);
      if (room?.floorId) formData.append('floorId', room.floorId);
      uploadFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`/api/admin/tours/${tourId}/scenes`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowUpload(false);
        setUploadName('');
        setUploadFiles([]);
        fetchData();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    await fetch(`/api/admin/tours/${tourId}/scenes/${sceneId}`, { method: 'DELETE' });
    setDeleteSceneId(null);
    fetchData();
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

  const handleDeleteRoom = async () => {
    const res = await fetch(`/api/admin/tours/${tourId}/rooms/${roomId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (data.success) {
      router.push(`/admin/tours/${tourId}`);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading room...</div>;
  }

  if (!tour || !room) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-title">Room not found</div>
        <Link href={`/admin/tours/${tourId}`} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
          Back to Tour
        </Link>
      </div>
    );
  }

  const photos = tour.scenes.filter(s => s.roomId === roomId);
  const floorName = room.floorId
    ? tour.floors?.find(f => f.id === room.floorId)?.name
    : null;

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          ...(property ? [{ label: property.name, href: `/admin/properties/${property.id}` }] : []),
          { label: tour.name, href: `/admin/tours/${tourId}` },
          ...(floorName ? [{ label: floorName }] : []),
          { label: room.name },
        ]}
        title={room.name}
        description={room.description || `${photos.length} photo${photos.length !== 1 ? 's' : ''} in this room`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => { setShowUpload(!showUpload); setEditingRoom(false); }}
            >
              {showUpload ? 'Cancel Upload' : '+ Add Photos'}
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => { setEditingRoom(!editingRoom); setShowUpload(false); }}
            >
              {editingRoom ? 'Cancel' : 'Edit Room'}
            </button>
            <button
              className="admin-btn admin-btn-danger"
              onClick={() => setShowDeleteRoom(true)}
            >
              Delete Room
            </button>
          </div>
        }
      />

      {/* Edit Room Form */}
      {editingRoom && (
        <div style={{ marginBottom: 32 }}>
          <div className="admin-form">
            <div className="admin-field">
              <label className="admin-label">Room Name</label>
              <input
                className="admin-input"
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Description</label>
              <textarea
                className="admin-textarea"
                value={roomDesc}
                onChange={e => setRoomDesc(e.target.value)}
                placeholder="Describe this room..."
              />
            </div>
            <div className="admin-form-actions">
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSaveRoom}
                disabled={savingRoom || !roomName.trim()}
              >
                {savingRoom ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photos Form */}
      {showUpload && (
        <div style={{ marginBottom: 32 }}>
          <form className="admin-form" onSubmit={handleUploadPhotos}>
            <div className="admin-field">
              <label className="admin-label">Photo Name</label>
              <input
                className="admin-input"
                type="text"
                value={uploadName}
                onChange={e => setUploadName(e.target.value)}
                placeholder="e.g. View 1, Corner A, Entrance"
                required
              />
              <span className="admin-field-hint">
                When uploading multiple photos, they will be numbered automatically (e.g. View 1 - 1, View 1 - 2)
              </span>
            </div>

            <ImageUpload
              multiple
              onFileSelect={(file) => setUploadFiles([file])}
              onFilesSelect={setUploadFiles}
            />

            {uploadFiles.length > 1 && (
              <div className="admin-upload-file-count">
                {uploadFiles.length} photos selected
              </div>
            )}

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={uploading || !uploadName.trim() || uploadFiles.length === 0}
              >
                {uploading
                  ? `Uploading ${uploadFiles.length} photo${uploadFiles.length !== 1 ? 's' : ''}...`
                  : uploadFiles.length > 1
                    ? `Upload ${uploadFiles.length} Photos`
                    : 'Upload Photo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Photos Grid */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>
          Photos ({photos.length})
        </h2>

        {photos.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">+</div>
            <div className="admin-empty-title">No photos yet</div>
            <p className="admin-empty-text">Upload 360 photos to this room to get started.</p>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => { setShowUpload(true); setEditingRoom(false); }}
            >
              + Add First Photo
            </button>
          </div>
        ) : (
          <div className="admin-card-grid">
            {photos.map(scene => (
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

      {/* Delete Photo Dialog */}
      {deleteSceneId && (
        <ConfirmDialog
          title="Delete Photo"
          message="This will permanently delete this photo and all its hotspots. This action cannot be undone."
          onConfirm={() => handleDeleteScene(deleteSceneId)}
          onCancel={() => setDeleteSceneId(null)}
        />
      )}

      {/* Delete Room Dialog */}
      {showDeleteRoom && (
        <ConfirmDialog
          title="Delete Room"
          message={`This will permanently delete "${room.name}" and all ${photos.length} photo${photos.length !== 1 ? 's' : ''} within it. This action cannot be undone.`}
          onConfirm={handleDeleteRoom}
          onCancel={() => setShowDeleteRoom(false)}
        />
      )}
    </>
  );
}
