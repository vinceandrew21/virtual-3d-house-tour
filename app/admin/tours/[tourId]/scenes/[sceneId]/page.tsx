'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { TourConfig, Scene, Hotspot, HotspotType } from '@/types/tour';

const PanoramaHotspotEditor = dynamic(
  () => import('@/components/admin/PanoramaHotspotEditor'),
  { ssr: false }
);

const typeBadgeClass: Record<HotspotType, string> = {
  navigation: 'admin-badge-nav',
  info: 'admin-badge-info',
  image: 'admin-badge-image',
  video: 'admin-badge-video',
  link: 'admin-badge-link',
};

export default function SceneDetailPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const sceneId = params.sceneId as string;

  const [tour, setTour] = useState<TourConfig | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(true);

  // Scene editing
  const [editingScene, setEditingScene] = useState(false);
  const [sceneName, setSceneName] = useState('');
  const [sceneDesc, setSceneDesc] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [savingScene, setSavingScene] = useState(false);

  // Click-to-place hotspot
  const [clickedPos, setClickedPos] = useState<{ yaw: number; pitch: number } | null>(null);
  const [placingTarget, setPlacingTarget] = useState('');
  const [placingTooltip, setPlacingTooltip] = useState('');
  const [placingType, setPlacingType] = useState<HotspotType>('navigation');
  const [savingHotspot, setSavingHotspot] = useState(false);

  // Delete
  const [deleteHotspotId, setDeleteHotspotId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/tours/${tourId}`);
      const data = await res.json();
      if (data.success) {
        setTour(data.data);
        const s = data.data.scenes.find((sc: Scene) => sc.id === sceneId);
        setScene(s || null);
        if (s) {
          setSceneName(s.name);
          setSceneDesc(s.description || '');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tourId, sceneId]);

  const handleSaveScene = async () => {
    setSavingScene(true);
    try {
      const formData = new FormData();
      formData.append('name', sceneName.trim());
      formData.append('description', sceneDesc.trim());
      if (newImage) formData.append('image', newImage);

      const res = await fetch(`/api/admin/tours/${tourId}/scenes/${sceneId}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setEditingScene(false);
        setNewImage(null);
        fetchData();
      }
    } finally {
      setSavingScene(false);
    }
  };

  const handlePanoramaClick = useCallback((yaw: number, pitch: number) => {
    setClickedPos({ yaw, pitch });
    setPlacingTarget('');
    setPlacingTooltip('');
    setPlacingType('navigation');
  }, []);

  const handlePlaceHotspot = async () => {
    if (!clickedPos) return;
    setSavingHotspot(true);

    try {
      const body: Record<string, unknown> = {
        type: placingType,
        position: { yaw: clickedPos.yaw, pitch: clickedPos.pitch },
      };
      if (placingTooltip.trim()) body.tooltip = placingTooltip.trim();
      if (placingType === 'navigation' && placingTarget) body.targetScene = placingTarget;

      const res = await fetch(`/api/admin/tours/${tourId}/scenes/${sceneId}/hotspots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setClickedPos(null);
        fetchData();
      }
    } finally {
      setSavingHotspot(false);
    }
  };

  const handleDeleteHotspot = async (hotspotId: string) => {
    await fetch(`/api/admin/tours/${tourId}/scenes/${sceneId}/hotspots/${hotspotId}`, {
      method: 'DELETE',
    });
    setDeleteHotspotId(null);
    fetchData();
  };

  if (loading) {
    return <div className="admin-loading">Loading scene...</div>;
  }

  if (!tour || !scene) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-title">Scene not found</div>
        <Link href={`/admin/tours/${tourId}`} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
          Back to Tour
        </Link>
      </div>
    );
  }

  const otherScenes = tour.scenes.filter(s => s.id !== sceneId);

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: tour.name, href: `/admin/tours/${tourId}` },
          { label: scene.name },
        ]}
        title={scene.name}
        description={scene.description || 'No description'}
        action={
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => { setEditingScene(!editingScene); setClickedPos(null); }}
          >
            {editingScene ? 'Cancel' : 'Edit Room'}
          </button>
        }
      />

      {/* Edit Scene Form */}
      {editingScene && (
        <div style={{ marginBottom: 32 }}>
          <div className="admin-form">
            <div className="admin-field">
              <label className="admin-label">Room Name</label>
              <input
                className="admin-input"
                type="text"
                value={sceneName}
                onChange={e => setSceneName(e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Description</label>
              <textarea
                className="admin-textarea"
                value={sceneDesc}
                onChange={e => setSceneDesc(e.target.value)}
              />
            </div>
            <ImageUpload
              onFileSelect={setNewImage}
              currentImage={scene.imageUrl || undefined}
            />
            <div className="admin-form-actions">
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSaveScene}
                disabled={savingScene || !sceneName.trim()}
              >
                {savingScene ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Panorama Viewer for Hotspot Placement */}
      {scene.imageUrl && !editingScene && (
        <PanoramaHotspotEditor
          imageUrl={scene.imageUrl}
          hotspots={scene.hotspots}
          onPlaceHotspot={handlePanoramaClick}
          pendingMarker={clickedPos}
        />
      )}

      {/* Hotspot placement form (appears after clicking in panorama) */}
      {clickedPos && (
        <div className="admin-place-hotspot-form">
          <div className="admin-place-hotspot-header">
            <span>
              New hotspot at yaw: {clickedPos.yaw}, pitch: {clickedPos.pitch}
            </span>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => setClickedPos(null)}
            >
              Cancel
            </button>
          </div>

          <div className="admin-place-hotspot-fields">
            <div className="admin-field">
              <label className="admin-label">Type</label>
              <select
                className="admin-select"
                value={placingType}
                onChange={e => setPlacingType(e.target.value as HotspotType)}
              >
                <option value="navigation">Navigation (go to another photo)</option>
                <option value="info">Info (text popup)</option>
              </select>
            </div>

            {placingType === 'navigation' && (
              <div className="admin-field">
                <label className="admin-label">Go to</label>
                <select
                  className="admin-select"
                  value={placingTarget}
                  onChange={e => setPlacingTarget(e.target.value)}
                >
                  <option value="">Select a photo/room...</option>
                  {otherScenes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="admin-field">
              <label className="admin-label">Tooltip (optional)</label>
              <input
                className="admin-input"
                type="text"
                value={placingTooltip}
                onChange={e => setPlacingTooltip(e.target.value)}
                placeholder={placingType === 'navigation' ? 'e.g. Go to Kitchen' : 'e.g. About this area'}
              />
            </div>

            <button
              className="admin-btn admin-btn-primary"
              onClick={handlePlaceHotspot}
              disabled={savingHotspot || (placingType === 'navigation' && !placingTarget)}
            >
              {savingHotspot ? 'Placing...' : 'Place Hotspot'}
            </button>
          </div>
        </div>
      )}

      {/* Hotspot List */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>
          Hotspots ({scene.hotspots.length})
        </h2>

        {scene.hotspots.length === 0 ? (
          <div className="admin-empty" style={{ padding: '32px 24px' }}>
            <div className="admin-empty-title">No hotspots yet</div>
            <p className="admin-empty-text">Click anywhere in the panorama above to place a navigation hotspot.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Tooltip</th>
                <th>Position</th>
                <th>Target</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scene.hotspots.map(hotspot => (
                <tr key={hotspot.id}>
                  <td>
                    <span className={`admin-badge ${typeBadgeClass[hotspot.type]}`}>
                      {hotspot.type}
                    </span>
                  </td>
                  <td>{hotspot.tooltip || '-'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {hotspot.position.yaw}, {hotspot.position.pitch}
                  </td>
                  <td>
                    {hotspot.targetScene
                      ? tour.scenes.find(s => s.id === hotspot.targetScene)?.name || hotspot.targetScene
                      : '-'}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setDeleteHotspotId(hotspot.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteHotspotId && (
        <ConfirmDialog
          title="Delete Hotspot"
          message="Are you sure you want to delete this hotspot?"
          onConfirm={() => handleDeleteHotspot(deleteHotspotId)}
          onCancel={() => setDeleteHotspotId(null)}
        />
      )}
    </>
  );
}
