'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskCard } from './TaskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { PriorityLevel } from '@/types/task';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

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
    settings,
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
    // Completed tasks at the bottom unless filtering specifically for completed
    if (filterStatus === 'all' && a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }

    if (sortMode === 'aiScore') {
      const scoreA = a.aiScore ?? -1;
      const scoreB = b.aiScore ?? -1;
      if (scoreA !== scoreB) return scoreB - scoreA;
      // Fallback to priority
      return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    }

    if (sortMode === 'priority') {
      const diff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (diff !== 0) return diff;
      return (b.aiScore ?? 0) - (a.aiScore ?? 0);
    }

    if (sortMode === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    if (sortMode === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return 0;
  });

  // Blueprint Vector Empty States
  if (sortedTasks.length === 0) {
    const isFiltered = searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterTag;

    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface rounded-[8px] border border-border-subtle my-3 shadow-plate">
        {isFiltered ? (
          <>
            {/* Blueprint 0 Matches Graphic */}
            <div className="w-16 h-16 rounded-[4px] bg-slot border border-border-subtle flex flex-col items-center justify-center font-mono text-text-muted mb-3 relative">
              <span className="text-[10px] tracking-widest text-accent-amber font-bold">00</span>
              <div className="w-8 h-[1px] bg-border-focus my-1" />
              <span className="text-[9px] uppercase tracking-wider text-text-muted">MATCH</span>
            </div>
            <h3 className="font-display font-semibold text-sm tracking-wider uppercase text-text-primary">
              [ 0 MATCHES FOUND ]
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mt-1.5 font-sans leading-relaxed">
              По запросу ничего не найдено. Измените параметры поиска или сбросьте активные фильтры.
            </p>
            <button
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                setSearchQuery('');
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterTag(null);
              }}
              className="mt-4 px-3.5 py-1.5 rounded-[4px] font-display font-semibold text-xs tracking-wider uppercase bg-slot hover:bg-border-subtle text-text-primary border border-border-subtle transition-all"
            >
              Сбросить фильтры
            </button>
          </>
        ) : (
          <>
            {/* Blueprint Queue Clear Graphic */}
            <div className="w-16 h-16 rounded-[4px] bg-slot border border-border-subtle flex flex-col items-center justify-center font-mono text-text-muted mb-3">
              <span className="w-2 h-2 rounded-[2px] bg-status-success shadow-glow-green mb-1" />
              <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold">IDLE</span>
            </div>
            <h3 className="font-display font-semibold text-sm tracking-wider uppercase text-text-primary">
              [ SYSTEM IDLE // QUEUE CLEAR ]
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mt-1.5 font-sans leading-relaxed">
              Очередь задач пуста. Все текущие цели закрыты. Введите новую задачу в поле выше или загрузите тестовый набор.
            </p>
            <button
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(240, 0.02);
                triggerHaptic(10);
                resetToSampleData();
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] font-display font-semibold text-xs tracking-wider uppercase bg-accent-amber hover:bg-accent-amber-hover active:translate-y-[1px] text-slot shadow-tactile-dark transition-all"
            >
              Загрузить примеры задач
            </button>
          </>
        )}
      </div>
    );
  }

  const isReduced = settings.reducedMotion;

  return (
    <div className="flex flex-col gap-2 my-2">
      <AnimatePresence mode="popLayout">
        {sortedTasks.map((task) => (
          <motion.div
            key={task.id}
            layout={!isReduced}
            initial={isReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={isReduced ? { duration: 0.001 } : {
              type: 'spring',
              stiffness: 450,
              damping: 34,
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
