'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PanoramaViewer as ViewerEngine } from '@/lib/viewer-engine';
import { Scene, Hotspot, TourConfig } from '@/types/tour';
import HotspotModal from '@/components/hotspots/HotspotModal';
import HotspotTooltip from '@/components/hotspots/HotspotTooltip';
import SceneSelector from '@/components/navigation/SceneSelector';
import ViewerControls from '@/components/ui/ViewerControls';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import TourHeader from '@/components/ui/TourHeader';

interface PanoramaViewerProps {
  tour: TourConfig;
}

export default function PanoramaViewerComponent({ tour }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerEngine | null>(null);
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

  // Initialize viewer
  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new ViewerEngine(containerRef.current);
    viewerRef.current = viewer;

    viewer.setCallbacks({
      onHotspotHover: (hotspot) => {
        setHoveredHotspot(hotspot);
      },
      onHotspotClick: (hotspot) => {
        handleHotspotClick(hotspot);
      },
    });

    viewer.setAutoRotate(false);

    // Load default scene
    const defaultScene = tour.scenes.find(s => s.id === tour.defaultScene) || tour.scenes[0];
    loadScene(defaultScene, false);

    return () => {
      viewer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScene = useCallback(async (scene: Scene, transition: boolean = true) => {
    if (!viewerRef.current) return;

    setIsLoading(true);
    setCurrentScene(scene);
    setActiveHotspot(null);
    setHoveredHotspot(null);

    await viewerRef.current.loadScene(scene, transition);

    // Preload adjacent scenes
    scene.hotspots
      .filter(h => h.type === 'navigation' && h.targetScene)
      .forEach(h => {
        const targetScene = tour.scenes.find(s => s.id === h.targetScene);
        if (targetScene) {
          viewerRef.current?.preloadTexture(targetScene.imageUrl);
        }
      });

    setTimeout(() => setIsLoading(false), 500);
  }, [tour.scenes]);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    switch (hotspot.type) {
      case 'navigation': {
        const targetScene = tour.scenes.find(s => s.id === hotspot.targetScene);
        if (targetScene) {
          loadScene(targetScene, true);
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
    viewerRef.current?.setGyroEnabled(newState);
  }, [isGyroEnabled]);

  const toggleAutoRotate = useCallback(() => {
    const newState = !isAutoRotating;
    setIsAutoRotating(newState);
    viewerRef.current?.setAutoRotate(newState);
  }, [isAutoRotating]);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Show UI on mouse move, hide after delay
      setShowUI(true);
      if (hideUITimeout.current) clearTimeout(hideUITimeout.current);
      hideUITimeout.current = setTimeout(() => setShowUI(false), 4000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
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
        currentSceneId={currentScene?.id || ''}
        onSelectScene={(sceneId) => {
          const scene = tour.scenes.find(s => s.id === sceneId);
          if (scene) loadScene(scene, true);
        }}
        visible={showUI}
      />

      {/* Fullscreen button only */}
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
