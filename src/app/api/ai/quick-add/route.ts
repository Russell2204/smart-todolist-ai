import { NextRequest, NextResponse } from 'next/server';
import { quickAddWithAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const body = await req.json();
    const { text, model, useFallbackIfNoKey } = body as {
      text: string;
      model?: string;
      useFallbackIfNoKey?: boolean;
    };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Текст задачи не указан' }, { status: 400 });
    }

    try {
      const result = await quickAddWithAI(text.trim(), customApiKey, model);
      return NextResponse.json({
        success: true,
        data: result,
        source: 'gemini',
      });
    } catch (aiError: any) {
      console.warn('AI QuickAdd Error:', aiError?.message);

      if (useFallbackIfNoKey || aiError?.message === 'API_KEY_MISSING') {
        // Smart heuristic parse for simple terms
        const raw = text.trim();
        const isUrgent = /срочно|сегодня|asap|критично|быстро|важно/i.test(raw);
        const hasWork = /отчет|проект|клиент|совещание|дедлайн|договор/i.test(raw);
        
        return NextResponse.json({
          success: true,
          data: {
            title: raw,
            description: '',
            priority: isUrgent ? 'HIGH' : 'MEDIUM',
            quadrant: isUrgent ? 'DO_FIRST' : 'SCHEDULE',
            estimatedMinutes: 30,
            tags: hasWork ? ['работа'] : ['личное'],
            aiScore: isUrgent ? 85 : 50,
            aiReasoning: isUrgent ? 'Определены ключевые слова высокой срочности.' : 'Стандартный приоритет.'
          },
          source: 'heuristic',
          warning: 'API-ключ не настроен. Создано с базовым анализом.'
        });
      }

      return NextResponse.json({
        error: aiError?.message || 'Ошибка парсинга через Gemini API'
      }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
