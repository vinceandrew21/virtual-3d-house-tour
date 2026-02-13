import fs from 'fs/promises';
import path from 'path';
import { TourConfig, Scene, Hotspot } from '@/types/tour';
import { TourIndexEntry, ToursIndex } from '@/types/admin';

const TOURS_DIR = path.join(process.cwd(), 'public', 'tours');
const DATA_DIR = path.join(process.cwd(), 'data');
const INDEX_FILE = path.join(DATA_DIR, 'tours-index.json');

// ─── Helpers ───

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export function generateId(text: string): string {
  const slug = slugify(text);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// ─── Tours Index ───

export async function getToursIndex(): Promise<ToursIndex> {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { tours: [] };
  }
}

async function saveToursIndex(index: ToursIndex): Promise<void> {
  await ensureDir(DATA_DIR);
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

function tourToIndexEntry(tour: TourConfig): TourIndexEntry {
  const firstScene = tour.scenes[0];
  return {
    id: tour.id,
    name: tour.name,
    description: tour.description,
    thumbnail: firstScene?.imageUrl || null,
    sceneCount: tour.scenes.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function updateIndexEntry(tourId: string, tour: TourConfig): Promise<void> {
  const index = await getToursIndex();
  const existing = index.tours.findIndex(t => t.id === tourId);
  const entry = tourToIndexEntry(tour);

  if (existing >= 0) {
    entry.createdAt = index.tours[existing].createdAt;
    index.tours[existing] = entry;
  } else {
    index.tours.push(entry);
  }

  await saveToursIndex(index);
}

async function removeIndexEntry(tourId: string): Promise<void> {
  const index = await getToursIndex();
  index.tours = index.tours.filter(t => t.id !== tourId);
  await saveToursIndex(index);
}

// ─── Tour CRUD ───

function tourJsonPath(tourId: string): string {
  return path.join(TOURS_DIR, tourId, 'tour.json');
}

export async function getTour(tourId: string): Promise<TourConfig | null> {
  try {
    const data = await fs.readFile(tourJsonPath(tourId), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveTour(tour: TourConfig): Promise<void> {
  const tourDir = path.join(TOURS_DIR, tour.id);
  await ensureDir(tourDir);
  await fs.writeFile(tourJsonPath(tour.id), JSON.stringify(tour, null, 2), 'utf-8');
  await updateIndexEntry(tour.id, tour);
}

export async function createTour(name: string, description: string, author?: string): Promise<TourConfig> {
  const id = generateId(name);
  const tour: TourConfig = {
    id,
    name,
    description,
    author: author || undefined,
    defaultScene: '',
    scenes: [],
  };

  await saveTour(tour);
  return tour;
}

export async function updateTour(
  tourId: string,
  updates: { name?: string; description?: string; author?: string; defaultScene?: string }
): Promise<TourConfig | null> {
  const tour = await getTour(tourId);
  if (!tour) return null;

  if (updates.name !== undefined) tour.name = updates.name;
  if (updates.description !== undefined) tour.description = updates.description;
  if (updates.author !== undefined) tour.author = updates.author;
  if (updates.defaultScene !== undefined) tour.defaultScene = updates.defaultScene;

  await saveTour(tour);
  return tour;
}

export async function deleteTour(tourId: string): Promise<boolean> {
  const tourDir = path.join(TOURS_DIR, tourId);
  try {
    await fs.rm(tourDir, { recursive: true, force: true });
    await removeIndexEntry(tourId);
    return true;
  } catch {
    return false;
  }
}

// ─── Scene CRUD ───

export async function addScene(
  tourId: string,
  name: string,
  description?: string
): Promise<{ tour: TourConfig; scene: Scene } | null> {
  const tour = await getTour(tourId);
  if (!tour) return null;

  const sceneId = slugify(name) || `scene-${Date.now()}`;

  const scene: Scene = {
    id: sceneId,
    name,
    description: description || undefined,
    imageUrl: '',
    initialView: { yaw: 0, pitch: 0, fov: 75 },
    hotspots: [],
  };

  tour.scenes.push(scene);

  // Set as default if first scene
  if (tour.scenes.length === 1) {
    tour.defaultScene = scene.id;
  }

  await saveTour(tour);
  return { tour, scene };
}

export async function updateScene(
  tourId: string,
  sceneId: string,
  updates: { name?: string; description?: string; initialView?: { yaw: number; pitch: number; fov: number } }
): Promise<{ tour: TourConfig; scene: Scene } | null> {
  const tour = await getTour(tourId);
  if (!tour) return null;

  const scene = tour.scenes.find(s => s.id === sceneId);
  if (!scene) return null;

  if (updates.name !== undefined) scene.name = updates.name;
  if (updates.description !== undefined) scene.description = updates.description;
  if (updates.initialView !== undefined) scene.initialView = updates.initialView;

  await saveTour(tour);
  return { tour, scene };
}

export async function deleteScene(tourId: string, sceneId: string): Promise<TourConfig | null> {
  const tour = await getTour(tourId);
  if (!tour) return null;

  tour.scenes = tour.scenes.filter(s => s.id !== sceneId);

  // Update default scene if needed
  if (tour.defaultScene === sceneId) {
    tour.defaultScene = tour.scenes[0]?.id || '';
  }

  // Delete scene image
  const imageDir = path.join(TOURS_DIR, tourId);
  try {
    await fs.unlink(path.join(imageDir, `${sceneId}.jpg`));
  } catch { /* image may not exist */ }

  await saveTour(tour);
  return tour;
}

// ─── Multiple Scenes (Multi-Photo Room) ───

export async function addMultipleScenes(
  tourId: string,
  baseName: string,
  description: string | undefined,
  imageFiles: File[]
): Promise<{ tour: TourConfig; scenes: Scene[] } | null> {
  const tour = await getTour(tourId);
  if (!tour) return null;

  const count = imageFiles.length;
  const createdScenes: Scene[] = [];

  // Create all scenes with numbered names
  for (let i = 0; i < count; i++) {
    const sceneName = `${baseName} - ${i + 1}`;
    let sceneId = slugify(sceneName) || `scene-${Date.now()}-${i}`;

    // Ensure ID uniqueness
    if (tour.scenes.some(s => s.id === sceneId) || createdScenes.some(s => s.id === sceneId)) {
      const suffix = Math.random().toString(36).slice(2, 6);
      sceneId = `${sceneId}-${suffix}`;
    }

    const scene: Scene = {
      id: sceneId,
      name: sceneName,
      description: description || undefined,
      imageUrl: '',
      initialView: { yaw: 0, pitch: 0, fov: 75 },
      hotspots: [],
    };

    createdScenes.push(scene);
  }

  // Add all scenes to the tour
  tour.scenes.push(...createdScenes);

  // Set first scene as default if none exists
  if (!tour.defaultScene || tour.defaultScene === '') {
    tour.defaultScene = createdScenes[0].id;
  }

  // Save images and update imageUrl for each scene
  for (let i = 0; i < count; i++) {
    const file = imageFiles[i];
    const scene = createdScenes[i];
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const imageUrl = await saveSceneImage(tourId, scene.id, buffer, ext);
    scene.imageUrl = imageUrl;
  }

  // Save the tour
  await saveTour(tour);

  return { tour, scenes: createdScenes };
}

// ─── Image Upload ───

export async function saveSceneImage(
  tourId: string,
  sceneId: string,
  buffer: Buffer,
  extension: string = 'jpg'
): Promise<string> {
  const tourDir = path.join(TOURS_DIR, tourId);
  await ensureDir(tourDir);

  const filename = `${sceneId}.${extension}`;
  const filepath = path.join(tourDir, filename);
  await fs.writeFile(filepath, buffer);

  return `/tours/${tourId}/${filename}`;
}

// ─── Hotspot CRUD ───

export async function addHotspot(
  tourId: string,
  sceneId: string,
  hotspot: Omit<Hotspot, 'id'>
): Promise<{ tour: TourConfig; hotspot: Hotspot } | null> {
  const tour = await getTour(tourId);
  if (!tour) return null;

  const scene = tour.scenes.find(s => s.id === sceneId);
  if (!scene) return null;

  const id = `${sceneId}-${hotspot.type}-${Math.random().toString(36).slice(2, 6)}`;
  const fullHotspot: Hotspot = { id, ...hotspot };

  scene.hotspots.push(fullHotspot);
  await saveTour(tour);
  return { tour, hotspot: fullHotspot };
}

export async function updateHotspot(
  tourId: string,
  sceneId: string,
  hotspotId: string,
  updates: Partial<Omit<Hotspot, 'id'>>
): Promise<{ tour: TourConfig; hotspot: Hotspot } | null> {
  const tour = await getTour(tourId);
  if (!tour) return null;

  const scene = tour.scenes.find(s => s.id === sceneId);
  if (!scene) return null;

  const hotspot = scene.hotspots.find(h => h.id === hotspotId);
  if (!hotspot) return null;

  Object.assign(hotspot, updates);
  await saveTour(tour);
  return { tour, hotspot };
}

export async function deleteHotspot(
  tourId: string,
  sceneId: string,
  hotspotId: string
): Promise<TourConfig | null> {
  const tour = await getTour(tourId);
  if (!tour) return null;

  const scene = tour.scenes.find(s => s.id === sceneId);
  if (!scene) return null;

  scene.hotspots = scene.hotspots.filter(h => h.id !== hotspotId);
  await saveTour(tour);
  return tour;
}
