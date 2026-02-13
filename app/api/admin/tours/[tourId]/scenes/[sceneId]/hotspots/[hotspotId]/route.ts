import { NextResponse } from 'next/server';
import { updateHotspot, deleteHotspot } from '@/lib/admin/tour-storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tourId: string; sceneId: string; hotspotId: string }> }
) {
  try {
    const { tourId, sceneId, hotspotId } = await params;
    const body = await request.json();

    const result = await updateHotspot(tourId, sceneId, hotspotId, body);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Hotspot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.hotspot });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update hotspot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tourId: string; sceneId: string; hotspotId: string }> }
) {
  const { tourId, sceneId, hotspotId } = await params;
  const tour = await deleteHotspot(tourId, sceneId, hotspotId);

  if (!tour) {
    return NextResponse.json(
      { success: false, error: 'Hotspot not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
