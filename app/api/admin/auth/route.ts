import { NextResponse } from 'next/server';
import { verifyPassword, createSession, destroySession, isAuthenticated } from '@/lib/admin/auth';

// Check auth status
export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}

// Login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    await createSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

// Logout
export async function DELETE() {
  await destroySession();
  return NextResponse.json({ success: true });
}
