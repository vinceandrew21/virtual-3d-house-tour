import fs from 'fs/promises';
import path from 'path';
import { Property } from '@/types/admin';
import { generateId } from './tour-storage';
import { getToursIndex, deleteTour } from './tour-storage';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// ─── Read / Write ───

async function readProperties(): Promise<Property[]> {
  try {
    const data = await fs.readFile(PROPERTIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.properties || [];
  } catch {
    return [];
  }
}

async function writeProperties(properties: Property[]): Promise<void> {
  await ensureDir(DATA_DIR);
  await fs.writeFile(
    PROPERTIES_FILE,
    JSON.stringify({ properties }, null, 2),
    'utf-8'
  );
}

// ─── Migration ───

export async function migrateOrphanedTours(): Promise<void> {
  const properties = await readProperties();
  if (properties.length > 0) return;

  const toursIndex = await getToursIndex();
  if (toursIndex.tours.length === 0) return;

  const defaultProperty: Property = {
    id: generateId('default'),
    name: 'Default',
    tourIds: toursIndex.tours.map(t => t.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await writeProperties([defaultProperty]);
}

// ─── CRUD ───

export async function getProperties(): Promise<Property[]> {
  await migrateOrphanedTours();
  return readProperties();
}

export async function getProperty(id: string): Promise<Property | null> {
  const properties = await readProperties();
  return properties.find(p => p.id === id) || null;
}

export async function createProperty(input: {
  name: string;
  address?: string;
  clientName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}): Promise<Property> {
  const properties = await readProperties();

  const property: Property = {
    id: generateId(input.name),
    name: input.name,
    address: input.address || undefined,
    clientName: input.clientName || undefined,
    contactPhone: input.contactPhone || undefined,
    contactEmail: input.contactEmail || undefined,
    notes: input.notes || undefined,
    tourIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  properties.push(property);
  await writeProperties(properties);
  return property;
}

export async function updateProperty(
  id: string,
  updates: {
    name?: string;
    address?: string;
    clientName?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
  }
): Promise<Property | null> {
  const properties = await readProperties();
  const property = properties.find(p => p.id === id);
  if (!property) return null;

  if (updates.name !== undefined) property.name = updates.name;
  if (updates.address !== undefined) property.address = updates.address;
  if (updates.clientName !== undefined) property.clientName = updates.clientName;
  if (updates.contactPhone !== undefined) property.contactPhone = updates.contactPhone;
  if (updates.contactEmail !== undefined) property.contactEmail = updates.contactEmail;
  if (updates.notes !== undefined) property.notes = updates.notes;
  property.updatedAt = new Date().toISOString();

  await writeProperties(properties);
  return property;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const properties = await readProperties();
  const property = properties.find(p => p.id === id);
  if (!property) return false;

  // Delete all tours belonging to this property
  for (const tourId of property.tourIds) {
    await deleteTour(tourId);
  }

  const filtered = properties.filter(p => p.id !== id);
  await writeProperties(filtered);
  return true;
}

// ─── Tour Linking ───

export async function addTourToProperty(propertyId: string, tourId: string): Promise<Property | null> {
  const properties = await readProperties();
  const property = properties.find(p => p.id === propertyId);
  if (!property) return null;

  if (!property.tourIds.includes(tourId)) {
    property.tourIds.push(tourId);
    property.updatedAt = new Date().toISOString();
    await writeProperties(properties);
  }

  return property;
}

export async function removeTourFromProperty(propertyId: string, tourId: string): Promise<Property | null> {
  const properties = await readProperties();
  const property = properties.find(p => p.id === propertyId);
  if (!property) return null;

  property.tourIds = property.tourIds.filter(id => id !== tourId);
  property.updatedAt = new Date().toISOString();
  await writeProperties(properties);
  return property;
}

export async function findPropertyByTourId(tourId: string): Promise<Property | null> {
  const properties = await readProperties();
  return properties.find(p => p.tourIds.includes(tourId)) || null;
}
