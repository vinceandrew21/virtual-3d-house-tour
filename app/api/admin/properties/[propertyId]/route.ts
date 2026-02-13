import { NextResponse } from 'next/server';
import { getProperty, updateProperty, deleteProperty } from '@/lib/admin/property-storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  const property = await getProperty(propertyId);

  if (!property) {
    return NextResponse.json(
      { success: false, error: 'Property not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: property });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const body = await request.json();
    const property = await updateProperty(propertyId, body);

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: property });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  const success = await deleteProperty(propertyId);

  if (!success) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete property' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
