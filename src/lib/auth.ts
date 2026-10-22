import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { sql, ensureDatabaseSchema } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'smart-todolist-super-secret-jwt-key-2026-secure'
);

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  gemini_api_key?: string | null;
  gemini_model?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signAuthToken(payload: { id: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Check cookie first
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) return cookieToken;

  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function getCurrentUser(req: NextRequest): Promise<AuthUser | null> {
  await ensureDatabaseSchema();
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload?.id) return null;

  try {
    const rows = await sql.query(
      `SELECT id, email, name, gemini_api_key, gemini_model FROM users WHERE id = $1 LIMIT 1`,
      [payload.id]
    );

    if (!rows || rows.length === 0) return null;

    const user = rows[0] as AuthUser;
    return user;
  } catch (err) {
    console.error('Failed to get current user from database:', err);
    return null;
  }
}
