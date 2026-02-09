'use client';

interface ViewerControlsProps {
  isFullscreen: boolean;
  isGyroEnabled: boolean;
  isAutoRotating: boolean;
  onToggleFullscreen: () => void;
  onToggleGyro: () => void;
  onToggleAutoRotate: () => void;
  visible: boolean;
}

export default function ViewerControls({
  isFullscreen,
  isGyroEnabled,
  isAutoRotating,
  onToggleFullscreen,
  onToggleGyro,
  onToggleAutoRotate,
  visible,
}: ViewerControlsProps) {
  return (
    <div className={`viewer-controls ${visible ? 'visible' : 'hidden'}`} role="toolbar" aria-label="Viewer controls">
      {/* Auto-rotate */}
      <button
        className={`control-btn ${isAutoRotating ? 'active' : ''}`}
        onClick={onToggleAutoRotate}
        aria-label={isAutoRotating ? 'Stop auto-rotate' : 'Start auto-rotate'}
        title={isAutoRotating ? 'Stop auto-rotate' : 'Auto-rotate'}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 3C6.134 3 3 6.134 3 10s3.134 7 7 7 7-3.134 7-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M14 3l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Gyroscope (mobile) */}
      <button
        className={`control-btn ${isGyroEnabled ? 'active' : ''}`}
        onClick={onToggleGyro}
        aria-label={isGyroEnabled ? 'Disable gyroscope' : 'Enable gyroscope'}
        title={isGyroEnabled ? 'Disable gyroscope' : 'Gyroscope'}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 3V7M10 13V17M3 10H7M13 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Fullscreen */}
      <button
        className="control-btn"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 3v4H3M13 3v4h4M7 17v-4H3M13 17v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
