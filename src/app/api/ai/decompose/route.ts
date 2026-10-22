import { NextRequest, NextResponse } from 'next/server';
import { decomposeTaskWithAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const body = await req.json();
    const { title, description, model, useFallbackIfNoKey } = body as {
      title: string;
      description?: string;
      model?: string;
      useFallbackIfNoKey?: boolean;
    };

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Название задачи не указано' }, { status: 400 });
    }

    try {
      const result = await decomposeTaskWithAI(title.trim(), description, customApiKey, model);
      return NextResponse.json({
        success: true,
        data: result,
        source: 'gemini',
      });
    } catch (aiError: any) {
      console.warn('AI Decompose Error:', aiError?.message);

      if (useFallbackIfNoKey || aiError?.message === 'API_KEY_MISSING') {
        // Fallback default decomposition steps
        return NextResponse.json({
          success: true,
          data: {
            subtasks: [
              { title: `Собрать исходную информацию и материалы для "${title}"` },
              { title: 'Подготовить черновой план или структуру' },
              { title: 'Выполнить основную часть работы' },
              { title: 'Проверить результат и внести финальные правки' }
            ]
          },
          source: 'heuristic',
          warning: 'API-ключ не настроен. Сгенерированы базовые шаги декомпозиции.'
        });
      }

      return NextResponse.json({
        error: aiError?.message || 'Ошибка декомпозиции через Gemini API'
      }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
