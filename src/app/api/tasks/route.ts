import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql, ensureDatabaseSchema } from '@/lib/db';
import { Task } from '@/types/task';
import { quickAddWithAI } from '@/lib/gemini';

function mapDbRowToTask(row: any): Task {
  let tags: string[] = [];
  try {
    tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []);
  } catch {}

  let subtasks: any[] = [];
  try {
    subtasks = typeof row.subtasks === 'string' ? JSON.parse(row.subtasks) : (row.subtasks || []);
  } catch {}

  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    dueDate: row.due_date || undefined,
    isCompleted: !!row.is_completed,
    priority: row.priority || 'MEDIUM',
    quadrant: row.quadrant || 'SCHEDULE',
    estimatedMinutes: row.estimated_minutes || 30,
    tags,
    subtasks,
    aiScore: row.ai_score ?? 50,
    aiReasoning: row.ai_reasoning || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSchema();
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ tasks: [], authenticated: false });
    }

    const rows = await sql.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY is_completed ASC, ai_score DESC, created_at DESC`,
      [user.id]
    );

    const tasks = rows.map(mapDbRowToTask);
    return NextResponse.json({ tasks, authenticated: true });
  } catch (error: any) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: error?.message || 'Ошибка загрузки задач' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSchema();
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Необходимо войти в аккаунт' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, dueDate, priority, quadrant, estimatedMinutes, tags, autoAnalyze } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Название задачи обязательно' }, { status: 400 });
    }

    let finalTaskData = {
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: dueDate || null,
      priority: priority || 'MEDIUM',
      quadrant: quadrant || 'SCHEDULE',
      estimatedMinutes: estimatedMinutes || 30,
      tags: tags || [],
      aiScore: 50,
      aiReasoning: null as string | null,
    };

    // User's Google Gemini API Key from database or header
    const userKey = req.headers.get('x-gemini-api-key') || user.gemini_api_key || undefined;

    if (autoAnalyze && userKey) {
      try {
        const aiData = await quickAddWithAI(finalTaskData.title, userKey, user.gemini_model);
        finalTaskData = {
          title: aiData.title || finalTaskData.title,
          description: aiData.description || finalTaskData.description,
          dueDate: aiData.dueDate || finalTaskData.dueDate,
          priority: aiData.priority || finalTaskData.priority,
          quadrant: aiData.quadrant || finalTaskData.quadrant,
          estimatedMinutes: aiData.estimatedMinutes || finalTaskData.estimatedMinutes,
          tags: aiData.tags?.length ? aiData.tags : finalTaskData.tags,
          aiScore: aiData.aiScore ?? 50,
          aiReasoning: aiData.aiReasoning || null,
        };
      } catch (e) {
        console.warn('AI autoAnalyze in POST /api/tasks error:', e);
      }
    }

    const taskId = crypto.randomUUID();

    await sql.query(
      `INSERT INTO tasks (
        id, user_id, title, description, due_date, is_completed, completed, priority, quadrant,
        eisenhower_quadrant, estimated_minutes, tags, subtasks, ai_score, priority_score, ai_reasoning, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
      [
        taskId,
        user.id,
        finalTaskData.title,
        finalTaskData.description,
        finalTaskData.dueDate,
        false,
        false,
        finalTaskData.priority,
        finalTaskData.quadrant,
        finalTaskData.quadrant,
        finalTaskData.estimatedMinutes,
        JSON.stringify(finalTaskData.tags),
        JSON.stringify([]),
        finalTaskData.aiScore,
        finalTaskData.aiScore,
        finalTaskData.aiReasoning,
      ]
    );

    const createdTask: Task = {
      id: taskId,
      title: finalTaskData.title,
      description: finalTaskData.description || undefined,
      dueDate: finalTaskData.dueDate || undefined,
      isCompleted: false,
      priority: finalTaskData.priority as any,
      quadrant: finalTaskData.quadrant as any,
      estimatedMinutes: finalTaskData.estimatedMinutes,
      tags: finalTaskData.tags,
      subtasks: [],
      aiScore: finalTaskData.aiScore,
      aiReasoning: finalTaskData.aiReasoning || undefined,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(createdTask, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: error?.message || 'Ошибка создания задачи' }, { status: 500 });
  }
}
