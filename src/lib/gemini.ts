import { GoogleGenAI, Type } from '@google/genai';
import { Task, AIPrioritizationResult, AIDecomposeResult, AIQuickAddResult } from '@/types/task';

// Default model as recommended in SPEC
export const DEFAULT_MODEL = 'gemini-2.5-flash';

// Get AI client with server key or user-provided BYOK key
export function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// JSON Schema for Mass Prioritization (Scenario A in SPEC)
const prioritizationSchema = {
  type: Type.ARRAY,
  description: "Список проанализированных задач с обновленными приоритетами",
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "ID исходной задачи" },
      priority: { 
        type: Type.STRING, 
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] 
      },
      quadrant: { 
        type: Type.STRING, 
        enum: ["DO_FIRST", "SCHEDULE", "DELEGATE", "DELETE"] 
      },
      estimatedMinutes: { 
        type: Type.INTEGER, 
        description: "Оценка времени в минутах" 
      },
      aiScore: { 
        type: Type.INTEGER, 
        description: "Рейтинг приоритетности от 1 до 100" 
      },
      aiReasoning: { 
        type: Type.STRING, 
        description: "Короткое объяснение выбора приоритета для пользователя на русском языке" 
      }
    },
    required: ["id", "priority", "quadrant", "estimatedMinutes", "aiScore", "aiReasoning"]
  }
};

// JSON Schema for Subtask Decomposition (Scenario B)
const decompositionSchema = {
  type: Type.OBJECT,
  description: "Список конкретных подзадач для выполнения задачи",
  properties: {
    subtasks: {
      type: Type.ARRAY,
      description: "От 3 до 5 конкретных шагов",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Четкое описание шага" }
        },
        required: ["title"]
      }
    }
  },
  required: ["subtasks"]
};

// JSON Schema for Smart Input / NLP Parsing
const quickAddSchema = {
  type: Type.OBJECT,
  description: "Разобранная задача с извлеченным дедлайном, приоритетом и тегами",
  properties: {
    title: { type: Type.STRING, description: "Очищенное краткое название задачи" },
    description: { type: Type.STRING, description: "Дополнительные детали или контекст (если есть)" },
    dueDate: { type: Type.STRING, description: "Дедлайн в формате ISO YYYY-MM-DD или пустая строка если не указан" },
    priority: { 
      type: Type.STRING, 
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] 
    },
    quadrant: { 
      type: Type.STRING, 
      enum: ["DO_FIRST", "SCHEDULE", "DELEGATE", "DELETE"] 
    },
    estimatedMinutes: { type: Type.INTEGER, description: "Оценка времени в минутах (например, 15, 30, 60, 120)" },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "1-3 подходящих тега на русском (например: работа, финансы, здоровье, дом, учеба)"
    },
    aiScore: { type: Type.INTEGER, description: "Приоритетность от 1 до 100" },
    aiReasoning: { type: Type.STRING, description: "Краткое обоснование на русском языке (1 предложение)" }
  },
  required: ["title", "priority", "quadrant", "estimatedMinutes", "tags", "aiScore", "aiReasoning"]
};

/**
 * 1. AI Prioritization for task list
 */
