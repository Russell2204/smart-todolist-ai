'use client';

import React, { useState } from 'react';
import { Task, Subtask } from '@/types/task';
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
  Lightbulb, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Loader2, 
  CheckSquare, 
  Square, 
  Tag as TagIcon 
} from 'lucide-react';

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

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div
      className={`relative group rounded-2xl border transition-all duration-300 ${
        task.isCompleted
          ? 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/60 opacity-65'
          : 'bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md'
      } ${compact ? 'p-3' : 'p-4 sm:p-5'} overflow-hidden`}
    >
      {/* Shimmer glowing skeleton overlay during AI prioritization */}
      {isPrioritizing && !task.isCompleted && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-violet-500/10 dark:via-violet-400/15 to-transparent animate-shimmer bg-[length:200%_100%]" />
      )}

      {/* Main card header & check */}
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          onClick={() => toggleTaskComplete(task.id)}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
            task.isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-500 dark:hover:border-violet-400 text-transparent hover:text-violet-500/30'
          }`}
          aria-label={task.isCompleted ? 'Отметить как незавершенную' : 'Отметить как выполненную'}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              {priorityStyle.label}
            </span>

            {/* AI Score Badge */}
            {typeof task.aiScore === 'number' && !task.isCompleted && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"
                title={`Индекс приоритетности Gemini: ${task.aiScore}/100`}
              >
                <Sparkles className="w-2.5 h-2.5 text-violet-500" />
                Score: {task.aiScore}
              </span>
            )}

            {/* Estimated Time Badge */}
            {task.estimatedMinutes ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                <Clock className="w-2.5 h-2.5 text-zinc-400" />
                {formatEstimatedTime(task.estimatedMinutes)}
              </span>
            ) : null}

            {/* Due Date Badge */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  dueDateInfo.isOverdue
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                    : dueDateInfo.isToday
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Calendar className="w-2.5 h-2.5" />
                {dueDateInfo.text}
              </span>
            )}

            {/* Eisenhower Quadrant Badge (if set) */}
            {quadrantStyle && (
              <span
                className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${quadrantStyle.headerBg} ${quadrantStyle.borderColor}`}
              >
                {quadrantStyle.subtitle}
              </span>
            )}

            {/* AI Reasoning Tooltip Button */}
            {task.aiReasoning && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAiReasoning(!showAiReasoning)}
                  onMouseEnter={() => setShowAiReasoning(true)}
                  onMouseLeave={() => setShowAiReasoning(false)}
                  className="p-1 rounded-md text-amber-500 hover:bg-amber-500/10 transition-colors"
                  title="Почему Gemini выбрал этот приоритет?"
                  aria-label="Обоснование AI"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                </button>

                {/* Popover / Tooltip */}
                {showAiReasoning && (
                  <div className="absolute left-0 bottom-full mb-2 z-30 w-64 p-3 rounded-xl bg-zinc-900 text-white text-xs shadow-xl border border-zinc-700 backdrop-blur-md animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Обоснование Gemini AI:
                    </div>
                    <p className="text-zinc-200 leading-relaxed">{task.aiReasoning}</p>
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-zinc-900" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug break-words ${
              task.isCompleted ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p
              className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed break-words ${
                task.isCompleted ? 'line-through opacity-70' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Subtasks Summary & Controls */}
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Toggle subtasks accordion */}
              <button
                type="button"
                onClick={() => setIsSubtasksOpen(!isSubtasksOpen)}
                className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                {isSubtasksOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>
                  Подзадачи {totalSubtasks > 0 && `(${completedSubtasks}/${totalSubtasks})`}
                </span>
                {totalSubtasks > 0 && (
                  <div className="w-12 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden ml-1">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${subtaskPercentage}%` }}
                    />
                  </div>
                )}
              </button>

              {/* Decompose with AI button */}
              {!task.isCompleted && (
                <button
                  type="button"
                  onClick={() => decomposeTaskWithAI(task.id)}
                  disabled={isDecomposing || isAiLoading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 transition-all disabled:opacity-50"
                  title="Gemini разобьет сложную задачу на 3-5 конкретных подзадач"
                >
                  {isDecomposing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                      <span>Генерация шагов...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-violet-500" />
                      <span>{totalSubtasks === 0 ? 'Разбить на шаги' : '+ AI шаги'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Subtasks Accordion Content */}
            {isSubtasksOpen && (
              <div className="mt-2.5 pl-2 space-y-1.5 text-xs animate-in fade-in duration-200">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 group/st py-1 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={st.isCompleted}
                        onChange={() => toggleSubtask(task.id, st.id)}
                        className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                      />
                      <span
                        className={`truncate ${
                          st.isCompleted
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteSubtask(task.id, st.id)}
                      className="opacity-0 group-hover/st:opacity-100 text-zinc-400 hover:text-rose-500 p-1 transition-opacity"
                      aria-label="Удалить подзадачу"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Inline add subtask form */}
                <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Добавить шаг вручную..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskTitle.trim()}
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Card Right Actions (Edit / Delete) */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditingTask(task)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Редактировать"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
