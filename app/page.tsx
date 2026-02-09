'use client';

import dynamic from 'next/dynamic';
import { demoTour } from '@/lib/demo-tour';

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

export default function HomePage() {
  return <PanoramaViewer tour={demoTour} />;
}
