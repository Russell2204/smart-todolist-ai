'use client';

import React, { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { 
  Sparkles, 
  LayoutList, 
  Grid2X2, 
  Settings, 
  Sun, 
  Moon, 
  CheckCircle,
  BrainCircuit,
  User,
  LogIn,
  LogOut,
  Key,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export function Header() {
  const { 
    tasks, 
    viewMode, 
    setViewMode, 
    setIsSettingsOpen, 
    settings, 
    updateSettings,
    tickCooldown,
    cooldownRemaining,
    currentUser,
    isAuthenticated,
    isAuthLoading,
    checkAuthStatus,
    setIsAuthModalOpen,
    setIsApiKeyModalOpen,
    logoutUser
  } = useTaskStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Check auth session on startup
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Cooldown interval timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      tickCooldown();
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining, tickCooldown]);

  // Handle theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const hasApiKey = currentUser?.hasApiKey || !!settings.apiKey;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
            <BrainCircuit className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Smart ToDoList
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                <Sparkles className="w-3 h-3 text-violet-500" />
                Gemini 2.5
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden md:block">
              Vercel + Neon Postgres + Gemini AI
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Progress Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-zinc-600 dark:text-zinc-300 font-medium">
              {completedTasks} из {totalTasks}
            </span>
            <div className="w-14 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden ml-1">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="Классический список задач"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Список</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="Матрица Эйзенхауэра 2x2"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Матрица</span>
            </button>
          </div>

          {/* API Key Status Pill */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              hasApiKey
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse'
            }`}
            title={hasApiKey ? 'Google API Key настроен' : 'Нажмите, чтобы указать свой Google Gemini API Key'}
          >
            <Key className="w-3 h-3" />
            <span>{hasApiKey ? 'API Key активен' : 'Указать API Key'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all"
            aria-label="Сменить тему"
            title="Переключить тему оформления"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all"
            aria-label="Настройки"
            title="Настройки"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Auth Button or User Menu */}
          {!isAuthLoading && (
            isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {(currentUser.name || currentUser.email)[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 animate-in fade-in zoom-in-95 text-xs">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {currentUser.name || 'Пользователь'}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsApiKeyModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Key className="w-3.5 h-3.5 text-violet-500" />
                      <span>Google API Key</span>
                      {hasApiKey ? (
                        <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Настроен</span>
                      ) : (
                        <span className="ml-auto text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Не указан</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Параметры и модель</span>
                    </button>

                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logoutUser();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Выйти из аккаунта</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true, 'login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true, 'register')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-sm shadow-violet-600/25 transition-colors"
                >
                  Регистрация
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
