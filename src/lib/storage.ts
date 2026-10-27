import { Task } from '@/types/task';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Подготовить квартальный отчет к пятнице',
    description: 'Свести данные из CRM, составить презентацию для руководства и выделить ключевые метрики роста.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 24 * 2).toISOString().split('T')[0],
    isCompleted: false,
    priority: 'HIGH',
    quadrant: 'DO_FIRST',
    estimatedMinutes: 90,
    tags: ['работа', 'финансы', 'отчет'],
    subtasks: [
      { id: 'sub-1-1', title: 'Выгрузить выгрузку продаж из CRM', isCompleted: true },
      { id: 'sub-1-2', title: 'Построить графики динамики выручки в Excel', isCompleted: false },
      { id: 'sub-1-3', title: 'Оформить 5 слайдов в презентации', isCompleted: false },
    ],
    aiScore: 92,
    aiReasoning: 'Близкий дедлайн и критическое влияние на планирование компании.',
  },
  {
    id: 'task-2',
    title: 'Исправить критический баг в модуле авторизации',
    description: 'Пользователи с длинными email не могут восстановить пароль.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 8).toISOString().split('T')[0],
    isCompleted: false,
    priority: 'CRITICAL',
    quadrant: 'DO_FIRST',
    estimatedMinutes: 45,
    tags: ['разработка', 'баги', 'срочно'],
    subtasks: [
      { id: 'sub-2-1', title: 'Воспроизвести ошибку в staging окружении', isCompleted: false },
      { id: 'sub-2-2', title: 'Исправить regex валидации в AuthController', isCompleted: false },
      { id: 'sub-2-3', title: 'Написать юнит-тест и задеплоить хотфикс', isCompleted: false },
    ],
    aiScore: 98,
    aiReasoning: 'Блокирует пользователей прямо сейчас. Требует немедленного решения.',
  },
  {
    id: 'task-3',
    title: 'Записаться на ежегодный чекап здоровья',
    description: 'Выбрать клинику и записаться на анализы крови и терапевта.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().split('T')[0],
    isCompleted: false,
    priority: 'MEDIUM',
    quadrant: 'SCHEDULE',
    estimatedMinutes: 20,
    tags: ['здоровье', 'личное'],
    subtasks: [],
    aiScore: 65,
    aiReasoning: 'Стратегически важно для здоровья, но нет горящего дедлайна прямо сегодня.',
  },
  {
    id: 'task-4',
    title: 'Продлить страховку на автомобиль',
    description: 'Сравнить предложения страховых компаний и оплатить полис онлайн.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 24 * 4).toISOString().split('T')[0],
    isCompleted: false,
    priority: 'HIGH',
    quadrant: 'SCHEDULE',
    estimatedMinutes: 30,
    tags: ['авто', 'документы'],
    subtasks: [],
    aiScore: 78,
    aiReasoning: 'Истекает через несколько дней. Пропуск повлечет штрафы.',
  },
  {
    id: 'task-5',
    title: 'Разобрать подписки и спам в электронной почте',
    description: 'Отписаться от ненужных промо-рассылок и освободить место в Gmail.',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    isCompleted: false,
    priority: 'LOW',
    quadrant: 'DELETE',
    estimatedMinutes: 25,
    tags: ['рутина', 'порядок'],
    subtasks: [],
    aiScore: 25,
    aiReasoning: 'Низкая ценность. Выполнять только в свободное время между основными делами.',
  },
  {
    id: 'task-6',
    title: 'Заказать воду и расходники в офис',
    description: 'Сделать заказ курьеру на 4 бутыли воды и зерновой кофе.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 24 * 1).toISOString().split('T')[0],
    isCompleted: false,
    priority: 'LOW',
    quadrant: 'DELEGATE',
    estimatedMinutes: 10,
    tags: ['офис', 'быт'],
    subtasks: [],
    aiScore: 42,
    aiReasoning: 'Срочно, но операционная рутина — стоит делегировать офис-менеджеру.',
  }
];

const STORAGE_KEY = 'smart_todolist_tasks';
const SETTINGS_KEY = 'smart_todolist_settings';

export interface AppSettings {
  apiKey: string;
  model: string;
  autoAnalyzeDefault: boolean;
  theme: 'system' | 'light' | 'dark';
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  autoAnalyzeDefault: true,
  theme: 'system',
  soundEnabled: true,
  reducedMotion: false,
};

export function loadStoredTasks(): Task[] {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_TASKS;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return INITIAL_TASKS;
  }
}

export function saveStoredTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function loadStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}
