'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskCard } from './TaskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, SearchX, Sparkles, Plus } from 'lucide-react';
import { PriorityLevel } from '@/types/task';

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function TaskList() {
  const {
    tasks,
    searchQuery,
    filterStatus,
    filterTag,
    filterPriority,
    sortMode,
    resetToSampleData,
    setSearchQuery,
    setFilterStatus,
    setFilterTag,
    setFilterPriority,
  } = useTaskStore();

  // 1. Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filterStatus === 'active' && task.isCompleted) return false;
    if (filterStatus === 'completed' && !task.isCompleted) return false;

    // Priority filter
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

    // Tag filter
    if (filterTag && (!task.tags || !task.tags.includes(filterTag))) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    return true;
  });

  // 2. Sort filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks always at bottom unless filtering specifically for completed
    if (filterStatus === 'all' && a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }

    if (sortMode === 'aiScore') {
      return (b.aiScore || 0) - (a.aiScore || 0);
    }

    if (sortMode === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    if (sortMode === 'priority') {
      return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    }

    if (sortMode === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return 0;
  });

  // Empty state handling
  if (sortedTasks.length === 0) {
    const isFiltered = searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterTag;

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 my-4">
        {isFiltered ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Ничего не найдено
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Попробуйте изменить поисковый запрос или сбросить активные фильтры.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterTag(null);
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Сбросить фильтры
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Список пуст!
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Все текущие задачи выполнены. Добавьте новую задачу с помощью поля выше или восстановите демонстрационные данные.
            </p>
            <button
              onClick={resetToSampleData}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              Загрузить примеры задач
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 my-2">
      <AnimatePresence mode="popLayout">
        {sortedTasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 32,
              mass: 0.8,
            }}
          >
            <TaskCard task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
