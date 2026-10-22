import { NextRequest, NextResponse } from 'next/server';
import { sql, ensureDatabaseSchema } from '@/lib/db';
import { verifyPassword, signAuthToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSchema();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Укажите email и пароль' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const users = await sql.query(
      'SELECT id, email, name, password_hash, gemini_api_key, gemini_model FROM users WHERE email = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    const user = users[0];
    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    const token = await signAuthToken({ id: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasApiKey: !!user.gemini_api_key,
        apiKey: user.gemini_api_key || '',
        geminiModel: user.gemini_model || 'gemini-2.5-flash',
      },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error?.message || 'Ошибка сервера при авторизации' }, { status: 500 });
  }
}
