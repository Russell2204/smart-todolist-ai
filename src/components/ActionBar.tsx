'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { SortMode, PriorityLevel } from '@/types/task';
import { 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Loader2, 
  Trash2,
  Tag as TagIcon,
  Timer
} from 'lucide-react';

export function ActionBar() {
  const {
    tasks,
    prioritizeAllWithAI,
    isAiLoading,
    aiActionType,
    cooldownRemaining,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterTag,
    setFilterTag,
    filterPriority,
    setFilterPriority,
    sortMode,
    setSortMode,
    clearCompleted,
    viewMode
  } = useTaskStore();

  const isPrioritizing = isAiLoading && aiActionType === 'prioritizing';
  const activeTasksCount = tasks.filter((t) => !t.isCompleted).length;
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;

  // Collect all unique tags from all tasks
  const allTags = Array.from(
    new Set(tasks.flatMap((t) => t.tags).filter(Boolean))
  );

  return (
    <div className="flex flex-col gap-3 py-2">
      {/* Top row: Magic Sort button & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Magic Sort Button */}
        <button
          onClick={() => prioritizeAllWithAI()}
          disabled={isAiLoading || cooldownRemaining > 0 || activeTasksCount === 0}
          className={`relative group overflow-hidden flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 shadow-lg ${
            cooldownRemaining > 0 || activeTasksCount === 0
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/25 hover:shadow-violet-600/40 hover:scale-[1.01] active:scale-[0.99]'
          }`}
          title="Gemini проанализирует все задачи, назначит приоритеты по матрице Эйзенхауэра и выстроит их в идеальном порядке"
        >
          {isPrioritizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Gemini расставляет приоритеты...</span>
            </>
          ) : cooldownRemaining > 0 ? (
            <>
              <Timer className="w-4 h-4 text-zinc-400" />
              <span>Пауза ({cooldownRemaining}с)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Разобрать с AI</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/20 text-white">
                {activeTasksCount} задач
              </span>
            </>
          )}

          {/* Glowing border highlight */}
          {!isAiLoading && cooldownRemaining === 0 && activeTasksCount > 0 && (
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-75 blur-md transition-opacity" />
          )}
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по задачам, описанию, тегам..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Second row: Filters & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
        {/* Status Filters */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Все ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'active'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Активные ({activeTasksCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'completed'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Завершенные ({completedTasksCount})
          </button>
        </div>

        {/* Right side controls: Tag filter, Priority filter, Sort Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as PriorityLevel | 'all')}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">Все приоритеты</option>
            <option value="CRITICAL">Критический</option>
            <option value="HIGH">Высокий</option>
            <option value="MEDIUM">Средний</option>
            <option value="LOW">Низкий</option>
          </select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={filterTag || 'all'}
              onChange={(e) => setFilterTag(e.target.value === 'all' ? null : e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">Все теги</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          {/* Sort dropdown (primarily for list view) */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-transparent border-none text-xs focus:outline-none text-zinc-700 dark:text-zinc-300"
              >
                <option value="aiScore">По AI рейтингу (aiScore)</option>
                <option value="dueDate">По дедлайну</option>
                <option value="priority">По уровню важности</option>
                <option value="createdAt">По дате создания</option>
              </select>
            </div>
          )}

          {/* Clear Completed Tasks */}
          {completedTasksCount > 0 && (
            <button
              onClick={clearCompleted}
              className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Очистить все завершенные задачи"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
