'use client';

interface ViewerControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  vrSupported: boolean;
  isVR: boolean;
  onToggleVR: () => void;
  visible: boolean;
}

export default function ViewerControls({
  isFullscreen,
  onToggleFullscreen,
  vrSupported,
  isVR,
  onToggleVR,
  visible,
}: ViewerControlsProps) {
  return (
    <div className={`viewer-controls ${visible ? 'visible' : 'hidden'}`} role="toolbar" aria-label="Viewer controls">
      {vrSupported && (
        <button
          className={`control-btn ${isVR ? 'active' : ''}`}
          onClick={onToggleVR}
          aria-label={isVR ? 'Exit VR' : 'Enter VR'}
          title={isVR ? 'Exit VR' : 'Enter VR mode'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="6" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="13" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9 10.5h2" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      )}
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
