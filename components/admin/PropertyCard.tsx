'use client';

import Link from 'next/link';
import { Property } from '@/types/admin';

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
}

export default function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const subtitle = [property.clientName, property.address].filter(Boolean).join(' — ');

  return (
    <div className="admin-card">
      <Link href={`/admin/properties/${property.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="admin-card-thumbnail">
          <div className="admin-card-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        </div>
        <div className="admin-card-body">
          <h3 className="admin-card-title">{property.name}</h3>
          {subtitle && (
            <div className="admin-card-subtitle">{subtitle}</div>
          )}
          <div className="admin-card-meta">
            <span>{property.tourIds.length} {property.tourIds.length === 1 ? 'tour' : 'tours'}</span>
            <span>{new Date(property.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
      <div className="admin-card-actions">
        <button
          className="admin-btn admin-btn-danger admin-btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(property.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
