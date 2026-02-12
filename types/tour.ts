export interface TourConfig {
  id: string;
  name: string;
  description: string;
  author?: string;
  thumbnail?: string;
  defaultScene: string;
  scenes: Scene[];
}

export type SceneMode = 'panorama' | 'walkable';

export interface Scene {
  id: string;
  name: string;
  description?: string;
  mode?: SceneMode;
  imageUrl: string;
  thumbnail?: string;
  initialView?: {
    yaw: number;   // horizontal rotation in degrees
    pitch: number;  // vertical rotation in degrees
    fov: number;    // field of view
  };
  walkableConfig?: WalkableConfig;
  hotspots: Hotspot[];
}

export interface WalkableConfig {
  roomWidth: number;
  roomDepth: number;
  roomHeight: number;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  spawnPosition: { x: number; y: number; z: number };
  spawnLookAt: { x: number; y: number; z: number };
  furniture: FurnitureItem[];
  lights: LightConfig[];
}

export interface FurnitureItem {
  id: string;
  type: 'box' | 'cylinder' | 'plane';
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  emissive?: string;
  label?: string;
  collision?: boolean;
}

export interface LightConfig {
  type: 'ambient' | 'point' | 'spot' | 'directional';
  color: string;
  intensity: number;
  position?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
  distance?: number;
  angle?: number;
  penumbra?: number;
}

export type HotspotType = 'info' | 'navigation' | 'image' | 'video' | 'link';

export interface Hotspot {
  id: string;
  type: HotspotType;
  position: {
    yaw: number;    // horizontal position in degrees (-180 to 180)
    pitch: number;  // vertical position in degrees (-90 to 90)
  };
  position3d?: {
    x: number;
    y: number;
    z: number;
  };
  tooltip?: string;
  icon?: string;
  // For 'info' type
  title?: string;
  content?: string;
  // For 'navigation' type
  targetScene?: string;
  teleportTo?: { x: number; y: number; z: number };
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
