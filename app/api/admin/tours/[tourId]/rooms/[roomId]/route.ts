import { NextResponse } from 'next/server';
import { updateRoom, deleteRoom } from '@/lib/admin/tour-storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tourId: string; roomId: string }> }
) {
  try {
    const { tourId, roomId } = await params;
    const body = await request.json();

    const result = await updateRoom(tourId, roomId, body);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Tour or room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.tour });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tourId: string; roomId: string }> }
) {
  const { tourId, roomId } = await params;
  const tour = await deleteRoom(tourId, roomId);

  if (!tour) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete room' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: tour });
}
