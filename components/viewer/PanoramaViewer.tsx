'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PanoramaViewer as ViewerEngine } from '@/lib/viewer-engine';
import { WalkableViewer } from '@/lib/walkable-engine';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Scene, Hotspot, TourConfig, SceneMode } from '@/types/tour';
import HotspotModal from '@/components/hotspots/HotspotModal';
import HotspotTooltip from '@/components/hotspots/HotspotTooltip';
import SceneSelector from '@/components/navigation/SceneSelector';
import ViewerControls from '@/components/ui/ViewerControls';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import TourHeader from '@/components/ui/TourHeader';

interface PanoramaViewerProps {
  tour: TourConfig;
}

type AnyViewer = ViewerEngine | WalkableViewer;

export default function PanoramaViewerComponent({ tour }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<AnyViewer | null>(null);
  const currentModeRef = useRef<SceneMode>('panorama');
  const currentSceneRef = useRef<Scene | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGyroEnabled, setIsGyroEnabled] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showUI, setShowUI] = useState(true);
  const hideUITimeout = useRef<NodeJS.Timeout | null>(null);

  const setupCallbacks = useCallback((viewer: AnyViewer) => {
    const callbacks: Parameters<AnyViewer['setCallbacks']>[0] = {
      onHotspotHover: (hotspot) => {
        setHoveredHotspot(hotspot);
      },
      onHotspotClick: (hotspot) => {
        handleHotspotClick(hotspot);
      },
    };

    viewer.setCallbacks(callbacks);

    // For panorama viewer: skip dolly for same-room navigation
    if (viewer instanceof ViewerEngine) {
      viewer.setCallbacks({
        ...callbacks,
        shouldDolly: (hotspot) => {
          if (hotspot.type !== 'navigation' || !hotspot.targetScene) return true;
          const targetScene = tour.scenes.find(s => s.id === hotspot.targetScene);
          if (!targetScene) return true;
          // Use ref to get latest currentScene without dependency
          const current = currentSceneRef.current;
          return !(current?.roomId && targetScene.roomId === current.roomId);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createEngine = useCallback((mode: SceneMode): AnyViewer => {
    if (!containerRef.current) throw new Error('No container');

    if (mode === 'walkable') {
      return new WalkableViewer(containerRef.current);
    } else {
      const engine = new ViewerEngine(containerRef.current);
      engine.setAutoRotate(false);
      return engine;
    }
  }, []);

  // Initialize viewer
  // Lock scrolling on viewer pages
  useEffect(() => {
    document.documentElement.classList.add('viewer-page');
    return () => document.documentElement.classList.remove('viewer-page');
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const defaultScene = tour.scenes.find(s => s.id === tour.defaultScene) || tour.scenes[0];
    const mode = defaultScene.mode || 'panorama';

    const viewer = createEngine(mode);
    viewerRef.current = viewer;
    currentModeRef.current = mode;
    setupCallbacks(viewer);

    loadScene(defaultScene, false);

    return () => {
      viewer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScene = useCallback(async (scene: Scene, transition: boolean | 'zoom' = true) => {
    if (!containerRef.current) return;

    const targetMode: SceneMode = scene.mode || 'panorama';

    // If mode changed, swap engines
    if (targetMode !== currentModeRef.current || !viewerRef.current) {
      viewerRef.current?.dispose();
      const newViewer = createEngine(targetMode);
      viewerRef.current = newViewer;
      currentModeRef.current = targetMode;
      setupCallbacks(newViewer);
    }

    if (transition === true) {
      setIsLoading(true);
    }
    setCurrentScene(scene);
    currentSceneRef.current = scene;
    setActiveHotspot(null);
    setHoveredHotspot(null);

    await viewerRef.current.loadScene(scene, transition);

    // Preload adjacent panorama scenes
    if (targetMode === 'panorama' && viewerRef.current instanceof ViewerEngine) {
      scene.hotspots
        .filter(h => h.type === 'navigation' && h.targetScene)
        .forEach(h => {
          const targetScene = tour.scenes.find(s => s.id === h.targetScene);
          if (targetScene && (!targetScene.mode || targetScene.mode === 'panorama')) {
            (viewerRef.current as ViewerEngine)?.preloadTexture(targetScene.imageUrl);
          }
        });
    }

    if (transition === true) {
      setTimeout(() => setIsLoading(false), 500);
    } else {
      setIsLoading(false);
    }
  }, [tour.scenes, createEngine, setupCallbacks]);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    switch (hotspot.type) {
      case 'navigation': {
        const targetScene = tour.scenes.find(s => s.id === hotspot.targetScene);
        if (targetScene) {
          // Same room = zoom transition, different room = fade transition
          const current = currentSceneRef.current;
          const sameRoom = !!(current?.roomId && targetScene.roomId === current.roomId);
          loadScene(targetScene, sameRoom ? 'zoom' : true);
        }
        break;
      }
      case 'link':
        if (hotspot.linkUrl) {
          window.open(hotspot.linkUrl, hotspot.linkTarget || '_blank');
        }
        break;
      case 'info':
      case 'image':
      case 'video':
        setActiveHotspot(hotspot);
        break;
    }
  }, [tour.scenes, loadScene]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleGyro = useCallback(() => {
    const newState = !isGyroEnabled;
    setIsGyroEnabled(newState);
    if (viewerRef.current instanceof ViewerEngine) {
      viewerRef.current.setGyroEnabled(newState);
    }
  }, [isGyroEnabled]);

  const toggleAutoRotate = useCallback(() => {
    const newState = !isAutoRotating;
    setIsAutoRotating(newState);
    if (viewerRef.current instanceof ViewerEngine) {
      viewerRef.current.setAutoRotate(newState);
    }
  }, [isAutoRotating]);

  // Track mouse/touch for UI visibility and tooltip position
  useEffect(() => {
    const resetUITimer = () => {
      setShowUI(true);
      if (hideUITimeout.current) clearTimeout(hideUITimeout.current);
      hideUITimeout.current = setTimeout(() => setShowUI(false), 4000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      resetUITimer();
    };

    const handleTouchStart = () => {
      resetUITimer();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (hideUITimeout.current) clearTimeout(hideUITimeout.current);
    };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="viewer-container"
      role="application"
      aria-label={`360° virtual tour: ${tour.name}`}
      tabIndex={0}
    >
      {/* Loading overlay */}
      <LoadingOverlay isLoading={isLoading} sceneName={currentScene?.name} />

      {/* Tour header */}
      <TourHeader
        tourName={tour.name}
        sceneName={currentScene?.name || ''}
        sceneDescription={currentScene?.description}
        visible={showUI}
      />

      {/* Scene selector */}
      <SceneSelector
        scenes={tour.scenes}
        rooms={tour.rooms}
        floors={tour.floors}
        currentSceneId={currentScene?.id || ''}
        onSelectScene={(sceneId, sameRoom) => {
          const scene = tour.scenes.find(s => s.id === sceneId);
          if (scene) loadScene(scene, sameRoom ? 'zoom' : true);
        }}
        visible={showUI}
      />

      {/* Viewer controls */}
      <ViewerControls
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        visible={showUI}
      />

      {/* Hotspot tooltip */}
      {hoveredHotspot && (
        <HotspotTooltip
          hotspot={hoveredHotspot}
          x={mousePos.x}
          y={mousePos.y}
          resolvedLabel={(() => {
            if (hoveredHotspot.type !== 'navigation' || !hoveredHotspot.targetScene) return undefined;
            const targetScene = tour.scenes.find(s => s.id === hoveredHotspot.targetScene);
            if (!targetScene?.roomId) return undefined;
            const sameRoom = currentScene?.roomId && targetScene.roomId === currentScene.roomId;
            if (sameRoom) return undefined;
            const targetRoom = tour.rooms?.find(r => r.id === targetScene.roomId);
            return targetRoom?.name;
          })()}
        />
      )}

      {/* Hotspot modal */}
      {activeHotspot && (
        <HotspotModal
          hotspot={activeHotspot}
          onClose={() => setActiveHotspot(null)}
        />
      )}
    </div>
  );
}
