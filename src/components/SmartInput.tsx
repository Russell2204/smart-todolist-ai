'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { PriorityLevel, EisenhowerQuadrant } from '@/types/task';
import { 
  Sparkles, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  Tag as TagIcon,
  Loader2 
} from 'lucide-react';

export function SmartInput() {
  const { 
    addTask, 
    createTaskWithSmartInput, 
    isAiLoading, 
    aiActionType,
    settings 
  } = useTaskStore();

  const [inputVal, setInputVal] = useState('');
  const [useAi, setUseAi] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Manual fields (if expanded)
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>('SCHEDULE');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(30);
  const [tagInput, setTagInput] = useState('');

  const isSubmitting = isAiLoading && aiActionType === 'quick-add';

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed || isSubmitting) return;

    if (useAi) {
      await createTaskWithSmartInput(trimmed);
      setInputVal('');
      setDescription('');
      setIsExpanded(false);
    } else {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await addTask(
        {
          title: trimmed,
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          priority,
          quadrant,
          estimatedMinutes: estimatedMinutes || 30,
          tags,
        },
        false
      );

      setInputVal('');
      setDescription('');
      setDueDate('');
      setTagInput('');
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = [
    'Подготовить квартальный отчет к пятнице',
    'Исправить баг в авторизации срочно',
    'Записаться на чекап к врачу на завтра',
    'Купить кофе и воду для офиса',
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none p-4 sm:p-5 transition-all">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Что нужно сделать? (например: Подготовить квартальный отчет к пятнице)"
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* AI Toggle & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle AI Auto-fill */}
            <button
              type="button"
              onClick={() => setUseAi(!useAi)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                useAi
                  ? 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30 shadow-sm shadow-violet-500/10'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Использовать Gemini AI для автоматического определения дедлайна, приоритета и тегов"
            >
              <Sparkles className={`w-4 h-4 ${useAi ? 'text-violet-500 animate-pulse' : 'text-zinc-400'}`} />
              <span className="hidden xs:inline">✨ AI Auto-fill</span>
              <span className={`w-2 h-2 rounded-full ${useAi ? 'bg-violet-500' : 'bg-zinc-400'}`} />
            </button>

            {/* Expand / Advanced Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              title={isExpanded ? 'Скрыть дополнительные поля' : 'Настроить вручную'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Add Task Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() || isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-medium text-xs shadow-md shadow-violet-600/25 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Анализ...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Добавить</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        {!isExpanded && !inputVal && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1 font-medium text-zinc-400 dark:text-zinc-500">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Примеры:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputVal(prompt)}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Expanded Manual Options */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Описание / Детали
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробности задачи..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Срок (Дедлайн)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Приоритет и Квадрант
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-2 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="CRITICAL">Критический</option>
                  <option value="HIGH">Высокий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="LOW">Низкий</option>
                </select>
                <select
                  value={quadrant}
                  onChange={(e) => setQuadrant(e.target.value as EisenhowerQuadrant)}
                  className="w-full px-2 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="DO_FIRST">Q1: Сделать сейчас</option>
                  <option value="SCHEDULE">Q2: Запланировать</option>
                  <option value="DELEGATE">Q3: Делегировать</option>
                  <option value="DELETE">Q4: Исключить</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Время (мин) и Теги
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes || ''}
                  onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="30"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="теги, через запятую"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
