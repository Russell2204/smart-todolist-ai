import { NextRequest, NextResponse } from 'next/server';
import { decomposeTaskWithAI } from '@/lib/gemini';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
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

    const effectiveApiKey =
      req.headers.get('x-gemini-api-key') ||
      user?.gemini_api_key ||
      process.env.GEMINI_API_KEY ||
      undefined;

    const effectiveModel = model || user?.gemini_model || 'gemini-2.5-flash';

    try {
      const result = await decomposeTaskWithAI(title.trim(), description, effectiveApiKey, effectiveModel);
      return NextResponse.json({
        success: true,
        data: result,
        source: 'gemini',
      });
    } catch (aiError: any) {
      console.warn('AI Decompose Error:', aiError?.message);

      if (useFallbackIfNoKey || aiError?.message === 'API_KEY_MISSING') {
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
          warning: aiError?.message === 'API_KEY_MISSING'
            ? 'API-ключ не настроен в профиле. Сгенерированы базовые шаги.'
            : 'Сгенерированы базовые шаги декомпозиции.'
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
