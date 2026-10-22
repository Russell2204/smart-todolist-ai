'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { EisenhowerQuadrant, Task } from '@/types/task';
import { QUADRANT_CONFIG, PRIORITY_CONFIG } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import { Plus, Sparkles, CheckCircle, ArrowRightLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUADRANTS: EisenhowerQuadrant[] = ['DO_FIRST', 'SCHEDULE', 'DELEGATE', 'DELETE'];

export function EisenhowerMatrix() {
  const { tasks, addTask, updateTask, filterStatus, searchQuery } = useTaskStore();

  const [activeAddQuadrant, setActiveAddQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [quickTitle, setQuickTitle] = useState('');

  // Filter tasks based on global filters
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'active' && task.isCompleted) return false;
    if (filterStatus === 'completed' && !task.isCompleted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    return true;
  });

  const handleQuickAdd = async (quadrant: EisenhowerQuadrant) => {
    if (!quickTitle.trim()) return;
    const defaultPriority = quadrant === 'DO_FIRST' 
      ? 'CRITICAL' 
      : quadrant === 'SCHEDULE' 
      ? 'HIGH' 
      : quadrant === 'DELEGATE' 
      ? 'MEDIUM' 
      : 'LOW';

    await addTask(
      {
        title: quickTitle.trim(),
        quadrant,
        priority: defaultPriority,
        estimatedMinutes: 30,
      },
      false
    );

    setQuickTitle('');
    setActiveAddQuadrant(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 my-4">
      {QUADRANTS.map((quadrant) => {
        const config = QUADRANT_CONFIG[quadrant];
        const quadrantTasks = filteredTasks.filter(
          (t) => (t.quadrant || 'SCHEDULE') === quadrant
        );

        // Sort quadrant tasks by aiScore descending
        quadrantTasks.sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
          return (b.aiScore || 0) - (a.aiScore || 0);
        });

        const activeCount = quadrantTasks.filter((t) => !t.isCompleted).length;

        return (
          <div
            key={quadrant}
            className={`flex flex-col rounded-2xl border ${config.borderColor} bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[380px]`}
          >
            {/* Quadrant Header */}
            <div className={`p-4 border-b ${config.borderColor} bg-gradient-to-r ${config.color} flex items-center justify-between gap-3`}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50">
                    {config.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.badgeBg}`}>
                    {config.subtitle}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Действие: {config.action}
                </p>
              </div>

              {/* Task count & quick add */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-zinc-800/80 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                  {activeCount} акт.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAddQuadrant(activeAddQuadrant === quadrant ? null : quadrant);
                    setQuickTitle('');
                  }}
                  className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors"
                  title="Быстро добавить задачу в этот квадрант"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick add input form in quadrant */}
            {activeAddQuadrant === quadrant && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(quadrant);
                      if (e.key === 'Escape') setActiveAddQuadrant(null);
                    }}
                    autoFocus
                    placeholder={`Новая задача для "${config.title}"...`}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    onClick={() => handleQuickAdd(quadrant)}
                    disabled={!quickTitle.trim()}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium disabled:opacity-50 transition-colors"
                  >
                    Добавить
                  </button>
                  <button
                    onClick={() => setActiveAddQuadrant(null)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Tasks list in quadrant */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[500px]">
              {quadrantTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                  <p className="text-xs">В этом квадранте нет задач</p>
                  <button
                    onClick={() => setActiveAddQuadrant(quadrant)}
                    className="mt-2 text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    + Добавить задачу
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {quadrantTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative group/quad"
                    >
                      <TaskCard task={task} compact />

                      {/* Quadrant switch quick menu on hover */}
                      <div className="hidden group-hover/quad:flex absolute top-2 right-12 z-10 items-center gap-1 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1 shadow-md text-[10px]">
                        <span className="text-zinc-400 px-1">Переместить:</span>
                        {QUADRANTS.filter((q) => q !== quadrant).map((targetQ) => (
                          <button
                            key={targetQ}
                            onClick={() => updateTask(task.id, { quadrant: targetQ })}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
                            title={`Переместить в ${QUADRANT_CONFIG[targetQ].title}`}
                          >
                            {targetQ === 'DO_FIRST'
                              ? 'Q1'
                              : targetQ === 'SCHEDULE'
                              ? 'Q2'
                              : targetQ === 'DELEGATE'
                              ? 'Q3'
                              : 'Q4'}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
