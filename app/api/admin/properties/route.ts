import { NextResponse } from 'next/server';
import { getProperties, createProperty } from '@/lib/admin/property-storage';

export async function GET() {
  const properties = await getProperties();
  return NextResponse.json({ success: true, data: properties });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, clientName, contactPhone, contactEmail, notes } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const property = await createProperty({
      name,
      address,
      clientName,
      contactPhone,
      contactEmail,
      notes,
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
