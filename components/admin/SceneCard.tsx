'use client';

import Link from 'next/link';
import { Scene } from '@/types/tour';

interface SceneCardProps {
  tourId: string;
  scene: Scene;
  isDefault: boolean;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function SceneCard({ tourId, scene, isDefault, onDelete, onSetDefault }: SceneCardProps) {
  return (
    <div className="admin-card">
      <Link href={`/admin/tours/${tourId}/scenes/${scene.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="admin-card-thumbnail">
          {scene.imageUrl ? (
            <img src={scene.imageUrl} alt={scene.name} />
          ) : (
            <div className="admin-card-placeholder">No Photo</div>
          )}
        </div>
        <div className="admin-card-body">
          <h3 className="admin-card-title">
            {scene.name}
            {isDefault && <span className="admin-badge admin-badge-default" style={{ marginLeft: 8 }}>Default</span>}
          </h3>
          <div className="admin-card-meta">
            <span>{scene.hotspots.length} {scene.hotspots.length === 1 ? 'hotspot' : 'hotspots'}</span>
          </div>
        </div>
      </Link>
      <div className="admin-card-actions">
        {!isDefault && (
          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={(e) => { e.stopPropagation(); onSetDefault(scene.id); }}
          >
            Set Default
          </button>
        )}
        <button
          className="admin-btn admin-btn-danger admin-btn-sm"
          onClick={(e) => { e.stopPropagation(); onDelete(scene.id); }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
