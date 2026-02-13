import { NextResponse } from 'next/server';
import { getTour, addScene, addMultipleScenes, saveSceneImage, saveTour } from '@/lib/admin/tour-storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const { tourId } = await params;
  const tour = await getTour(tourId);

  if (!tour) {
    return NextResponse.json(
      { success: false, error: 'Tour not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: tour.scenes });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const { tourId } = await params;
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Support both 'images' (multi) and 'image' (legacy single)
    const images = formData.getAll('images') as File[];
    const legacySingle = formData.get('image') as File | null;

    const files: File[] = images.length > 0
      ? images.filter(f => f && f.size > 0)
      : (legacySingle && legacySingle.size > 0 ? [legacySingle] : []);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Single photo — same behavior as before
    if (files.length === 1) {
      const result = await addScene(tourId, name, description || undefined);
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Tour not found' },
          { status: 404 }
        );
      }

      const buffer = Buffer.from(await files[0].arrayBuffer());
      const ext = files[0].name.split('.').pop()?.toLowerCase() || 'jpg';
      const imageUrl = await saveSceneImage(tourId, result.scene.id, buffer, ext);
      result.scene.imageUrl = imageUrl;
      await saveTour(result.tour);

      return NextResponse.json({ success: true, data: result.scene }, { status: 201 });
    }

    // Multiple photos — create linked scenes with auto-hotspots
    const result = await addMultipleScenes(tourId, name, description || undefined, files);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.scenes }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create scene(s)' },
      { status: 500 }
    );
  }
}
