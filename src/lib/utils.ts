import { PriorityLevel, EisenhowerQuadrant } from '@/types/task';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Priority color configuration
export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    iconColor: string;
  }
> = {
  CRITICAL: {
    label: 'Критический',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
    iconColor: 'text-red-500',
  },
  HIGH: {
    label: 'Высокий',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    iconColor: 'text-amber-500',
  },
  MEDIUM: {
    label: 'Средний',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
    iconColor: 'text-blue-500',
  },
  LOW: {
    label: 'Низкий',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
    iconColor: 'text-slate-400',
  },
};

// Eisenhower Quadrants configuration
export const QUADRANT_CONFIG: Record<
  EisenhowerQuadrant,
  {
    title: string;
    subtitle: string;
    action: string;
    color: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    headerBg: string;
  }
> = {
  DO_FIRST: {
    title: 'Сделать сейчас (Q1)',
    subtitle: 'Важно и Срочно',
    action: 'Сделать в первую очередь',
    color: 'from-rose-500/15 to-red-500/5',
    badgeBg: 'bg-red-500/15 text-red-700 dark:text-red-300',
    badgeText: 'Срочно и Важно',
    borderColor: 'border-red-500/30',
    headerBg: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  SCHEDULE: {
    title: 'Запланировать (Q2)',
    subtitle: 'Важно, но Не срочно',
    action: 'Запланировать в календаре',
    color: 'from-blue-500/15 to-sky-500/5',
    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    badgeText: 'Важно, не срочно',
    borderColor: 'border-blue-500/30',
    headerBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  DELEGATE: {
    title: 'Делегировать (Q3)',
    subtitle: 'Срочно, но Не важно',
    action: 'Поручить или автоматизировать',
    color: 'from-amber-500/15 to-yellow-500/5',
    badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    badgeText: 'Срочно, не важно',
    borderColor: 'border-amber-500/30',
    headerBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  DELETE: {
    title: 'Исключить / Отложить (Q4)',
    subtitle: 'Не важно и Не срочно',
    action: 'Отложить или удалить',
    color: 'from-slate-500/15 to-gray-500/5',
    badgeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
    badgeText: 'Не срочно, не важно',
    borderColor: 'border-slate-500/30',
    headerBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
};

// Date formatting helper
export function formatDueDate(dateStr?: string): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dateStr) return { text: '', isOverdue: false, isToday: false };

  const targetDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDay = new Date(targetDate);
  targetDay.setHours(0, 0, 0, 0);

  const diffTime = targetDay.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Просрочено (${Math.abs(diffDays)} дн.)`,
      isOverdue: true,
      isToday: false,
    };
  }

  if (diffDays === 0) {
    return { text: 'Сегодня', isOverdue: false, isToday: true };
  }

  if (diffDays === 1) {
    return { text: 'Завтра', isOverdue: false, isToday: false };
  }

  if (diffDays === 2) {
    return { text: 'Послезавтра', isOverdue: false, isToday: false };
  }

  if (diffDays <= 7) {
    const weekday = targetDate.toLocaleDateString('ru-RU', { weekday: 'short' });
    return { text: `В ${weekday} (${diffDays} дн.)`, isOverdue: false, isToday: false };
  }

  return {
    text: targetDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    isOverdue: false,
    isToday: false,
  };
}

// Format estimated time
export function formatEstimatedTime(minutes?: number): string {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `~${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `~${hours} ч`;
  return `~${hours} ч ${remainingMinutes} м`;
}
