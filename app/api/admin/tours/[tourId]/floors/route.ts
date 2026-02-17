import { NextResponse } from 'next/server';
import { addFloor, getTour } from '@/lib/admin/tour-storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const { tourId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Floor name is required' },
        { status: 400 }
      );
    }

    const result = await addFloor(tourId, name);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.tour }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create floor' },
      { status: 500 }
    );
  }
}
