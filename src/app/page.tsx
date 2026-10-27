'use client';

import React, { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Header } from '@/components/Header';
import { SmartInput } from '@/components/SmartInput';
import { ActionBar } from '@/components/ActionBar';
import { TaskList } from '@/components/TaskList';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
import { TaskEditModal } from '@/components/TaskEditModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { ToastContainer } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { viewMode, settings, tasks } = useTaskStore();
  const isReduced = settings.reducedMotion;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayFormatted = useMemo(() => {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(now).toUpperCase();
    } catch {
      return 'СЕГОДНЯ';
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-base text-text-primary">
      {/* Top Instrument Console */}
      <Header />

      {/* Main Focus Deck */}
      <main className={`flex-1 w-full mx-auto px-3.5 sm:px-8 py-6 sm:py-9 flex flex-col gap-6 sm:gap-7 transition-all duration-200 ${
        viewMode === 'matrix' ? 'max-w-6xl' : 'max-w-4xl'
      }`}>
        
        {/* Spacious Dashboard Hero Banner */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1 pb-2 border-b border-border-subtle/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-accent-amber tracking-wider select-none">
              <span className="w-2 h-2 rounded-[2px] bg-accent-amber shadow-glow-amber animate-pulse" />
              <span>[ СИСТЕМА ФОКУСА ]</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-secondary">{todayFormatted}</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-wider uppercase text-white leading-tight">
              {viewMode === 'matrix' ? 'МАТРИЦА СЕКТОРОВ // ЭЙЗЕНХАУЭР' : 'ФОКУС-СЕССИЯ // ПРИОРИТЕТЫ ДНЯ'}
            </h1>
          </div>

          {/* Telemetric Execution Gauge */}
          <div className="flex flex-col sm:items-end gap-1.5 shrink-0 select-none">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-text-muted">ПРОГРЕСС:</span>
              <span className="font-bold text-text-primary">
                {completedTasks}/{totalTasks}
              </span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-slot border border-border-subtle text-accent-amber font-bold text-[11px]">
                {percentage}%
              </span>
            </div>
            <div className="w-48 sm:w-56 h-1.5 rounded-[2px] bg-slot border border-border-subtle overflow-hidden">
              <div 
                className="h-full bg-accent-amber shadow-glow-amber transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </header>

        {/* Hardware Input Slot */}
        <section aria-label="Добавление новой задачи">
          <SmartInput />
        </section>

        {/* Tactical Control Bar */}
        <section aria-label="Панель действий и фильтрация">
          <ActionBar />
        </section>

        {/* View Deck: List or Eisenhower Matrix with Plane Shift */}
        <section className="flex-1" aria-label="Список задач">
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list-view"
                initial={isReduced ? undefined : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={isReduced ? undefined : { opacity: 0, x: 6 }}
                transition={isReduced ? { duration: 0.001 } : { duration: 0.12, ease: 'easeOut' }}
              >
                <TaskList />
              </motion.div>
            ) : (
              <motion.div
                key="matrix-view"
                initial={isReduced ? undefined : { opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={isReduced ? undefined : { opacity: 0, x: -6 }}
                transition={isReduced ? { duration: 0.001 } : { duration: 0.12, ease: 'easeOut' }}
              >
                <EisenhowerMatrix />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Modals & Telemetry Toasts */}
      <TaskEditModal />
      <SettingsModal />
      <AuthModal />
      <ApiKeyModal />
      <ToastContainer />
    </div>
  );
}
