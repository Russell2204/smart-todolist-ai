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
    <div className="flex flex-col gap-3 py-1">
      
      {/* Level 1: Tactile AI Sort Button & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Dominating Polished Amber AI Sort Button */}
        <button
          type="button"
          onClick={handlePrioritize}
          disabled={isAiLoading || cooldownRemaining > 0 || activeTasksCount === 0}
          className={`flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-[6px] font-display font-bold text-xs tracking-wider uppercase transition-all min-h-[46px] ${
            cooldownRemaining > 0 || activeTasksCount === 0 || isAiLoading
              ? 'bg-slot border border-border-subtle text-text-muted cursor-not-allowed shadow-none'
              : 'bg-gradient-to-b from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#F59E0B] text-slot shadow-[0_2px_0_#92400E,0_4px_16px_rgba(245,158,11,0.25)] active:translate-y-[2px] active:shadow-none'
          }`}
          title="Автоматическая расстановка приоритетов и квадрантов Эйзенхауэра с помощью Google Gemini"
        >
          {isPrioritizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slot" />
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
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-[3px] bg-slot/25 text-slot font-bold">
                {activeTasksCount}
              </span>
            </>
          )}
        </button>

        {/* Slotted Search Bar with Ambient Shadow */}
        <div className="relative flex-1 sm:max-w-md flex items-center bg-slot border border-border-subtle focus-within:border-accent-amber focus-within:shadow-[0_0_15px_rgba(245,158,11,0.12)] rounded-[6px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] px-3.5 py-2.5 transition-all min-h-[46px]">
          <Search className="w-4 h-4 text-[#8E97A6] mr-2.5 shrink-0 stroke-[1.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, деталям или тегам..."
            className="w-full bg-transparent text-white placeholder:text-[#8E97A6] focus:outline-none text-base sm:text-xs font-sans font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-text-muted hover:text-white px-1.5 py-0.5"
              aria-label="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Level 2: Status Rail & Filtering Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
        
        {/* Horizontal Status Track Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-[6px] bg-slot border border-border-subtle shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
          <button
            type="button"
            onClick={() => {
              if (settings.soundEnabled) playMechanicalClick(180, 0.015);
              setFilterStatus('all');
            }}
            className={`px-3 py-1.5 rounded-[4px] font-mono text-[11px] transition-all whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-border-focus text-white font-bold shadow-plate border border-accent-amber/50'
                : 'text-text-secondary hover:text-white'
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
            className={`px-3 py-1.5 rounded-[4px] font-mono text-[11px] transition-all whitespace-nowrap ${
              filterStatus === 'active'
                ? 'bg-border-focus text-white font-bold shadow-plate border border-accent-amber/50'
                : 'text-text-secondary hover:text-white'
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
            className={`px-3 py-1.5 rounded-[4px] font-mono text-[11px] transition-all whitespace-nowrap ${
              filterStatus === 'completed'
                ? 'bg-border-focus text-white font-bold shadow-plate border border-accent-amber/50'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            АРХИВ [{completedTasksCount}]
          </button>
        </div>

        {/* Priority, Tag, Sort Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as PriorityLevel | 'all')}
            className="px-2.5 py-1.5 rounded-[4px] bg-slot border border-border-subtle text-[#CBD2DE] hover:text-white font-mono text-[11px] focus:outline-none focus:border-accent-amber"
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
              className="px-2.5 py-1.5 rounded-[4px] bg-slot border border-border-subtle text-[#CBD2DE] hover:text-white font-mono text-[11px] focus:outline-none focus:border-accent-amber"
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
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-slot border border-border-subtle text-[#CBD2DE] font-mono text-[11px]">
              <ArrowUpDown className="w-3.5 h-3.5 text-text-muted stroke-[1.5]" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-transparent border-none text-[11px] focus:outline-none text-[#CBD2DE] hover:text-white"
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
              className="p-2 text-text-muted hover:text-status-danger rounded-[4px] hover:bg-status-danger/10 border border-transparent hover:border-status-danger/30 transition-all"
              title="Очистить архив выполненных задач"
              aria-label="Очистить выполненные"
            >
              <Trash2 className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
