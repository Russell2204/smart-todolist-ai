'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { PriorityLevel, EisenhowerQuadrant } from '@/types/task';
import { X, Calendar, Clock, Tag as TagIcon, Cpu } from 'lucide-react';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

export function TaskEditModal() {
  const { editingTask, setEditingTask, updateTask, settings } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>('SCHEDULE');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(30);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate || '');
      setPriority(editingTask.priority);
      setQuadrant(editingTask.quadrant || 'SCHEDULE');
      setEstimatedMinutes(editingTask.estimatedMinutes);
      setTagsInput((editingTask.tags || []).join(', '));
    }
  }, [editingTask]);

  if (!editingTask) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (settings.soundEnabled) playMechanicalClick(280, 0.025);
    triggerHaptic(12);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateTask(editingTask.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      quadrant,
      estimatedMinutes: estimatedMinutes || 30,
      tags,
    });

    setEditingTask(null);
  };

  const handleClose = () => {
    if (settings.soundEnabled) playMechanicalClick(180, 0.015);
    setEditingTask(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-surface rounded-t-[12px] sm:rounded-[8px] border border-border-subtle shadow-plate max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-accent-amber shadow-glow-amber" />
            <h2 className="font-display font-bold text-xs sm:text-sm tracking-wider uppercase text-text-primary">
              ПАРАМЕТРЫ ЗАДАЧИ // РЕДАКТИРОВАНИЕ
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary rounded-[3px] hover:bg-slot transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          
          {/* Title */}
          <div>
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1">
              НАЗВАНИЕ ЗАДАЧИ *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-[4px] bg-slot border border-border-subtle text-text-primary focus:outline-none focus:border-accent-amber font-sans text-base sm:text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1">
              ДЕТАЛИ / КОНТЕКСТ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительные детали..."
              className="w-full px-3 py-2 rounded-[4px] bg-slot border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-amber font-sans text-base sm:text-xs"
            />
          </div>

          {/* Due Date & Estimated Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] text-text-muted uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-text-muted stroke-[1.5]" />
                ДЕДЛАЙН
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-[4px] bg-slot border border-border-subtle text-text-primary font-mono text-base sm:text-xs focus:outline-none focus:border-accent-amber"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] text-text-muted uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-text-muted stroke-[1.5]" />
                ВРЕМЯ (МИНУТЫ)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes || ''}
                onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-full px-2.5 py-1.5 rounded-[4px] bg-slot border border-border-subtle text-text-primary font-mono text-base sm:text-xs focus:outline-none focus:border-accent-amber"
              />
            </div>
          </div>

          {/* Priority Segmented Control */}
          <div>
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1">
              УРОВЕНЬ ВАЖНОСТИ
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
                    className={`py-1.5 rounded-[2px] font-mono text-[10px] uppercase font-semibold transition-all ${
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
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1">
              СЕКТОР ЭЙЗЕНХАУЭРА
            </label>
            <div className="grid grid-cols-4 gap-1 p-0.5 rounded-[4px] bg-slot border border-border-subtle">
              {(['DO_FIRST', 'SCHEDULE', 'DELEGATE', 'DELETE'] as EisenhowerQuadrant[]).map((q) => {
                const labels: Record<EisenhowerQuadrant, string> = {
                  DO_FIRST: 'A // ФОКУС',
                  SCHEDULE: 'B // ПЛАН',
                  DELEGATE: 'C // ПОРУЧИТЬ',
                  DELETE: 'D // СБРОС',
                };
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                      setQuadrant(q);
                    }}
                    className={`py-1.5 rounded-[2px] font-mono text-[10px] font-bold uppercase transition-all ${
                      quadrant === q
                        ? 'bg-accent-amber/20 border border-accent-amber/40 text-accent-amber'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {labels[q]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1 flex items-center gap-1">
              <TagIcon className="w-3 h-3 text-text-muted stroke-[1.5]" />
              ТЕГИ (ЧЕРЕЗ ЗАПЯТУЮ)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="работа, финансы, отчет"
              className="w-full px-2.5 py-1.5 rounded-[4px] bg-slot border border-border-subtle text-text-primary font-mono text-base sm:text-xs focus:outline-none focus:border-accent-amber"
            />
          </div>

          {/* AI Metadata Display */}
          {editingTask.aiReasoning && (
            <div className="p-2.5 rounded-[4px] bg-slot border border-border-subtle font-mono text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-accent-amber mb-1 uppercase text-[10px]">
                <Cpu className="w-3 h-3 stroke-[1.5]" />
                ФАКТОРЫ GEMINI (SCORE: {editingTask.aiScore}/100):
              </div>
              <p className="text-text-secondary leading-relaxed font-sans">{editingTask.aiReasoning}</p>
            </div>
          )}

          {/* Sticky Actions */}
          <div className="sticky bottom-0 pt-3 pb-1 bg-surface border-t border-border-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 rounded-[4px] font-display text-xs tracking-wider uppercase text-text-muted hover:text-text-primary hover:bg-slot transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[4px] font-display font-semibold text-xs tracking-wider uppercase bg-accent-amber hover:bg-accent-amber-hover text-slot shadow-tactile-dark active:translate-y-[1px] active:shadow-none transition-all"
            >
              Сохранить изменения
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
