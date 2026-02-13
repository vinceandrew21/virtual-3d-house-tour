import { NextResponse } from 'next/server';
import { getToursIndex, createTour } from '@/lib/admin/tour-storage';

export async function GET() {
  const index = await getToursIndex();
  return NextResponse.json({ success: true, data: index.tours });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, author } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const tour = await createTour(name, description, author);
    return NextResponse.json({ success: true, data: tour }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create tour' },
      { status: 500 }
    );
  }
}
