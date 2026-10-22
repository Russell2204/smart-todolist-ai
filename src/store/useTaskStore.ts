import { create } from 'zustand';
import { Task, Subtask, PriorityLevel, EisenhowerQuadrant, ViewMode, SortMode } from '@/types/task';
import { 
  loadStoredTasks, 
  saveStoredTasks, 
  loadStoredSettings, 
  saveStoredSettings, 
  AppSettings, 
  INITIAL_TASKS 
} from '@/lib/storage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface TaskState {
  tasks: Task[];
  viewMode: ViewMode;
  sortMode: SortMode;
  searchQuery: string;
  filterStatus: 'all' | 'active' | 'completed';
  filterTag: string | null;
  filterPriority: PriorityLevel | 'all';
  filterQuadrant: EisenhowerQuadrant | 'all';
  
  // AI states
  isAiLoading: boolean;
  aiActionType: 'prioritizing' | 'decomposing' | 'quick-add' | null;
  activeProcessingTaskId: string | null;
  lastPrioritizedTime: number | null;
  cooldownRemaining: number;

  // Settings
  settings: AppSettings;
  isSettingsOpen: boolean;
  
  // Modals
  editingTask: Task | null;
  decomposingTaskId: string | null;
  
  // Toast notifications
  toasts: ToastMessage[];

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSortMode: (mode: SortMode) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: 'all' | 'active' | 'completed') => void;
  setFilterTag: (tag: string | null) => void;
  setFilterPriority: (priority: PriorityLevel | 'all') => void;
  setFilterQuadrant: (quadrant: EisenhowerQuadrant | 'all') => void;
  setIsSettingsOpen: (open: boolean) => void;
  setEditingTask: (task: Task | null) => void;
  setDecomposingTaskId: (id: string | null) => void;
  
  // CRUD
  addTask: (task: Partial<Task>, autoAnalyze?: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  
  // Subtasks
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  setSubtasks: (taskId: string, subtasks: Subtask[]) => void;
  
  // AI Actions
  prioritizeAllWithAI: () => Promise<void>;
  decomposeTaskWithAI: (taskId: string) => Promise<void>;
  createTaskWithSmartInput: (text: string) => Promise<void>;

  // Management
  resetToSampleData: () => void;
  clearCompleted: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Toasts
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  tickCooldown: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => {
  // Load initial data on store creation
  const initialTasks = typeof window !== 'undefined' ? loadStoredTasks() : INITIAL_TASKS;
  const initialSettings = typeof window !== 'undefined' ? loadStoredSettings() : {
    apiKey: '',
    model: 'gemini-2.5-flash',
    autoAnalyzeDefault: true,
    theme: 'system' as const,
  };

  return {
    tasks: initialTasks,
    viewMode: 'list',
    sortMode: 'aiScore',
    searchQuery: '',
    filterStatus: 'all',
    filterTag: null,
    filterPriority: 'all',
    filterQuadrant: 'all',
    
    isAiLoading: false,
    aiActionType: null,
    activeProcessingTaskId: null,
    lastPrioritizedTime: null,
    cooldownRemaining: 0,
    
    settings: initialSettings,
    isSettingsOpen: false,
    editingTask: null,
    decomposingTaskId: null,
    toasts: [],

    setViewMode: (viewMode) => set({ viewMode }),
    setSortMode: (sortMode) => set({ sortMode }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setFilterStatus: (filterStatus) => set({ filterStatus }),
    setFilterTag: (filterTag) => set({ filterTag }),
    setFilterPriority: (filterPriority) => set({ filterPriority }),
    setFilterQuadrant: (filterQuadrant) => set({ filterQuadrant }),
    setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
    setEditingTask: (editingTask) => set({ editingTask }),
    setDecomposingTaskId: (decomposingTaskId) => set({ decomposingTaskId }),

    addToast: (message, type = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { id, message, type }],
      }));

      // Auto dismiss after 4.5s
      setTimeout(() => {
        get().removeToast(id);
      }, 4500);
    },

    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    tickCooldown: () => {
      const { cooldownRemaining } = get();
      if (cooldownRemaining > 0) {
        set({ cooldownRemaining: cooldownRemaining - 1 });
      }
    },

    addTask: async (taskData, autoAnalyze = false) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title?.trim() || 'Новая задача',
        description: taskData.description?.trim(),
        createdAt: new Date().toISOString(),
        dueDate: taskData.dueDate,
        isCompleted: false,
        priority: taskData.priority || 'MEDIUM',
        quadrant: taskData.quadrant || 'SCHEDULE',
        estimatedMinutes: taskData.estimatedMinutes || 30,
        tags: taskData.tags || [],
        subtasks: taskData.subtasks || [],
        aiScore: taskData.aiScore || 50,
        aiReasoning: taskData.aiReasoning,
      };

      if (autoAnalyze && newTask.title) {
        set({ isAiLoading: true, aiActionType: 'quick-add' });
        try {
          const { settings } = get();
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (settings.apiKey) headers['x-gemini-api-key'] = settings.apiKey;

          const res = await fetch('/api/ai/quick-add', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              text: newTask.title,
              model: settings.model,
              useFallbackIfNoKey: true,
            }),
          });

          const data = await res.json();
          if (data.success && data.data) {
            const ai = data.data;
            newTask.title = ai.title || newTask.title;
            if (ai.description) newTask.description = ai.description;
            if (ai.dueDate) newTask.dueDate = ai.dueDate;
            if (ai.priority) newTask.priority = ai.priority;
            if (ai.quadrant) newTask.quadrant = ai.quadrant;
            if (ai.estimatedMinutes) newTask.estimatedMinutes = ai.estimatedMinutes;
            if (ai.tags && ai.tags.length > 0) newTask.tags = ai.tags;
            if (ai.aiScore) newTask.aiScore = ai.aiScore;
            if (ai.aiReasoning) newTask.aiReasoning = ai.aiReasoning;

            if (data.warning) {
              get().addToast(data.warning, 'warning');
            } else {
              get().addToast('Задача проанализирована и добавлена через AI!', 'success');
            }
          }
        } catch (e: any) {
          console.warn('AutoAnalyze failed during addTask:', e);
        } finally {
          set({ isAiLoading: false, aiActionType: null });
        }
      }

      set((state) => {
        const updated = [newTask, ...state.tasks];
        saveStoredTasks(updated);
        return { tasks: updated };
      });
    },

    updateTask: (id, updates) => {
      set((state) => {
        const updated = state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        );
        saveStoredTasks(updated);
        return { tasks: updated };
      });
    },

    deleteTask: (id) => {
      set((state) => {
        const updated = state.tasks.filter((task) => task.id !== id);
        saveStoredTasks(updated);
        return { tasks: updated };
      });
      get().addToast('Задача удалена', 'info');
    },

    toggleTaskComplete: (id) => {
      set((state) => {
        const updated = state.tasks.map((task) =>
          task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        );
        saveStoredTasks(updated);
        return { tasks: updated };
      });
    },

    toggleSubtask: (taskId, subtaskId) => {
      set((state) => {
        const updated = state.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const subtasks = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
          );
          return { ...task, subtasks };
        });
        saveStoredTasks(updated);
        return { tasks: updated };
      });
    },

    addSubtask: (taskId, title) => {
      if (!title.trim()) return;
      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        title: title.trim(),
        isCompleted: false,
      };
      set((state) => {
        const updated = state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, subtasks: [...task.subtasks, newSubtask] }
            : task
        );
        saveStoredTasks(updated);
        return { tasks: updated };
      });
    },

    deleteSubtask: (taskId, subtaskId) => {
      set((state) => {
        const updated = state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, subtasks: task.subtasks.filter((st) => st.id !== subtaskId) }
            : task
        );
        saveStoredTasks(updated);
        return { tasks: updated };
      });
    },

    setSubtasks: (taskId, subtasks) => {
      set((state) => {
        const updated = state.tasks.map((task) =>
          task.id === taskId ? { ...task, subtasks } : task
        );
        saveStoredTasks(updated);
        return { tasks: updated };
      });
    },

    // AI Feature 1: Mass Prioritization
    prioritizeAllWithAI: async () => {
      const { tasks, isAiLoading, cooldownRemaining, settings } = get();
      if (isAiLoading) return;

      if (cooldownRemaining > 0) {
        get().addToast(`Подождите еще ${cooldownRemaining} сек перед повторным AI анализом`, 'warning');
        return;
      }

      const activeTasks = tasks.filter((t) => !t.isCompleted);
      if (activeTasks.length === 0) {
        get().addToast('Нет активных задач для расстановки приоритетов', 'info');
        return;
      }

      set({ isAiLoading: true, aiActionType: 'prioritizing' });

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (settings.apiKey) headers['x-gemini-api-key'] = settings.apiKey;

        const res = await fetch('/api/ai/prioritize', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tasks: activeTasks,
            model: settings.model,
            useFallbackIfNoKey: true,
          }),
        });

        const data = await res.json();
        if (!res.ok && !data.data) {
          throw new Error(data.error || 'Ошибка при запросе к AI');
        }

        const prioritizedItems: Array<{
          id: string;
          priority: PriorityLevel;
          quadrant: EisenhowerQuadrant;
          estimatedMinutes: number;
          aiScore: number;
          aiReasoning: string;
        }> = data.data;

        // Apply metadata to existing tasks
        const itemMap = new Map(prioritizedItems.map((item) => [item.id, item]));

        set((state) => {
          const updated = state.tasks.map((t) => {
            const aiInfo = itemMap.get(t.id);
            if (aiInfo) {
              return {
                ...t,
                priority: aiInfo.priority,
                quadrant: aiInfo.quadrant,
                estimatedMinutes: aiInfo.estimatedMinutes,
                aiScore: aiInfo.aiScore,
                aiReasoning: aiInfo.aiReasoning,
              };
            }
            return t;
          });

          // Sort active tasks by aiScore descending
          updated.sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            return (b.aiScore || 0) - (a.aiScore || 0);
          });

          saveStoredTasks(updated);
          return {
            tasks: updated,
            sortMode: 'aiScore',
            lastPrioritizedTime: Date.now(),
            cooldownRemaining: 30, // 30-second rate-limit cooldown
          };
        });

        if (data.warning) {
          get().addToast(data.warning, 'warning');
        } else {
          get().addToast(`Gemini успешно расставил приоритеты для ${activeTasks.length} задач!`, 'success');
        }
      } catch (err: any) {
        console.error('Failed to prioritize with AI:', err);
        get().addToast(err?.message || 'Не удалось применить AI приоритезацию', 'error');
      } finally {
        set({ isAiLoading: false, aiActionType: null });
      }
    },

    // AI Feature 2: Task Decomposition
    decomposeTaskWithAI: async (taskId) => {
      const { tasks, settings } = get();
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      set({
        isAiLoading: true,
        aiActionType: 'decomposing',
        activeProcessingTaskId: taskId,
      });

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (settings.apiKey) headers['x-gemini-api-key'] = settings.apiKey;

        const res = await fetch('/api/ai/decompose', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            model: settings.model,
            useFallbackIfNoKey: true,
          }),
        });

        const data = await res.json();
        if (!res.ok && !data.data) {
          throw new Error(data.error || 'Ошибка при декомпозиции');
        }

        const generatedSubtasks: Subtask[] = (data.data?.subtasks || []).map((st: { title: string }) => ({
          id: crypto.randomUUID(),
          title: st.title,
          isCompleted: false,
        }));

        set((state) => {
          const updated = state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, ...generatedSubtasks] }
              : t
          );
          saveStoredTasks(updated);
          return { tasks: updated };
        });

        if (data.warning) {
          get().addToast(data.warning, 'warning');
        } else {
          get().addToast(`Сгенерировано ${generatedSubtasks.length} подзадач!`, 'success');
        }
      } catch (err: any) {
        console.error('Failed to decompose with AI:', err);
        get().addToast(err?.message || 'Не удалось декомпозировать задачу', 'error');
      } finally {
        set({
          isAiLoading: false,
          aiActionType: null,
          activeProcessingTaskId: null,
        });
      }
    },

    // AI Feature 3: Smart NLP Input Creation
    createTaskWithSmartInput: async (rawText) => {
      if (!rawText.trim()) return;

      set({ isAiLoading: true, aiActionType: 'quick-add' });
      try {
        const { settings } = get();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (settings.apiKey) headers['x-gemini-api-key'] = settings.apiKey;

        const res = await fetch('/api/ai/quick-add', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: rawText,
            model: settings.model,
            useFallbackIfNoKey: true,
          }),
        });

        const data = await res.json();
        const parsed = data.data;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: parsed?.title || rawText.trim(),
          description: parsed?.description || '',
          createdAt: new Date().toISOString(),
          dueDate: parsed?.dueDate || undefined,
          isCompleted: false,
          priority: parsed?.priority || 'MEDIUM',
          quadrant: parsed?.quadrant || 'SCHEDULE',
          estimatedMinutes: parsed?.estimatedMinutes || 30,
          tags: parsed?.tags || [],
          subtasks: [],
          aiScore: parsed?.aiScore || 60,
          aiReasoning: parsed?.aiReasoning || 'Автоматически проанализировано при создании.',
        };

        set((state) => {
          const updated = [newTask, ...state.tasks];
          saveStoredTasks(updated);
          return { tasks: updated };
        });

        if (data.warning) {
          get().addToast(data.warning, 'warning');
        } else {
          get().addToast(`Задача "${newTask.title}" добавлена и проанализирована!`, 'success');
        }
      } catch (err: any) {
        console.error('Smart input failed:', err);
        // Fallback to normal add
        get().addTask({ title: rawText }, false);
      } finally {
        set({ isAiLoading: false, aiActionType: null });
      }
    },

    resetToSampleData: () => {
      saveStoredTasks(INITIAL_TASKS);
      set({ tasks: INITIAL_TASKS });
      get().addToast('Восстановлены демонстрационные задачи', 'info');
    },

    clearCompleted: () => {
      set((state) => {
        const updated = state.tasks.filter((t) => !t.isCompleted);
        saveStoredTasks(updated);
        return { tasks: updated };
      });
      get().addToast('Завершенные задачи очищены', 'info');
    },

    updateSettings: (newSettings) => {
      set((state) => {
        const updated = { ...state.settings, ...newSettings };
        saveStoredSettings(updated);
        return { settings: updated };
      });
      get().addToast('Настройки сохранены', 'success');
    },
  };
});
