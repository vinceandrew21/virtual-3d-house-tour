export interface TourConfig {
  id: string;
  name: string;
  description: string;
  author?: string;
  thumbnail?: string;
  defaultScene: string;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnail?: string;
  initialView?: {
    yaw: number;   // horizontal rotation in degrees
    pitch: number;  // vertical rotation in degrees
    fov: number;    // field of view
  };
  hotspots: Hotspot[];
}

export type HotspotType = 'info' | 'navigation' | 'image' | 'video' | 'link';

export interface Hotspot {
  id: string;
  type: HotspotType;
  position: {
    yaw: number;    // horizontal position in degrees (-180 to 180)
    pitch: number;  // vertical position in degrees (-90 to 90)
  };
  tooltip?: string;
  icon?: string;
  // For 'info' type
  title?: string;
  content?: string;
  // For 'navigation' type
  targetScene?: string;
  // For 'image' type
  imageUrl?: string;
  imageAlt?: string;
  // For 'video' type
  videoUrl?: string;
  // For 'link' type
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
  // Animation
  pulseColor?: string;
  scale?: number;
}

export interface ViewerState {
  currentSceneId: string;
  yaw: number;
  pitch: number;
  fov: number;
  isFullscreen: boolean;
  isGyroEnabled: boolean;
  isAutoRotating: boolean;
  isTransitioning: boolean;
  activeHotspot: Hotspot | null;
}
