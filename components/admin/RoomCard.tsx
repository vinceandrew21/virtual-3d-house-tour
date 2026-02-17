'use client';

import Link from 'next/link';
import { Room, Scene } from '@/types/tour';

interface RoomCardProps {
  tourId: string;
  room: Room;
  photos: Scene[];
  onDelete: (id: string) => void;
}

export default function RoomCard({ tourId, room, photos, onDelete }: RoomCardProps) {
  const firstPhoto = photos.find(p => p.imageUrl);

  return (
    <div className="admin-card">
      <Link href={`/admin/tours/${tourId}/rooms/${room.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="admin-card-thumbnail">
          {firstPhoto?.imageUrl ? (
            <img src={firstPhoto.imageUrl} alt={room.name} />
          ) : (
            <div className="admin-card-placeholder">No Photos</div>
          )}
        </div>
        <div className="admin-card-body">
          <h3 className="admin-card-title">{room.name}</h3>
          {room.description && (
            <div className="admin-card-subtitle">{room.description}</div>
          )}
          <div className="admin-card-meta">
            <span>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>
          </div>
        </div>
      </Link>
      <div className="admin-card-actions">
        <button
          className="admin-btn admin-btn-danger admin-btn-sm"
          onClick={(e) => { e.stopPropagation(); onDelete(room.id); }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
