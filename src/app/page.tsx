'use client';

import React from 'react';
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
  const { viewMode, settings } = useTaskStore();
  const isReduced = settings.reducedMotion;

  return (
    <div className="min-h-screen flex flex-col bg-base text-text-primary">
      {/* Top Instrument Console */}
      <Header />

      {/* Main Focus Deck */}
      <main className={`flex-1 w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-3.5 transition-all duration-200 ${
        viewMode === 'matrix' ? 'max-w-6xl' : 'max-w-4xl'
      }`}>
        
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
