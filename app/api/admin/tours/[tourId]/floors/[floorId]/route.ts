import { NextResponse } from 'next/server';
import { updateFloor, deleteFloor } from '@/lib/admin/tour-storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tourId: string; floorId: string }> }
) {
  try {
    const { tourId, floorId } = await params;
    const body = await request.json();

    const result = await updateFloor(tourId, floorId, body);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Tour or floor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.tour });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update floor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tourId: string; floorId: string }> }
) {
  const { tourId, floorId } = await params;
  const tour = await deleteFloor(tourId, floorId);

  if (!tour) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete floor' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: tour });
}
