import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

function getPassword(): string {
  return process.env.ADMIN_PASSWORD || '';
}

function generateToken(password: string): string {
  const secret = process.env.ADMIN_PASSWORD || 'fallback';
  return crypto
    .createHmac('sha256', secret)
    .update(password + ':admin-session')
    .digest('hex');
}

export function verifyPassword(input: string): boolean {
  const password = getPassword();
  if (!password) return false;
  return input === password;
}

export async function createSession(): Promise<void> {
  const token = generateToken(getPassword());
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const password = getPassword();
  if (!password) return true; // No password set = no protection

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const expectedToken = generateToken(password);
  return token === expectedToken;
}
