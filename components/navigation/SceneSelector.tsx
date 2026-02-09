'use client';

import { useState } from 'react';
import { Scene } from '@/types/tour';

interface SceneSelectorProps {
  scenes: Scene[];
  currentSceneId: string;
  onSelectScene: (sceneId: string) => void;
  visible: boolean;
}

export default function SceneSelector({
  scenes,
  currentSceneId,
  onSelectScene,
  visible,
}: SceneSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`scene-selector ${visible ? 'visible' : 'hidden'}`}>
      <button
        className="scene-selector-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Scene navigation"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="scene-selector-icon">
          <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="scene-selector-label">Rooms</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`scene-selector-chevron ${isExpanded ? 'expanded' : ''}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={`scene-selector-list ${isExpanded ? 'expanded' : ''}`}>
        {scenes.map((scene, index) => (
          <button
            key={scene.id}
            className={`scene-selector-item ${scene.id === currentSceneId ? 'active' : ''}`}
            onClick={() => {
              onSelectScene(scene.id);
              setIsExpanded(false);
            }}
            aria-current={scene.id === currentSceneId ? 'true' : undefined}
          >
            <span className="scene-item-number">{String(index + 1).padStart(2, '0')}</span>
            <div className="scene-item-info">
              <span className="scene-item-name">{scene.name}</span>
              {scene.description && (
                <span className="scene-item-desc">{scene.description}</span>
              )}
            </div>
            {scene.id === currentSceneId && (
              <span className="scene-item-indicator" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
