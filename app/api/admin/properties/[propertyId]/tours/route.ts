import { NextResponse } from 'next/server';
import { createTour } from '@/lib/admin/tour-storage';
import { addTourToProperty, getProperty } from '@/lib/admin/property-storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;

    const property = await getProperty(propertyId);
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, author } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const tour = await createTour(name, description, author);
    await addTourToProperty(propertyId, tour.id);

    return NextResponse.json({ success: true, data: tour }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create tour' },
      { status: 500 }
    );
  }
}
