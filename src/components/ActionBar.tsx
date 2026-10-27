'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { SortMode, PriorityLevel } from '@/types/task';
import { 
  Cpu, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Loader2, 
  Trash2,
  Tag as TagIcon,
  Timer
} from 'lucide-react';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

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
    viewMode,
    settings,
  } = useTaskStore();

  const isPrioritizing = isAiLoading && aiActionType === 'prioritizing';
  const activeTasksCount = tasks.filter((t) => !t.isCompleted).length;
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;

  const allTags = Array.from(
    new Set(tasks.flatMap((t) => t.tags).filter(Boolean))
  );

  const handlePrioritize = () => {
    if (settings.soundEnabled) playMechanicalClick(300, 0.03);
    triggerHaptic(15);
    prioritizeAllWithAI();
  };

  return (
    <div className="flex flex-col gap-2.5 py-2">
      
      {/* Top row: Tactile AI Sort Button & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Tactile AI Sort Button */}
        <button
          type="button"
          onClick={handlePrioritize}
          disabled={isAiLoading || cooldownRemaining > 0 || activeTasksCount === 0}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-tactile-dark min-h-[42px] ${
            cooldownRemaining > 0 || activeTasksCount === 0 || isAiLoading
              ? 'bg-slot border border-border-subtle text-text-muted cursor-not-allowed shadow-none'
              : 'bg-accent-amber hover:bg-accent-amber-hover text-slot active:translate-y-[2px] active:shadow-none'
          }`}
          title="Автоматическая расстановка приоритетов и квадрантов Эйзенхауэра с помощью Google Gemini"
        >
          {isPrioritizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
              <span>[ ВЫЧИСЛЕНИЕ ПРИОРИТЕТОВ... ]</span>
            </>
          ) : cooldownRemaining > 0 ? (
            <>
              <Timer className="w-4 h-4 stroke-[1.5] text-accent-amber" />
              <span className="font-mono text-[11px] text-accent-amber">
                [ ОХЛАЖДЕНИЕ: {cooldownRemaining}s ]
              </span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 stroke-[2]" />
              <span>[ AI СОРТИРОВКА ]</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] bg-slot/20 text-slot font-bold">
                {activeTasksCount}
              </span>
            </>
          )}
        </button>

        {/* Slotted Search Bar */}
        <div className="relative flex-1 sm:max-w-md flex items-center bg-slot border border-border-subtle focus-within:border-accent-amber rounded-[6px] shadow-sunken px-3 py-2 transition-colors">
          <Search className="w-3.5 h-3.5 text-text-muted mr-2 shrink-0 stroke-[1.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, деталям или тегам..."
            className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base sm:text-xs font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-text-muted hover:text-text-primary px-1"
              aria-label="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Second row: Horizontal scrolling filter chips & selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
        
        {/* Horizontal Status Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-0.5 rounded-[6px] bg-slot border border-border-subtle shadow-sunken">
          <button
            type="button"
            onClick={() => {
              if (settings.soundEnabled) playMechanicalClick(180, 0.015);
              setFilterStatus('all');
            }}
            className={`px-2.5 py-1 rounded-[4px] font-mono text-[11px] transition-all whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-border-subtle text-text-primary font-semibold shadow-plate border border-border-focus'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            ВСЕ [{tasks.length}]
          </button>
          <button
            type="button"
            onClick={() => {
              if (settings.soundEnabled) playMechanicalClick(180, 0.015);
              setFilterStatus('active');
            }}
            className={`px-2.5 py-1 rounded-[4px] font-mono text-[11px] transition-all whitespace-nowrap ${
              filterStatus === 'active'
                ? 'bg-border-subtle text-text-primary font-semibold shadow-plate border border-border-focus'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            АКТИВНЫЕ [{activeTasksCount}]
          </button>
          <button
            type="button"
            onClick={() => {
              if (settings.soundEnabled) playMechanicalClick(180, 0.015);
              setFilterStatus('completed');
            }}
            className={`px-2.5 py-1 rounded-[4px] font-mono text-[11px] transition-all whitespace-nowrap ${
              filterStatus === 'completed'
                ? 'bg-border-subtle text-text-primary font-semibold shadow-plate border border-border-focus'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            АРХИВ [{completedTasksCount}]
          </button>
        </div>

        {/* Priority, Tag, Sort Mode Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as PriorityLevel | 'all')}
            className="px-2 py-1 rounded-[4px] bg-slot border border-border-subtle text-text-secondary hover:text-text-primary font-mono text-[11px] focus:outline-none focus:border-accent-amber"
          >
            <option value="all">ВСЕ ПРИОРИТЕТЫ</option>
            <option value="CRITICAL">КРИТИЧЕСКИЙ</option>
            <option value="HIGH">ВЫСОКИЙ</option>
            <option value="MEDIUM">СРЕДНИЙ</option>
            <option value="LOW">НИЗКИЙ</option>
          </select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={filterTag || 'all'}
              onChange={(e) => setFilterTag(e.target.value === 'all' ? null : e.target.value)}
              className="px-2 py-1 rounded-[4px] bg-slot border border-border-subtle text-text-secondary hover:text-text-primary font-mono text-[11px] focus:outline-none focus:border-accent-amber"
            >
              <option value="all">ВСЕ ТЕГИ</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          {/* Sort Selector */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-[4px] bg-slot border border-border-subtle text-text-secondary font-mono text-[11px]">
              <ArrowUpDown className="w-3 h-3 text-text-muted stroke-[1.5]" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-transparent border-none text-[11px] focus:outline-none text-text-secondary hover:text-text-primary"
              >
                <option value="aiScore">AI SCORE</option>
                <option value="dueDate">ПО ДЕДЛАЙНУ</option>
                <option value="priority">ПО ВАЖНОСТИ</option>
                <option value="createdAt">ПО ДАТЕ</option>
              </select>
            </div>
          )}

          {/* Clear Completed Tasks */}
          {completedTasksCount > 0 && (
            <button
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(140, 0.02);
                clearCompleted();
              }}
              className="p-1.5 text-text-muted hover:text-status-danger rounded-[4px] hover:bg-status-danger/10 border border-transparent hover:border-status-danger/30 transition-all"
              title="Очистить архив выполненных задач"
              aria-label="Очистить выполненные"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
