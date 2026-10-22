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
import { ToastContainer } from '@/components/Toast';

export default function HomePage() {
  const { viewMode } = useTaskStore();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-5">
        {/* Smart Input Card */}
        <section aria-label="Добавление новой задачи">
          <SmartInput />
        </section>

        {/* Action Controls & Filters */}
        <section aria-label="Панель действий и фильтрация">
          <ActionBar />
        </section>

        {/* Task View: List or Eisenhower Matrix */}
        <section className="flex-1" aria-label="Список задач">
          {viewMode === 'list' ? <TaskList /> : <EisenhowerMatrix />}
        </section>
      </main>

      {/* Modals & Floating Toasts */}
      <TaskEditModal />
      <SettingsModal />
      <ToastContainer />
    </div>
  );
}
