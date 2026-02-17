'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import TourForm from '@/components/admin/TourForm';
import RoomCard from '@/components/admin/RoomCard';
import SceneCard from '@/components/admin/SceneCard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { TourConfig } from '@/types/tour';
import { Property } from '@/types/admin';

export default function TourDetailPage() {
  const params = useParams();
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<TourConfig | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Floor management
  const [addingFloor, setAddingFloor] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');
  const [savingFloor, setSavingFloor] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editFloorName, setEditFloorName] = useState('');
  const [deleteFloorId, setDeleteFloorId] = useState<string | null>(null);

  // Room management
  const [addingRoomFloorId, setAddingRoomFloorId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [savingRoom, setSavingRoom] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  // Legacy scene delete (for unassigned photos)
  const [deleteSceneId, setDeleteSceneId] = useState<string | null>(null);

  // Share link
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/tour/${tourId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [tourId]);

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

  // Floor handlers
  const handleAddFloor = async () => {
    if (!newFloorName.trim()) return;
    setSavingFloor(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}/floors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFloorName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTour(data.data);
        setNewFloorName('');
        setAddingFloor(false);
      }
    } finally {
      setSavingFloor(false);
    }
  };

  const handleRenameFloor = async (floorId: string) => {
    if (!editFloorName.trim()) return;
    const res = await fetch(`/api/admin/tours/${tourId}/floors/${floorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editFloorName.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setTour(data.data);
      setEditingFloorId(null);
      setEditFloorName('');
    }
  };

  const handleDeleteFloor = async (floorId: string) => {
    const res = await fetch(`/api/admin/tours/${tourId}/floors/${floorId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (data.success) {
      setTour(data.data);
      setDeleteFloorId(null);
    }
  };

  // Room handlers
  const handleAddRoom = async (floorId: string) => {
    if (!newRoomName.trim()) return;
    setSavingRoom(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName.trim(), floorId }),
      });
      const data = await res.json();
      if (data.success) {
        setTour(data.data);
        setNewRoomName('');
        setAddingRoomFloorId(null);
      }
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const res = await fetch(`/api/admin/tours/${tourId}/rooms/${roomId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (data.success) {
      setTour(data.data);
      setDeleteRoomId(null);
    }
  };

  // Legacy: delete unassigned scene
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

  const floors = [...(tour.floors || [])].sort((a, b) => a.order - b.order);
  const rooms = tour.rooms || [];
  const unassignedScenes = tour.scenes.filter(s => !s.roomId);

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
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleCopyLink}
            >
              {linkCopied ? 'Copied!' : 'Copy Client Link'}
            </button>
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

      {/* Floors Section */}
      <div style={{ marginTop: editing ? 0 : 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Floors</h2>
          {!addingFloor && (
            <button
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={() => setAddingFloor(true)}
            >
              + Add Floor
            </button>
          )}
        </div>

        {/* Add Floor Inline Form */}
        {addingFloor && (
          <div className="admin-floor-add-form">
            <input
              className="admin-input"
              type="text"
              value={newFloorName}
              onChange={e => setNewFloorName(e.target.value)}
              placeholder="e.g. Ground Floor, 2nd Floor"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddFloor();
                if (e.key === 'Escape') { setAddingFloor(false); setNewFloorName(''); }
              }}
            />
            <button
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={handleAddFloor}
              disabled={savingFloor || !newFloorName.trim()}
            >
              {savingFloor ? 'Adding...' : 'Add'}
            </button>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => { setAddingFloor(false); setNewFloorName(''); }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Empty State */}
        {floors.length === 0 && unassignedScenes.length === 0 && !addingFloor && (
          <div className="admin-empty">
            <div className="admin-empty-icon">+</div>
            <div className="admin-empty-title">No floors yet</div>
            <p className="admin-empty-text">Add floors to organize rooms in this tour.</p>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setAddingFloor(true)}
            >
              + Add First Floor
            </button>
          </div>
        )}

        {/* Floor Sections */}
        {floors.map((floor, floorIndex) => {
          const floorRooms = rooms.filter(r => r.floorId === floor.id);
          const isEditingThis = editingFloorId === floor.id;
          const isAddingRoom = addingRoomFloorId === floor.id;

          return (
            <div key={floor.id} className="admin-floor-section">
              <div className="admin-floor-header">
                {isEditingThis ? (
                  <div className="admin-floor-edit-form">
                    <input
                      className="admin-input"
                      type="text"
                      value={editFloorName}
                      onChange={e => setEditFloorName(e.target.value)}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenameFloor(floor.id);
                        if (e.key === 'Escape') { setEditingFloorId(null); setEditFloorName(''); }
                      }}
                    />
                    <button
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      onClick={() => handleRenameFloor(floor.id)}
                      disabled={!editFloorName.trim()}
                    >
                      Save
                    </button>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => { setEditingFloorId(null); setEditFloorName(''); }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="admin-floor-title">
                      <span className="admin-floor-badge">F{floorIndex + 1}</span>
                      {floor.name}
                      <span className="admin-floor-count">
                        {floorRooms.length} {floorRooms.length === 1 ? 'room' : 'rooms'}
                      </span>
                    </h3>
                    <div className="admin-floor-actions">
                      <button
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        onClick={() => { setAddingRoomFloorId(floor.id); setNewRoomName(''); }}
                      >
                        + Add Room
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => { setEditingFloorId(floor.id); setEditFloorName(floor.name); }}
                      >
                        Rename
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setDeleteFloorId(floor.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Inline Add Room Form */}
              {isAddingRoom && (
                <div className="admin-room-add-form">
                  <input
                    className="admin-input"
                    type="text"
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    placeholder="e.g. Kitchen, Living Room, Bedroom"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddRoom(floor.id);
                      if (e.key === 'Escape') { setAddingRoomFloorId(null); setNewRoomName(''); }
                    }}
                  />
                  <button
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => handleAddRoom(floor.id)}
                    disabled={savingRoom || !newRoomName.trim()}
                  >
                    {savingRoom ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => { setAddingRoomFloorId(null); setNewRoomName(''); }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {floorRooms.length === 0 && !isAddingRoom ? (
                <div className="admin-floor-empty">
                  No rooms on this floor yet.{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setAddingRoomFloorId(floor.id); setNewRoomName(''); }}>
                    Add a room
                  </a>
                </div>
              ) : floorRooms.length > 0 ? (
                <div className="admin-card-grid">
                  {floorRooms.map(room => {
                    const roomPhotos = tour.scenes.filter(s => s.roomId === room.id);
                    return (
                      <RoomCard
                        key={room.id}
                        tourId={tourId}
                        room={room}
                        photos={roomPhotos}
                        onDelete={(id) => setDeleteRoomId(id)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}

        {/* Unassigned Photos (backward compat for scenes without roomId) */}
        {unassignedScenes.length > 0 && (
          <div className="admin-floor-section">
            <div className="admin-floor-header">
              <h3 className="admin-floor-title">
                Unassigned Photos
                <span className="admin-floor-count">{unassignedScenes.length}</span>
              </h3>
            </div>
            <div className="admin-card-grid">
              {unassignedScenes.map(scene => (
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
          </div>
        )}
      </div>

      {/* Delete Room Dialog */}
      {deleteRoomId && (
        <ConfirmDialog
          title="Delete Room"
          message="This will permanently delete this room and all its photos, including hotspots. This action cannot be undone."
          onConfirm={() => handleDeleteRoom(deleteRoomId)}
          onCancel={() => setDeleteRoomId(null)}
        />
      )}

      {/* Delete Scene Dialog (for unassigned photos) */}
      {deleteSceneId && (
        <ConfirmDialog
          title="Delete Photo"
          message="This will permanently delete this photo and all its hotspots. This action cannot be undone."
          onConfirm={() => handleDeleteScene(deleteSceneId)}
          onCancel={() => setDeleteSceneId(null)}
        />
      )}

      {/* Delete Floor Dialog */}
      {deleteFloorId && (
        <ConfirmDialog
          title="Delete Floor"
          message="This will permanently delete this floor, all rooms within it, and all their photos. This action cannot be undone."
          onConfirm={() => handleDeleteFloor(deleteFloorId)}
          onCancel={() => setDeleteFloorId(null)}
        />
      )}
    </>
  );
}
