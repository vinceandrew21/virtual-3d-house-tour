'use client';

interface LoadingOverlayProps {
  isLoading: boolean;
  sceneName?: string;
}

export default function LoadingOverlay({ isLoading, sceneName }: LoadingOverlayProps) {
  return (
    <div
      className={`loading-overlay ${isLoading ? 'active' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring delay-1" />
          <div className="spinner-ring delay-2" />
        </div>
        {sceneName && (
          <p className="loading-text">Loading {sceneName}...</p>
        )}
      </div>
    </div>
  );
}
