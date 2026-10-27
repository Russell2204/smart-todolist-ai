'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { X, Mail, Lock, User, LogIn, UserPlus, Loader2, KeyRound } from 'lucide-react';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    loginUser,
    registerUser,
    settings,
  } = useTaskStore();

  const [mode, setMode] = useState<'login' | 'register'>(authMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    setMode(authMode);
    setErrorMessage('');
  }, [authMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (settings.soundEnabled) playMechanicalClick(280, 0.02);
    triggerHaptic(12);

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

  const handleClose = () => {
    if (settings.soundEnabled) playMechanicalClick(180, 0.015);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-surface rounded-t-[12px] sm:rounded-[8px] border border-border-subtle shadow-plate max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-border-subtle bg-surface select-none flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-accent-amber shadow-glow-amber" />
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base tracking-wider uppercase text-text-primary">
                {mode === 'login' ? 'АВТОРИЗАЦИЯ // ВХОД' : 'РЕГИСТРАЦИЯ // ДОСТУП'}
              </h2>
              <p className="font-mono text-[10px] text-text-muted mt-0.5">
                Облачная синхронизация персональных задач
              </p>
            </div>
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

        {/* Mode Rocker Switch */}
        <div className="px-4 sm:px-5 pt-3">
          <div className="grid grid-cols-2 p-0.5 rounded-[4px] bg-slot border border-border-subtle font-display tracking-wider uppercase text-xs">
            <button
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-1.5 rounded-[2px] transition-all font-semibold ${
                mode === 'login'
                  ? 'bg-border-subtle text-text-primary shadow-plate border border-border-focus'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => {
                if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-1.5 rounded-[2px] transition-all font-semibold ${
                mode === 'register'
                  ? 'bg-border-subtle text-text-primary shadow-plate border border-border-focus'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Регистрация
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 text-xs overflow-y-auto">
          {errorMessage && (
            <div className="p-2.5 rounded-[4px] bg-status-danger/10 border border-status-danger/30 text-status-danger font-mono text-[11px]">
              {errorMessage}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block font-mono text-[11px] text-text-muted uppercase mb-1">
                ИМЯ ПОЛЬЗОВАТЕЛЯ
              </label>
              <div className="relative flex items-center bg-slot border border-border-subtle focus-within:border-accent-amber rounded-[4px] px-3 py-2">
                <User className="w-3.5 h-3.5 text-text-muted mr-2 stroke-[1.5]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Руслан"
                  className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base sm:text-xs font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1">
              EMAIL АДРЕС *
            </label>
            <div className="relative flex items-center bg-slot border border-border-subtle focus-within:border-accent-amber rounded-[4px] px-3 py-2">
              <Mail className="w-3.5 h-3.5 text-text-muted mr-2 stroke-[1.5]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base sm:text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1">
              ПАРОЛЬ *
            </label>
            <div className="relative flex items-center bg-slot border border-border-subtle focus-within:border-accent-amber rounded-[4px] px-3 py-2">
              <Lock className="w-3.5 h-3.5 text-text-muted mr-2 stroke-[1.5]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base sm:text-xs font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[4px] font-display font-semibold text-xs tracking-wider uppercase bg-accent-amber hover:bg-accent-amber-hover text-slot shadow-tactile-dark active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ПРОВЕРКА...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-3.5 h-3.5 stroke-[2]" />
                  <span>ВОЙТИ В СИСТЕМУ</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 stroke-[2]" />
                  <span>СОЗДАТЬ АККАУНТ</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
