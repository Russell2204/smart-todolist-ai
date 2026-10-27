'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { PriorityLevel, EisenhowerQuadrant } from '@/types/task';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  Cpu, 
  Loader2,
  Tag as TagIcon
} from 'lucide-react';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

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

  // Manual fields
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

    if (settings.soundEnabled) playMechanicalClick(280, 0.025);
    triggerHaptic(12);

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

  return (
    <div className="bg-surface rounded-[8px] border border-border-subtle p-3 sm:p-4 shadow-plate transition-all">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        
        {/* Main Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Hardware Slot Input */}
          <div className="relative flex-1 flex items-center bg-slot border border-border-subtle focus-within:border-accent-amber rounded-[6px] shadow-sunken px-3 py-2 transition-colors">
            {/* LED Status indicator inside slot */}
            <span 
              className={`w-2 h-2 rounded-[2px] mr-2.5 shrink-0 transition-all ${
                useAi ? 'bg-accent-amber shadow-glow-amber' : 'bg-border-focus'
              }`}
              title={useAi ? 'Режим AI анализа активен' : 'Стандартный ввод'} 
            />

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="+ Введите задачу или цель... [Enter]"
              className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base sm:text-sm font-sans"
            />

            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="text-xs text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded-[2px]"
                aria-label="Очистить ввод"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* AI Toggle Rocker */}
            <button
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(200, 0.02);
                setUseAi(!useAi);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-[6px] font-mono text-xs border transition-all ${
                useAi
                  ? 'bg-slot border-border-amberDim text-accent-amber shadow-glow-amber'
                  : 'bg-slot border-border-subtle text-text-muted hover:text-text-secondary'
              }`}
              title="Автоматический разбор даты, времени и приоритета через Google Gemini 2.5 Flash"
            >
              <Cpu className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="font-display tracking-wider uppercase text-[11px]">
                {useAi ? 'AI: ВКЛ' : 'AI: ВЫКЛ'}
              </span>
            </button>

            {/* Expand / Manual Parameters Toggle */}
            <button
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(180, 0.02);
                setIsExpanded(!isExpanded);
              }}
              className={`p-2 rounded-[6px] border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-border-subtle/30 transition-all ${
                isExpanded ? 'bg-border-subtle/40 text-text-primary' : 'bg-slot'
              }`}
              title={isExpanded ? 'Свернуть параметры' : 'Настроить параметры вручную'}
              aria-label="Ручные параметры задачи"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[1.5]" /> : <ChevronDown className="w-4 h-4 stroke-[1.5]" />}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() || isSubmitting}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-[6px] font-display font-semibold text-xs tracking-wider uppercase transition-all min-h-[40px] ${
                !inputVal.trim() || isSubmitting
                  ? 'bg-slot border border-border-subtle text-text-muted cursor-not-allowed'
                  : 'bg-accent-amber hover:bg-accent-amber-hover active:translate-y-[2px] active:shadow-none text-slot shadow-tactile-dark'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-slot" />
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>ДОБАВИТЬ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Manual Parameters (Segmented Controls) */}
        {isExpanded && (
          <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            
            {/* Description */}
            <div>
              <label className="block text-text-muted font-mono text-[11px] mb-1">
                ДЕТАЛИ / ОПИСАНИЕ
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробности задачи..."
                className="w-full px-2.5 py-1.5 rounded-[4px] bg-slot border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-amber font-sans text-base sm:text-xs"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-text-muted font-mono text-[11px] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-text-muted stroke-[1.5]" />
                ДЕРОК / ДЕДЛАЙН
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-[4px] bg-slot border border-border-subtle text-text-primary focus:outline-none focus:border-accent-amber font-mono text-base sm:text-xs"
              />
            </div>

            {/* Priority Segmented Control */}
            <div>
              <label className="block text-text-muted font-mono text-[11px] mb-1">
                ПРИОРИТЕТ
              </label>
              <div className="grid grid-cols-4 gap-1 p-0.5 rounded-[4px] bg-slot border border-border-subtle">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as PriorityLevel[]).map((p) => {
                  const labels: Record<PriorityLevel, string> = {
                    LOW: 'НИЗК',
                    MEDIUM: 'СРЕД',
                    HIGH: 'ВЫС',
                    CRITICAL: 'КРИТ',
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                        setPriority(p);
                      }}
                      className={`py-1 rounded-[2px] font-mono text-[10px] uppercase font-semibold transition-all ${
                        priority === p
                          ? 'bg-border-focus text-text-primary shadow-plate'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quadrant Segmented Control */}
            <div>
              <label className="block text-text-muted font-mono text-[11px] mb-1">
                КВАДРАНТ ЭЙЗЕНХАУЭРА
              </label>
              <div className="grid grid-cols-4 gap-1 p-0.5 rounded-[4px] bg-slot border border-border-subtle">
                {(['DO_FIRST', 'SCHEDULE', 'DELEGATE', 'DELETE'] as EisenhowerQuadrant[]).map((q) => {
                  const labels: Record<EisenhowerQuadrant, string> = {
                    DO_FIRST: 'Q1',
                    SCHEDULE: 'Q2',
                    DELEGATE: 'Q3',
                    DELETE: 'Q4',
                  };
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                        setQuadrant(q);
                      }}
                      className={`py-1 rounded-[2px] font-mono text-[10px] font-bold uppercase transition-all ${
                        quadrant === q
                          ? 'bg-accent-amber/20 border border-accent-amber/40 text-accent-amber'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                      title={q}
                    >
                      {labels[q]}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </form>
    </div>
  );
}
