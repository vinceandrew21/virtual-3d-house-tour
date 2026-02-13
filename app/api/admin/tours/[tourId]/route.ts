import { NextResponse } from 'next/server';
import { getTour, updateTour, deleteTour } from '@/lib/admin/tour-storage';

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

  return NextResponse.json({ success: true, data: tour });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const { tourId } = await params;
    const body = await request.json();
    const tour = await updateTour(tourId, body);

    if (!tour) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tour });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update tour' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const { tourId } = await params;
  const success = await deleteTour(tourId);

  if (!success) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete tour' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
