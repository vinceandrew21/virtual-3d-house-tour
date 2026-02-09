'use client';

import { useEffect, useRef } from 'react';
import { Hotspot } from '@/types/tour';

interface HotspotModalProps {
  hotspot: Hotspot;
  onClose: () => void;
}

export default function HotspotModal({ hotspot, onClose }: HotspotModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);

    // Focus trap
    modalRef.current?.focus();

    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={hotspot.title || hotspot.tooltip || 'Hotspot detail'}
    >
      <div
        className="modal-content"
        ref={modalRef}
        tabIndex={-1}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {hotspot.title && (
          <h2 className="modal-title">{hotspot.title}</h2>
        )}

        {hotspot.type === 'info' && hotspot.content && (
          <p className="modal-text">{hotspot.content}</p>
        )}

        {hotspot.type === 'image' && hotspot.imageUrl && (
          <div className="modal-image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hotspot.imageUrl}
              alt={hotspot.imageAlt || hotspot.title || 'Hotspot image'}
              className="modal-image"
              loading="lazy"
            />
          </div>
        )}

        {hotspot.type === 'video' && hotspot.videoUrl && (
          <div className="modal-video-wrapper">
            <iframe
              src={hotspot.videoUrl}
              title={hotspot.title || 'Video'}
              className="modal-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}