export async function prioritizeTasksWithAI(
  tasks: Task[], 
  customApiKey?: string, 
  modelName: string = DEFAULT_MODEL
): Promise<AIPrioritizationResult[]> {
  const ai = getGeminiClient(customApiKey);
  if (!ai) {
    throw new Error('API_KEY_MISSING');
  }

  // Filter only active tasks, maximum 50 tasks (SPEC limit)
  const activeTasks = tasks.filter(t => !t.isCompleted).slice(0, 50);
  if (activeTasks.length === 0) {
    return [];
  }

  const prompt = `
Текущее локальное время и дата: ${new Date().toISOString()} (день недели: ${new Date().toLocaleDateString('ru-RU', { weekday: 'long' })})

Список активных задач для анализа:
${JSON.stringify(activeTasks.map(t => ({
  id: t.id,
  title: t.title,
  description: t.description || '',
  dueDate: t.dueDate || 'Не указан',
  currentPriority: t.priority,
  currentQuadrant: t.quadrant || 'Не определен',
  tags: t.tags
})), null, 2)}

Обязательно проанализируй каждую задачу из переданного списка и верни массив объектов с теми же id.
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: `Ты — признанный эксперт по личной эффективности, методикам GTD и матрице Эйзенхауэра.
Твоя задача — расставить задачи в идеальном порядке выполнения на сегодня.
Матрица Эйзенхауэра:
- DO_FIRST: Срочно и Важно (критические дедлайны, аварии, ключевые обязательства)
- SCHEDULE: Не срочно, но Важно (стратегия, здоровье, саморазвитие, подготовка)
- DELEGATE: Срочно, но Не важно (рутина, мелкие чужие запросы, организационные мелочи)
- DELETE: Не срочно и Не важно (пожиратели времени, лишнее)

Правила:
1. Выстави aiScore от 1 до 100 (100 — самая первая задача к выполнению).
2. Рассчитай estimatedMinutes реалистично.
3. aiReasoning должно быть четким, мотивирующим и на русском языке (1 емкое предложение).
4. Обязательно верни валидный JSON по заданной схеме.`,
        responseMimeType: "application/json",
        responseSchema: prioritizationSchema as any,
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Пустой ответ от Gemini API');
    }

    const parsed = JSON.parse(text) as AIPrioritizationResult[];
    return parsed;
  } catch (err: any) {
    // If model 2.5-flash encounters an issue, attempt fallback to gemini-2.0-flash or gemini-1.5-flash
    if (modelName === 'gemini-2.5-flash') {
      try {
        console.warn('Fallback to gemini-2.0-flash...');
        return await prioritizeTasksWithAI(tasks, customApiKey, 'gemini-2.0-flash');
      } catch {
        // Continue to throw original error
      }
    }
    throw err;
  }
}

/**
 * 2. Decompose a complex task into 3-5 subtasks
 */
export async function decomposeTaskWithAI(
  title: string, 
  description?: string, 
  customApiKey?: string, 
  modelName: string = DEFAULT_MODEL
): Promise<AIDecomposeResult> {
  const ai = getGeminiClient(customApiKey);
  if (!ai) {
    throw new Error('API_KEY_MISSING');
  }

  const prompt = `
Задача: "${title}"
Дополнительное описание: "${description || 'Нет'}"

Разбей эту задачу на 3-5 конкретных, измеримых, понятных и последовательных шагов (подзадач), каждый из которых можно выполнить за 1 подход.
Шаги должны начинаться с глагола в неопределенной форме или повелительном наклонении (например: "Собрать материалы", "Написать черновик", "Проверить расчеты").
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "Ты — методист по декомпозиции сложных проектов. Формируй краткие и действенные шаги на русском языке.",
        responseMimeType: "application/json",
        responseSchema: decompositionSchema as any,
        temperature: 0.3,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Пустой ответ от Gemini API');
    }

    return JSON.parse(text) as AIDecomposeResult;
  } catch (err: any) {
    if (modelName === 'gemini-2.5-flash') {
      try {
        return await decomposeTaskWithAI(title, description, customApiKey, 'gemini-2.0-flash');
      } catch {}
    }
    throw err;
  }
}

/**
 * 3. Smart NLP Input parsing
 */
