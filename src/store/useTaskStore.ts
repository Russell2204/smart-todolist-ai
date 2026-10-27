import { create } from 'zustand';
import { Task, Subtask, PriorityLevel, EisenhowerQuadrant, ViewMode, SortMode } from '@/types/task';
import { 
  loadStoredTasks, 
  saveStoredTasks, 
  loadStoredSettings, 
  saveStoredSettings, 
  AppSettings, 
  INITIAL_TASKS,
  DEFAULT_SETTINGS
} from '@/lib/storage';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  hasApiKey: boolean;
  apiKey?: string;
  geminiModel?: string;
}

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
  
  // Auth state
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  isApiKeyModalOpen: boolean;

  // AI states
  isAiLoading: boolean;
  aiActionType: 'prioritizing' | 'decomposing' | 'quick-add' | null;
  activeProcessingTaskId: string | null;
  lastPrioritizedTime: number | null;
  cooldownRemaining: number;

  // Settings & Modals
  settings: AppSettings;
  isSettingsOpen: boolean;
  editingTask: Task | null;
  decomposingTaskId: string | null;
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
  setIsAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => void;
  setIsApiKeyModalOpen: (open: boolean) => void;
  setEditingTask: (task: Task | null) => void;
  setDecomposingTaskId: (id: string | null) => void;
  
  // Auth actions
  checkAuthStatus: () => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<boolean>;
  registerUser: (email: string, pass: string, name?: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  saveUserApiKey: (apiKey: string, model?: string) => Promise<boolean>;
  loadServerTasks: () => Promise<void>;

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
  toggleSound: () => void;
  toggleReducedMotion: () => void;
  
  // Toasts
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  tickCooldown: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => {
  const initialTasks = typeof window !== 'undefined' ? loadStoredTasks() : INITIAL_TASKS;
  const initialSettings = typeof window !== 'undefined' ? loadStoredSettings() : DEFAULT_SETTINGS;

  return {
    tasks: initialTasks,
    viewMode: 'list',
    sortMode: 'aiScore',
    searchQuery: '',
    filterStatus: 'all',
    filterTag: null,
    filterPriority: 'all',
    filterQuadrant: 'all',
    
    currentUser: null,
    isAuthenticated: false,
    isAuthLoading: true,
    isAuthModalOpen: false,
    authMode: 'login',
    isApiKeyModalOpen: false,

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
    setIsAuthModalOpen: (isAuthModalOpen, mode = 'login') => set({ isAuthModalOpen, authMode: mode }),
    setIsApiKeyModalOpen: (isApiKeyModalOpen) => set({ isApiKeyModalOpen }),
    setEditingTask: (editingTask) => set({ editingTask }),
    setDecomposingTaskId: (decomposingTaskId) => set({ decomposingTaskId }),

    addToast: (message, type = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { id, message, type }],
      }));

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

    // Check user session
    checkAuthStatus: async () => {
      set({ isAuthLoading: true });
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          set({
            currentUser: data.user,
            isAuthenticated: true,
            settings: {
              ...get().settings,
              apiKey: data.user.apiKey || get().settings.apiKey,
              model: data.user.geminiModel || get().settings.model,
            }
          });
          // Load tasks from Neon DB for this user
          await get().loadServerTasks();

          // If user has no API key set yet, prompt them gently
          if (!data.user.hasApiKey && !get().settings.apiKey) {
            set({ isApiKeyModalOpen: true });
          }
        } else {
          set({ currentUser: null, isAuthenticated: false });
        }
      } catch (e) {
        console.warn('Auth check error:', e);
      } finally {
        set({ isAuthLoading: false });
      }
    },

    loginUser: async (email, password) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          get().addToast(data.error || 'Ошибка входа', 'error');
          return false;
        }

        set({
          currentUser: data.user,
          isAuthenticated: true,
          isAuthModalOpen: false,
          settings: {
            ...get().settings,
            apiKey: data.user.apiKey || get().settings.apiKey,
            model: data.user.geminiModel || get().settings.model,
          }
        });

        get().addToast(`С возвращением, ${data.user.name || data.user.email}!`, 'success');
        await get().loadServerTasks();

        if (!data.user.hasApiKey) {
          set({ isApiKeyModalOpen: true });
        }
        return true;
      } catch (err: any) {
        get().addToast(err?.message || 'Ошибка сети', 'error');
        return false;
      }
    },

    registerUser: async (email, password, name) => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();
        if (!res.ok) {
          get().addToast(data.error || 'Ошибка регистрации', 'error');
          return false;
        }

        set({
          currentUser: data.user,
          isAuthenticated: true,
          isAuthModalOpen: false,
          isApiKeyModalOpen: true, // Prompt new user to set their Gemini API key!
        });

        get().addToast('Регистрация успешна! Добро пожаловать!', 'success');
        await get().loadServerTasks();
        return true;
      } catch (err: any) {
        get().addToast(err?.message || 'Ошибка регистрации', 'error');
        return false;
      }
    },

    logoutUser: async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({
          currentUser: null,
          isAuthenticated: false,
          tasks: INITIAL_TASKS,
        });
        saveStoredTasks(INITIAL_TASKS);
        get().addToast('Вы вышли из учетной записи', 'info');
      } catch (e) {
        console.error('Logout error:', e);
      }
    },

    saveUserApiKey: async (apiKey, model = 'gemini-2.5-flash') => {
      const trimmed = apiKey.trim();
      try {
        const res = await fetch('/api/auth/key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: trimmed, model, validate: true }),
        });

        const data = await res.json();
        if (!res.ok) {
          get().addToast(data.error || 'Ошибка проверки ключа', 'error');
          return false;
        }

        set((state) => ({
          currentUser: state.currentUser ? {
            ...state.currentUser,
            hasApiKey: !!trimmed,
            apiKey: trimmed,
            geminiModel: model,
          } : null,
          settings: {
            ...state.settings,
            apiKey: trimmed,
            model,
          },
          isApiKeyModalOpen: false,
        }));

        saveStoredSettings({
          ...get().settings,
          apiKey: trimmed,
          model,
        });

        get().addToast(data.message || 'API-ключ успешно сохранен в базе Neon!', 'success');
        return true;
      } catch (e: any) {
        get().addToast(e?.message || 'Ошибка сохранения ключа', 'error');
        return false;
      }
    },

    loadServerTasks: async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        if (data.authenticated && Array.isArray(data.tasks)) {
          set({ tasks: data.tasks });
          saveStoredTasks(data.tasks);
        }
      } catch (e) {
        console.warn('Failed to load server tasks:', e);
      }
    },

    addTask: async (taskData, autoAnalyze = false) => {
      const { isAuthenticated, currentUser, settings } = get();
      const apiKeyToUse = currentUser?.apiKey || settings.apiKey;

      if (isAuthenticated) {
        try {
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(apiKeyToUse ? { 'x-gemini-api-key': apiKeyToUse } : {})
            },
            body: JSON.stringify({
              ...taskData,
              autoAnalyze,
            }),
          });
          const created = await res.json();
          if (res.ok && created.id) {
            set((state) => {
              const updated = [created, ...state.tasks];
              saveStoredTasks(updated);
              return { tasks: updated };
            });
            get().addToast('Задача успешно добавлена в базу данных Neon', 'success');
            return;
          }
        } catch (e) {
          console.warn('Server task add failed, fallback to local:', e);
        }
      }

      // Local / Offline fallback
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

      set((state) => {
        const updated = [newTask, ...state.tasks];
        saveStoredTasks(updated);
        return { tasks: updated };
      });
    },

    updateTask: (id, updates) => {
      const { isAuthenticated } = get();

      set((state) => {
        const updated = state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        );
        saveStoredTasks(updated);
        return { tasks: updated };
      });

      if (isAuthenticated) {
        fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }).catch((e) => console.warn('PATCH sync error:', e));
      }
    },

    deleteTask: (id) => {
      const { isAuthenticated } = get();

      set((state) => {
        const updated = state.tasks.filter((task) => task.id !== id);
        saveStoredTasks(updated);
        return { tasks: updated };
      });
      get().addToast('Задача удалена', 'info');

      if (isAuthenticated) {
        fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
        }).catch((e) => console.warn('DELETE sync error:', e));
      }
    },

    toggleTaskComplete: (id) => {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;
      const nextCompleted = !task.isCompleted;
      get().updateTask(id, { isCompleted: nextCompleted });
    },

    toggleSubtask: (taskId, subtaskId) => {
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
      );
      get().updateTask(taskId, { subtasks: updatedSubtasks });
    },

    addSubtask: (taskId, title) => {
      if (!title.trim()) return;
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        title: title.trim(),
        isCompleted: false,
      };
      get().updateTask(taskId, { subtasks: [...task.subtasks, newSubtask] });
    },

    deleteSubtask: (taskId, subtaskId) => {
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) return;

      get().updateTask(taskId, {
        subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
      });
    },

    setSubtasks: (taskId, subtasks) => {
      get().updateTask(taskId, { subtasks });
    },

    prioritizeAllWithAI: async () => {
      const { tasks, isAiLoading, cooldownRemaining, settings, currentUser } = get();
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

      const apiKeyToUse = currentUser?.apiKey || settings.apiKey;
      const modelToUse = currentUser?.geminiModel || settings.model;

      if (!apiKeyToUse && (!currentUser || !currentUser.hasApiKey)) {
        set({ isApiKeyModalOpen: true });
        get().addToast('Пожалуйста, укажите ваш Google API Key для AI-приоритезации', 'warning');
      }

      set({ isAiLoading: true, aiActionType: 'prioritizing' });

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKeyToUse) headers['x-gemini-api-key'] = apiKeyToUse;

        const res = await fetch('/api/ai/prioritize', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tasks: activeTasks,
            model: modelToUse,
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

          updated.sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            return (b.aiScore || 0) - (a.aiScore || 0);
          });

          saveStoredTasks(updated);
          return {
            tasks: updated,
            sortMode: 'aiScore',
            lastPrioritizedTime: Date.now(),
            cooldownRemaining: 30,
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

    decomposeTaskWithAI: async (taskId) => {
      const { tasks, settings, currentUser } = get();
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const apiKeyToUse = currentUser?.apiKey || settings.apiKey;
      const modelToUse = currentUser?.geminiModel || settings.model;

      set({
        isAiLoading: true,
        aiActionType: 'decomposing',
        activeProcessingTaskId: taskId,
      });

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKeyToUse) headers['x-gemini-api-key'] = apiKeyToUse;

        const res = await fetch('/api/ai/decompose', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            model: modelToUse,
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

        get().updateTask(taskId, {
          subtasks: [...task.subtasks, ...generatedSubtasks],
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

    createTaskWithSmartInput: async (rawText) => {
      if (!rawText.trim()) return;

      const { settings, currentUser } = get();
      const apiKeyToUse = currentUser?.apiKey || settings.apiKey;
      const modelToUse = currentUser?.geminiModel || settings.model;

      set({ isAiLoading: true, aiActionType: 'quick-add' });
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKeyToUse) headers['x-gemini-api-key'] = apiKeyToUse;

        const res = await fetch('/api/ai/quick-add', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: rawText,
            model: modelToUse,
            useFallbackIfNoKey: true,
          }),
        });

        const data = await res.json();
        const parsed = data.data;

        await get().addTask(
          {
            title: parsed?.title || rawText.trim(),
            description: parsed?.description || '',
            dueDate: parsed?.dueDate || undefined,
            priority: parsed?.priority || 'MEDIUM',
            quadrant: parsed?.quadrant || 'SCHEDULE',
            estimatedMinutes: parsed?.estimatedMinutes || 30,
            tags: parsed?.tags || [],
            aiScore: parsed?.aiScore || 60,
            aiReasoning: parsed?.aiReasoning || 'Автоматически проанализировано при создании.',
          },
          false
        );

        if (data.warning) {
          get().addToast(data.warning, 'warning');
        } else {
          get().addToast(`Задача "${parsed?.title || rawText}" добавлена и проанализирована!`, 'success');
        }
      } catch (err: any) {
        console.error('Smart input failed:', err);
        await get().addTask({ title: rawText }, false);
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
      const { tasks, isAuthenticated } = get();
      const completed = tasks.filter((t) => t.isCompleted);
      const remaining = tasks.filter((t) => !t.isCompleted);

      set({ tasks: remaining });
      saveStoredTasks(remaining);
      get().addToast('Завершенные задачи очищены', 'info');

      if (isAuthenticated) {
        completed.forEach((t) => {
          fetch(`/api/tasks/${t.id}`, { method: 'DELETE' }).catch(() => {});
        });
      }
    },

    updateSettings: (newSettings) => {
      set((state) => {
        const updated = { ...state.settings, ...newSettings };
        saveStoredSettings(updated);
        return { settings: updated };
      });
      get().addToast('Настройки сохранены', 'success');
    },

    toggleSound: () => {
      set((state) => {
        const updated = { ...state.settings, soundEnabled: !state.settings.soundEnabled };
        saveStoredSettings(updated);
        return { settings: updated };
      });
    },

    toggleReducedMotion: () => {
      set((state) => {
        const updated = { ...state.settings, reducedMotion: !state.settings.reducedMotion };
        saveStoredSettings(updated);
        return { settings: updated };
      });
    },
  };
});
