import { NextResponse } from 'next/server';
import { addRoom } from '@/lib/admin/tour-storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const { tourId } = await params;
    const body = await request.json();
    const { name, description, floorId } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await addRoom(tourId, name, description, floorId);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.tour }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
