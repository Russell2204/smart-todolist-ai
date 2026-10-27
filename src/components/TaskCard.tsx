'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { useTaskStore } from '@/store/useTaskStore';
import { 
  PRIORITY_CONFIG, 
  QUADRANT_CONFIG, 
  formatDueDate, 
  formatEstimatedTime 
} from '@/lib/utils';
import { 
  Check, 
  Clock, 
  Cpu, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Loader2,
  Info
} from 'lucide-react';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const {
    toggleTaskComplete,
    deleteTask,
    setEditingTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    decomposeTaskWithAI,
    isAiLoading,
    aiActionType,
    activeProcessingTaskId,
    settings,
  } = useTaskStore();

  const [isSubtasksOpen, setIsSubtasksOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAiReasoning, setShowAiReasoning] = useState(false);

  const isPrioritizing = isAiLoading && aiActionType === 'prioritizing';
  const isDecomposing = isAiLoading && aiActionType === 'decomposing' && activeProcessingTaskId === task.id;

  const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
  const quadrantStyle = task.quadrant ? QUADRANT_CONFIG[task.quadrant] : null;
  const dueDateInfo = formatDueDate(task.dueDate);

  const completedSubtasks = task.subtasks.filter((st) => st.isCompleted).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleToggleComplete = () => {
    if (settings.soundEnabled) playMechanicalClick(task.isCompleted ? 180 : 320, 0.02);
    triggerHaptic(12);
    toggleTaskComplete(task.id);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    if (settings.soundEnabled) playMechanicalClick(240, 0.015);
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const priorityColors: Record<string, { pip: string; border: string; text: string }> = {
    CRITICAL: { pip: 'bg-status-danger', border: 'border-status-danger/40', text: 'text-status-danger' },
    HIGH: { pip: 'bg-accent-amber', border: 'border-accent-amber/40', text: 'text-accent-amber' },
    MEDIUM: { pip: 'bg-status-info', border: 'border-status-info/40', text: 'text-status-info' },
    LOW: { pip: 'bg-text-muted', border: 'border-border-subtle', text: 'text-text-muted' },
  };
  const pColor = priorityColors[task.priority] || priorityColors.MEDIUM;

  return (
    <article
      className={`relative group rounded-[6px] border transition-all duration-150 ${
        task.isCompleted
          ? 'bg-slot/60 border-border-subtle/50 opacity-60'
          : 'bg-surface border-border-subtle hover:border-border-focus hover:border-t-[#404552] shadow-plate'
      } ${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-3.5'} overflow-hidden`}
    >
      {/* Laser progress line during AI prioritization */}
      {isPrioritizing && !task.isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-amber animate-laser z-20 shadow-glow-amber" />
      )}

      {/* Main Row */}
      <div className="flex items-start gap-2.5 sm:gap-3">
        
        {/* Mechanical Checkbox (44px touch target) */}
        <div className="shrink-0 -m-2 p-2">
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`w-[18px] h-[18px] rounded-[3px] border flex items-center justify-center transition-all ${
              task.isCompleted
                ? 'bg-status-success border-status-success text-slot shadow-glow-green'
                : 'bg-slot border-border-focus hover:border-accent-amber text-transparent'
            }`}
            aria-label={task.isCompleted ? 'Отметить как незавершенную' : 'Отметить как выполненную'}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </button>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[11px] font-mono select-none">
            
            {/* Priority Indicator */}
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border ${pColor.border} bg-slot ${pColor.text} text-[10px] font-bold tracking-wider`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pColor.pip}`} />
              {task.priority}
            </span>

            {/* Quadrant Badge */}
            {task.quadrant && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] border border-border-subtle bg-slot text-text-secondary text-[10px]">
                {task.quadrant === 'DO_FIRST' ? 'Q1 // ФОКУС' :
                 task.quadrant === 'SCHEDULE' ? 'Q2 // ПЛАН' :
                 task.quadrant === 'DELEGATE' ? 'Q3 // ПОРУЧИТЬ' : 'Q4 // СБРОС'}
              </span>
            )}

            {/* AI Score Badge */}
            {typeof task.aiScore === 'number' && !task.isCompleted && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border border-border-amberDim bg-slot text-accent-amber text-[10px]"
                title={`Индекс приоритета Gemini: ${task.aiScore}/100`}
              >
                SCORE: {task.aiScore}
              </span>
            )}

            {/* Estimated Time Badge */}
            {task.estimatedMinutes ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border border-border-subtle bg-slot text-text-muted text-[10px]">
                <Clock className="w-2.5 h-2.5 stroke-[1.5]" />
                {formatEstimatedTime(task.estimatedMinutes)}
              </span>
            ) : null}

            {/* Due Date Badge */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border text-[10px] ${
                  dueDateInfo.isOverdue
                    ? 'border-status-danger/40 bg-slot text-status-danger'
                    : dueDateInfo.isToday
                    ? 'border-accent-amber/40 bg-slot text-accent-amber'
                    : 'border-border-subtle bg-slot text-text-muted'
                }`}
              >
                <Calendar className="w-2.5 h-2.5 stroke-[1.5]" />
                {dueDateInfo.text}
              </span>
            )}

            {/* AI Reasoning Popover Toggle */}
            {task.aiReasoning && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAiReasoning(!showAiReasoning)}
                  className="p-0.5 rounded-[2px] text-text-muted hover:text-accent-amber transition-colors"
                  title="Обоснование AI"
                  aria-label="Обоснование AI"
                >
                  <Info className="w-3 h-3 stroke-[1.5]" />
                </button>

                {showAiReasoning && (
                  <div className="absolute left-0 bottom-full mb-1.5 z-30 w-64 p-2.5 rounded-[4px] bg-slot border border-border-focus text-text-secondary text-xs shadow-plate">
                    <p className="font-mono text-[10px] text-accent-amber uppercase mb-1">
                      ФАКТОРЫ GEMINI AI:
                    </p>
                    <p className="leading-relaxed font-sans text-text-primary text-[11px]">{task.aiReasoning}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-sm sm:text-[15px] font-sans font-medium text-text-primary leading-snug break-words ${
              task.isCompleted ? 'line-through text-text-muted' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p
              className={`text-xs text-text-secondary mt-1 leading-relaxed break-words font-sans ${
                task.isCompleted ? 'line-through opacity-60' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] font-mono text-[10px] text-text-muted bg-slot border border-border-subtle"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Subtasks Section */}
          <div className="mt-2.5 pt-2 border-t border-border-subtle/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              
              {/* Toggle Subtasks */}
              <button
                type="button"
                onClick={() => {
                  if (settings.soundEnabled) playMechanicalClick(160, 0.015);
                  setIsSubtasksOpen(!isSubtasksOpen);
                }}
                className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary hover:text-text-primary transition-colors"
              >
                {isSubtasksOpen ? (
                  <ChevronDown className="w-3 h-3 text-text-muted stroke-[1.5]" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-text-muted stroke-[1.5]" />
                )}
                <span>
                  ШАГИ {totalSubtasks > 0 && `[${completedSubtasks}/${totalSubtasks}]`}
                </span>
                {totalSubtasks > 0 && (
                  <div className="w-10 h-1 rounded-[1px] bg-slot overflow-hidden ml-1 border border-border-subtle">
                    <div
                      className="h-full bg-status-success transition-all duration-300"
                      style={{ width: `${subtaskPercentage}%` }}
                    />
                  </div>
                )}
              </button>

              {/* Decompose button */}
              {!task.isCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    if (settings.soundEnabled) playMechanicalClick(220, 0.02);
                    decomposeTaskWithAI(task.id);
                  }}
                  disabled={isDecomposing || isAiLoading}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] font-display font-semibold text-[10px] tracking-wider uppercase border border-border-subtle bg-slot text-text-secondary hover:text-text-primary hover:border-border-focus transition-all disabled:opacity-50"
                  title="Gemini разобьет сложную задачу на 3-5 конкретных подзадач"
                >
                  {isDecomposing ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-accent-amber" />
                      <span>РАСЧЕТ...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-2.5 h-2.5 stroke-[1.5] text-accent-amber" />
                      <span>{totalSubtasks === 0 ? 'ШАГИ С AI' : '+ AI ШАГИ'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Subtasks Accordion */}
            {isSubtasksOpen && (
              <div className="mt-2 pl-2 space-y-1 text-xs border-l border-border-subtle">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 py-1 px-1.5 rounded-[3px] hover:bg-slot/60 group/st"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.isCompleted}
                        onChange={() => {
                          if (settings.soundEnabled) playMechanicalClick(st.isCompleted ? 160 : 280, 0.015);
                          triggerHaptic(8);
                          toggleSubtask(task.id, st.id);
                        }}
                        className="rounded-[2px] bg-slot border-border-focus text-accent-amber focus:ring-0 w-3.5 h-3.5"
                      />
                      <span
                        className={`truncate font-sans text-xs ${
                          st.isCompleted
                            ? 'line-through text-text-muted'
                            : 'text-text-primary'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (settings.soundEnabled) playMechanicalClick(140, 0.015);
                        deleteSubtask(task.id, st.id);
                      }}
                      className="opacity-60 sm:opacity-0 group-hover/st:opacity-100 text-text-muted hover:text-status-danger p-1 transition-opacity"
                      aria-label="Удалить шаг"
                    >
                      <Trash2 className="w-3 h-3 stroke-[1.5]" />
                    </button>
                  </div>
                ))}

                {/* Inline add subtask form */}
                <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="+ Добавить шаг вручную..."
                    className="flex-1 px-2 py-1 rounded-[3px] bg-slot border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-amber font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskTitle.trim()}
                    className="p-1 rounded-[3px] bg-border-subtle hover:bg-border-focus text-text-primary disabled:opacity-40 transition-colors"
                    aria-label="Сохранить шаг"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Card Right Actions (Edit / Delete) */}
        <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              if (settings.soundEnabled) playMechanicalClick(180, 0.015);
              setEditingTask(task);
            }}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-slot rounded-[3px] transition-colors"
            title="Редактировать задачу"
            aria-label="Редактировать"
          >
            <Edit3 className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (settings.soundEnabled) playMechanicalClick(140, 0.02);
              triggerHaptic(10);
              deleteTask(task.id);
            }}
            className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger/10 rounded-[3px] transition-colors"
            title="Удалить задачу"
            aria-label="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </article>
  );
}
