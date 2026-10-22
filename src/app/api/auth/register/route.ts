import { NextRequest, NextResponse } from 'next/server';
import { sql, ensureDatabaseSchema } from '@/lib/db';
import { hashPassword, signAuthToken } from '@/lib/auth';
import { INITIAL_TASKS } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSchema();
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Пожалуйста, введите корректный email адрес' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Пароль должен содержать не менее 6 символов' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await sql.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Пользователь с таким email уже зарегистрирован' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const userName = name?.trim() || normalizedEmail.split('@')[0];

    // Insert new user
    await sql.query(
      `INSERT INTO users (id, email, name, password_hash, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [userId, normalizedEmail, userName, passwordHash]
    );

    // Seed initial welcome tasks for the new user
    for (const t of INITIAL_TASKS) {
      await sql.query(
        `INSERT INTO tasks (
          id, user_id, title, description, due_date, is_completed, completed, priority, quadrant, 
          eisenhower_quadrant, estimated_minutes, tags, subtasks, ai_score, priority_score, ai_reasoning, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
        [
          crypto.randomUUID(),
          userId,
          t.title,
          t.description || null,
          t.dueDate || null,
          t.isCompleted,
          t.isCompleted,
          t.priority,
          t.quadrant || 'SCHEDULE',
          t.quadrant || 'SCHEDULE',
          t.estimatedMinutes || 30,
          JSON.stringify(t.tags || []),
          JSON.stringify(t.subtasks || []),
          t.aiScore || 50,
          t.aiScore || 50,
          t.aiReasoning || null,
        ]
      );
    }

    // Generate JWT token
    const token = await signAuthToken({ id: userId, email: normalizedEmail });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: normalizedEmail,
        name: userName,
        hasApiKey: false,
        geminiModel: 'gemini-2.5-flash',
      },
      message: 'Регистрация успешна! Теперь вы можете указать свой Google Gemini API Key.',
    }, { status: 201 });

    // Set HTTP-only auth cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error?.message || 'Ошибка сервера при регистрации' }, { status: 500 });
  }
}