export async function quickAddWithAI(
  rawText: string, 
  customApiKey?: string, 
  modelName: string = DEFAULT_MODEL
): Promise<AIQuickAddResult> {
  const ai = getGeminiClient(customApiKey);
  if (!ai) {
    throw new Error('API_KEY_MISSING');
  }

  const now = new Date();
  const prompt = `
Введенный текст пользователя: "${rawText}"
Текущая дата и время: ${now.toISOString()} (${now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})

Извлеки:
1. title: аккуратное название задачи без мусорных слов.
2. description: уточняющие детали (если есть).
3. dueDate: точную дату в формате ISO YYYY-MM-DD (например, если написано "к пятнице", "завтра в 18:00", "послезавтра", "к концу месяца", рассчитай точную дату). Если дедлайн не указан, верни пустую строку.
4. priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
5. quadrant: 'DO_FIRST' | 'SCHEDULE' | 'DELEGATE' | 'DELETE'
6. estimatedMinutes: примерное время в минутах (например 15, 30, 45, 60, 120, 180).
7. tags: массив из 1-3 релевантных коротких тегов на русском языке (например: "работа", "здоровье", "покупки", "учеба", "быт").
8. aiScore: оценка важности от 1 до 100.
9. aiReasoning: краткое объяснение приоритета (1 предложение).
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "Ты — умный интеллектуальный парсер задач. Точно распознавай намерения пользователя, временные рамки и категории.",
        responseMimeType: "application/json",
        responseSchema: quickAddSchema as any,
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Пустой ответ от Gemini API');
    }

    return JSON.parse(text) as AIQuickAddResult;
  } catch (err: any) {
    if (modelName === 'gemini-2.5-flash') {
      try {
        return await quickAddWithAI(rawText, customApiKey, 'gemini-2.0-flash');
      } catch {}
    }
    throw err;
  }
}

/**
 * 4. API Key Test / Status Check
 */
export async function testGeminiApiKey(apiKey: string, modelName: string = DEFAULT_MODEL): Promise<{ success: boolean; message: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Ответь словом "OK"',
      config: {
        temperature: 0.1,
      }
    });

    if (response.text) {
      return { success: true, message: 'Ключ успешно проверен!' };
    }
    return { success: false, message: 'Пустой ответ от модели' };
  } catch (err: any) {
    return { 
      success: false, 
      message: err?.message || 'Ошибка подключения к Gemini API' 
    };
  }
}

/**
 * Heuristic fallback for smart prioritization when no API key is provided
 * (Ensures the app is 100% usable and testable even without an API key!)
 */
export function heuristicPrioritize(tasks: Task[]): AIPrioritizationResult[] {
  const now = new Date().getTime();
  
  return tasks.map(task => {
    let score = 50;
    let quadrant: Task['quadrant'] = task.quadrant || 'SCHEDULE';
    let priority = task.priority;
    let estimatedMinutes = task.estimatedMinutes || 30;

    // Check due date
    if (task.dueDate) {
      const dueTime = new Date(task.dueDate).getTime();
      const diffDays = (dueTime - now) / (1000 * 60 * 60 * 24);
      if (diffDays <= 0) {
        score += 35;
        priority = 'CRITICAL';
        quadrant = 'DO_FIRST';
      } else if (diffDays <= 1) {
        score += 25;
        priority = priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
        quadrant = 'DO_FIRST';
      } else if (diffDays <= 3) {
        score += 15;
        priority = priority === 'LOW' ? 'MEDIUM' : priority;
        quadrant = 'SCHEDULE';
      }
    }

    // Adjust for current priority
    if (priority === 'CRITICAL') score += 20;
    else if (priority === 'HIGH') score += 10;
    else if (priority === 'LOW') score -= 15;

    // Normalize score to 1-100
    const finalScore = Math.min(100, Math.max(10, score));

    const aiReasoning = priority === 'CRITICAL' || quadrant === 'DO_FIRST'
      ? 'Высокая срочность и важность. Рекомендуется выполнить в первую очередь.'
      : quadrant === 'SCHEDULE'
      ? 'Важная стратегическая задача, требующая выделенного времени в расписании.'
      : quadrant === 'DELEGATE'
      ? 'Рутинная задача со сроком, которую при возможности лучше делегировать.'
      : 'Низкий приоритет. Можно отложить до завершения ключевых дел.';

    return {
      id: task.id,
      priority,
      quadrant: quadrant || 'SCHEDULE',
      estimatedMinutes,
      aiScore: finalScore,
      aiReasoning
    };
  });
}
