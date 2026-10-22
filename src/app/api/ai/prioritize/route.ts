import { NextRequest, NextResponse } from 'next/server';
import { prioritizeTasksWithAI, heuristicPrioritize } from '@/lib/gemini';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { Task } from '@/types/task';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const { tasks, model, useFallbackIfNoKey } = body as {
      tasks: Task[];
      model?: string;
      useFallbackIfNoKey?: boolean;
    };

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'Список задач пуст' }, { status: 400 });
    }

    // Resolve key: header -> user's DB key -> env
    const effectiveApiKey = 
      req.headers.get('x-gemini-api-key') || 
      user?.gemini_api_key || 
      process.env.GEMINI_API_KEY || 
      undefined;

    const effectiveModel = model || user?.gemini_model || 'gemini-2.5-flash';
    const limitedTasks = tasks.slice(0, 50);

    try {
      const prioritized = await prioritizeTasksWithAI(limitedTasks, effectiveApiKey, effectiveModel);

      // If user is authenticated, sync updated AI scores to Neon DB in background
      if (user) {
        Promise.all(
          prioritized.map((item) =>
            sql.query(
              `UPDATE tasks 
               SET priority = $1, quadrant = $2, estimated_minutes = $3, ai_score = $4, ai_reasoning = $5, updated_at = NOW() 
               WHERE id = $6 AND user_id = $7`,
              [item.priority, item.quadrant, item.estimatedMinutes, item.aiScore, item.aiReasoning, item.id, user.id]
            ).catch(() => {})
          )
        ).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        data: prioritized,
        source: 'gemini',
      });
    } catch (aiError: any) {
      console.warn('AI Prioritize Error:', aiError?.message);

      if (useFallbackIfNoKey || aiError?.message === 'API_KEY_MISSING') {
        const fallbackResults = heuristicPrioritize(limitedTasks);
        return NextResponse.json({
          success: true,
          data: fallbackResults,
          source: 'heuristic',
          warning: aiError?.message === 'API_KEY_MISSING'
            ? 'Google Gemini API Key не настроен в вашем аккаунте. Укажите ключ в настройках профиля.'
            : `Ошибка Gemini (${aiError?.message}). Использован эвристический расчет.`
        });
      }

      return NextResponse.json({
        error: aiError?.message || 'Ошибка обработки Gemini API',
        code: aiError?.message === 'API_KEY_MISSING' ? 'KEY_MISSING' : 'AI_ERROR'
      }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
