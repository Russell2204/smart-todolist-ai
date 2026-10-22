'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { X, Mail, Lock, User, LogIn, UserPlus, Loader2, Sparkles, Shield } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    loginUser,
    registerUser,
  } = useTaskStore();

  const [mode, setMode] = useState<'login' | 'register'>(authMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync mode with store when opened
  React.useEffect(() => {
    setMode(authMode);
    setErrorMessage('');
  }, [authMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (mode === 'login') {
      const ok = await loginUser(email, password);
      setIsLoading(false);
      if (ok) {
        setEmail('');
        setPassword('');
      }
    } else {
      const ok = await registerUser(email, password, name);
      setIsLoading(false);
      if (ok) {
        setEmail('');
        setPassword('');
        setName('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="relative p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {mode === 'login' ? 'Вход в аккаунт' : 'Создание аккаунта'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Синхронизация задач в Neon PostgreSQL
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 mt-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Регистрация
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Ваше имя
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Алексей"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email адрес *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Пароль *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Gemini API Key notice */}
          {mode === 'register' && (
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60 text-xs text-violet-800 dark:text-violet-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-violet-500" />
              <span>
                Сразу после регистрации вы укажете свой личный <strong>Google Gemini API Key</strong> для активации умной приоритезации и декомпозиции.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-violet-600/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Пожалуйста, подождите...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Войти в аккаунт</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Зарегистрироваться</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
