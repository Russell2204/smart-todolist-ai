import { NextRequest, NextResponse } from 'next/server';
import { prioritizeTasksWithAI, heuristicPrioritize } from '@/lib/gemini';
import { Task } from '@/types/task';

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const body = await req.json();
    const { tasks, model, useFallbackIfNoKey } = body as {
      tasks: Task[];
      model?: string;
      useFallbackIfNoKey?: boolean;
    };

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'Список задач пуст' }, { status: 400 });
    }

    // Limit to max 50 tasks (SPEC limit)
    const limitedTasks = tasks.slice(0, 50);

    try {
      const prioritized = await prioritizeTasksWithAI(limitedTasks, customApiKey, model);
      return NextResponse.json({
        success: true,
        data: prioritized,
        source: 'gemini',
      });
    } catch (aiError: any) {
      console.warn('AI Prioritize Error:', aiError?.message);

      // If user allowed fallback or no key is configured
      if (useFallbackIfNoKey || aiError?.message === 'API_KEY_MISSING') {
        const fallbackResults = heuristicPrioritize(limitedTasks);
        return NextResponse.json({
          success: true,
          data: fallbackResults,
          source: 'heuristic',
          warning: aiError?.message === 'API_KEY_MISSING' 
            ? 'API-ключ не настроен. Использована локальная эвристическая расстановка приоритетов.'
            : `Ошибка Gemini (${aiError?.message}). Использован эвристический расчет.`
        });
      }

      const statusCode = aiError?.status || (aiError?.message?.includes('429') ? 429 : 500);
      return NextResponse.json({
        error: aiError?.message || 'Ошибка обработки Gemini API',
        code: aiError?.message === 'API_KEY_MISSING' ? 'KEY_MISSING' : 'AI_ERROR'
      }, { status: statusCode });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
