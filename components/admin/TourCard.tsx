'use client';

import Link from 'next/link';
import { TourIndexEntry } from '@/types/admin';

interface TourCardProps {
  tour: TourIndexEntry;
  onDelete: (id: string) => void;
}

export default function TourCard({ tour, onDelete }: TourCardProps) {
  return (
    <div className="admin-card">
      <Link href={`/admin/tours/${tour.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="admin-card-thumbnail">
          {tour.thumbnail ? (
            <img src={tour.thumbnail} alt={tour.name} />
          ) : (
            <div className="admin-card-placeholder">360</div>
          )}
        </div>
        <div className="admin-card-body">
          <h3 className="admin-card-title">{tour.name}</h3>
          <div className="admin-card-meta">
            <span>{tour.sceneCount} {tour.sceneCount === 1 ? 'room' : 'rooms'}</span>
            <span>{new Date(tour.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
      <div className="admin-card-actions">
        <Link href={`/tour/${tour.id}`} target="_blank" className="admin-btn admin-btn-secondary admin-btn-sm">
          Preview
        </Link>
        <button
          className="admin-btn admin-btn-danger admin-btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(tour.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
