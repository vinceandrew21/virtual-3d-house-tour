import { HotspotType } from './tour';

export interface Property {
  id: string;
  name: string;
  address?: string;
  clientName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  tourIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TourIndexEntry {
  id: string;
  name: string;
  description: string;
  thumbnail: string | null;
  sceneCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ToursIndex {
  tours: TourIndexEntry[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateTourInput {
  name: string;
  description: string;
  author?: string;
}

export interface UpdateTourInput {
  name?: string;
  description?: string;
  author?: string;
  defaultScene?: string;
}

export interface CreateHotspotInput {
  type: HotspotType;
  position: { yaw: number; pitch: number };
  tooltip?: string;
  targetScene?: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
}

export interface UpdateHotspotInput {
  type?: HotspotType;
  position?: { yaw: number; pitch: number };
  tooltip?: string;
  targetScene?: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
}
