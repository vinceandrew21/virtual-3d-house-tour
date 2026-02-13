import { NextResponse } from 'next/server';
import { getTour, updateScene, deleteScene, saveSceneImage, saveTour } from '@/lib/admin/tour-storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tourId: string; sceneId: string }> }
) {
  const { tourId, sceneId } = await params;
  const tour = await getTour(tourId);

  if (!tour) {
    return NextResponse.json(
      { success: false, error: 'Tour not found' },
      { status: 404 }
    );
  }

  const scene = tour.scenes.find(s => s.id === sceneId);
  if (!scene) {
    return NextResponse.json(
      { success: false, error: 'Scene not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: scene });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tourId: string; sceneId: string }> }
) {
  try {
    const { tourId, sceneId } = await params;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const name = formData.get('name') as string | null;
      const description = formData.get('description') as string | null;
      const image = formData.get('image') as File | null;

      const updates: { name?: string; description?: string } = {};
      if (name) updates.name = name;
      if (description !== null) updates.description = description;

      const result = await updateScene(tourId, sceneId, updates);
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Tour or scene not found' },
          { status: 404 }
        );
      }

      if (image && image.size > 0) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const ext = image.name.split('.').pop()?.toLowerCase() || 'jpg';
        const imageUrl = await saveSceneImage(tourId, sceneId, buffer, ext);
        result.scene.imageUrl = imageUrl;
        await saveTour(result.tour);
      }

      return NextResponse.json({ success: true, data: result.scene });
    } else {
      const body = await request.json();
      const result = await updateScene(tourId, sceneId, body);

      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Tour or scene not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: result.scene });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update scene' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tourId: string; sceneId: string }> }
) {
  const { tourId, sceneId } = await params;
  const tour = await deleteScene(tourId, sceneId);

  if (!tour) {
    return NextResponse.json(
      { success: false, error: 'Tour or scene not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
