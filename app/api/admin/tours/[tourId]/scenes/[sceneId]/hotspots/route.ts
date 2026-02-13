import { NextResponse } from 'next/server';
import { getTour, addHotspot } from '@/lib/admin/tour-storage';

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

  return NextResponse.json({ success: true, data: scene.hotspots });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tourId: string; sceneId: string }> }
) {
  try {
    const { tourId, sceneId } = await params;
    const body = await request.json();

    const { type, position, tooltip, targetScene, title, content, imageUrl, videoUrl, linkUrl, linkTarget } = body;

    if (!type || !position) {
      return NextResponse.json(
        { success: false, error: 'Type and position are required' },
        { status: 400 }
      );
    }

    const hotspotData = {
      type,
      position,
      tooltip,
      targetScene,
      title,
      content,
      imageUrl,
      videoUrl,
      linkUrl,
      linkTarget,
    };

    // Remove undefined values
    Object.keys(hotspotData).forEach(key => {
      if (hotspotData[key as keyof typeof hotspotData] === undefined) {
        delete hotspotData[key as keyof typeof hotspotData];
      }
    });

    const result = await addHotspot(tourId, sceneId, hotspotData);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Tour or scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.hotspot }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create hotspot' },
      { status: 500 }
    );
  }
}
