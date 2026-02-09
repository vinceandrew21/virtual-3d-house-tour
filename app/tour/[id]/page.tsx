'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { TourConfig } from '@/types/tour';

const PanoramaViewer = dynamic(
  () => import('@/components/viewer/PanoramaViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="initial-loading">
        <div className="initial-loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring delay-1" />
            <div className="spinner-ring delay-2" />
          </div>
          <h1 className="initial-loading-title">Virtual Tour</h1>
          <p className="initial-loading-subtitle">Preparing your immersive experience...</p>
        </div>
      </div>
    ),
  }
);

export default function TourPage() {
  const params = useParams();
  const [tour, setTour] = useState<TourConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTour = async () => {
      try {
        const res = await fetch(`/tours/${params.id}/tour.json`);
        if (!res.ok) throw new Error('Tour not found');
        const data = await res.json();
        setTour(data);
      } catch {
        setError('Tour not found. Please check the URL and try again.');
      }
    };
    loadTour();
  }, [params.id]);

  if (error) {
    return (
      <div className="initial-loading">
        <div className="initial-loading-content">
          <h1 className="initial-loading-title">Tour Not Found</h1>
          <p className="initial-loading-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="initial-loading">
        <div className="initial-loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring delay-1" />
            <div className="spinner-ring delay-2" />
          </div>
          <h1 className="initial-loading-title">Loading Tour</h1>
          <p className="initial-loading-subtitle">Fetching tour data...</p>
        </div>
      </div>
    );
  }

  return <PanoramaViewer tour={tour} />;
}
