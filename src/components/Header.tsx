'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { 
  List, 
  LayoutGrid, 
  Settings2, 
  KeyRound, 
  User, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Zap, 
  ZapOff,
  ChevronDown 
} from 'lucide-react';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

export function Header() {
  const { 
    viewMode, 
    setViewMode, 
    setIsSettingsOpen, 
    settings, 
    currentUser,
    isAuthenticated,
    isAuthLoading,
    checkAuthStatus,
    setIsAuthModalOpen,
    setIsApiKeyModalOpen,
    logoutUser,
    toggleSound,
    toggleReducedMotion,
  } = useTaskStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check auth session on startup
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync reducedMotion with HTML class
  useEffect(() => {
    if (settings.reducedMotion) {
      document.documentElement.classList.add('no-motion');
    } else {
      document.documentElement.classList.remove('no-motion');
    }
  }, [settings.reducedMotion]);

  const hasApiKey = currentUser?.hasApiKey || !!settings.apiKey;

  const handleModeSwitch = (mode: 'list' | 'matrix') => {
    if (settings.soundEnabled) playMechanicalClick(240, 0.02);
    triggerHaptic(8);
    setViewMode(mode);
  };

  const handleSoundToggle = () => {
    if (!settings.soundEnabled) playMechanicalClick(320, 0.02);
    triggerHaptic(8);
    toggleSound();
  };

  const handleMotionToggle = () => {
    if (settings.soundEnabled) playMechanicalClick(200, 0.02);
    triggerHaptic(8);
    toggleReducedMotion();
  };

  return (
    <header className="sticky top-0 z-40 h-12 bg-surface/95 backdrop-blur-md border-b border-border-subtle transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-full flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-accent-amber shadow-glow-amber" />
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-sm sm:text-base tracking-wider text-text-primary uppercase">
              Smart·Todo
            </span>
            <span className="font-mono text-[10px] text-text-muted px-1 py-0.5 rounded-[2px] border border-border-subtle bg-slot hidden xs:inline">
              AI 2.5
            </span>
          </div>
        </div>

        {/* Center: Tactile Rocker Switch (Mode Toggle) */}
        <nav 
          aria-label="Режимы отображения"
          className="flex items-center p-0.5 rounded-[6px] bg-slot border border-border-subtle shadow-sunken"
        >
          <button
            type="button"
            onClick={() => handleModeSwitch('list')}
            aria-pressed={viewMode === 'list'}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-[4px] text-xs font-display tracking-wider uppercase transition-all ${
              viewMode === 'list'
                ? 'bg-border-subtle text-text-primary font-semibold shadow-plate border border-border-focus'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
            }`}
            title="Режим списка задач"
          >
            <List className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Список</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('matrix')}
            aria-pressed={viewMode === 'matrix'}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-[4px] text-xs font-display tracking-wider uppercase transition-all ${
              viewMode === 'matrix'
                ? 'bg-border-subtle text-text-primary font-semibold shadow-plate border border-border-focus'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
            }`}
            title="Матрица Эйзенхауэра"
          >
            <LayoutGrid className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Матрица</span>
          </button>
        </nav>

        {/* Right Section: System Status & User Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Key Status LED Pill */}
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] font-mono text-[11px] border transition-all ${
              hasApiKey
                ? 'bg-slot text-text-secondary border-border-subtle hover:border-border-focus'
                : 'bg-slot text-accent-amber border-border-amberDim hover:border-accent-amber'
            }`}
            title={hasApiKey ? 'Google Gemini API ключ активен' : 'Требуется привязать Google Gemini API ключ'}
          >
            <span 
              className={`w-1.5 h-1.5 rounded-full ${
                hasApiKey 
                  ? 'bg-status-success shadow-glow-green' 
                  : 'bg-accent-amber animate-pulse shadow-glow-amber'
              }`} 
            />
            <span>{hasApiKey ? 'KEY READY' : 'SET KEY'}</span>
          </button>

          {/* Sound Toggle [ 🔊 / 🔇 ] */}
          <button
            type="button"
            onClick={handleSoundToggle}
            className="w-8 h-8 rounded-[4px] flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 transition-colors"
            title={settings.soundEnabled ? 'Тактильный звук: ВКЛ (нажмите для выкл)' : 'Тактильный звук: ВЫКЛ'}
            aria-label="Переключить тактильный звук"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 stroke-[1.5] text-accent-amber" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 stroke-[1.5] text-text-muted" />
            )}
          </button>

          {/* Reduced Motion Toggle [ ⚡ ] */}
          <button
            type="button"
            onClick={handleMotionToggle}
            className="w-8 h-8 rounded-[4px] flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 transition-colors"
            title={settings.reducedMotion ? 'Анимации: ВЫКЛ (Zero-Latency режим активен)' : 'Анимации: ВКЛ'}
            aria-label="Режим отключения анимаций"
          >
            {settings.reducedMotion ? (
              <ZapOff className="w-3.5 h-3.5 stroke-[1.5] text-accent-amber" />
            ) : (
              <Zap className="w-3.5 h-3.5 stroke-[1.5] text-text-muted" />
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-[4px] flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 transition-colors"
            title="Системные настройки"
            aria-label="Настройки"
          >
            <Settings2 className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>

          {/* User Account / Auth */}
          {!isAuthLoading && (
            isAuthenticated && currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-[4px] bg-slot border border-border-subtle hover:border-border-focus text-xs font-mono text-text-primary transition-all"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-5 h-5 rounded-[2px] bg-border-focus text-text-primary flex items-center justify-center font-bold text-[10px]">
                    {(currentUser.name || currentUser.email)[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate text-[11px]">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-text-muted" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 p-1.5 rounded-[6px] bg-surface border border-border-subtle shadow-plate z-50 text-xs">
                    <div className="px-2.5 py-1.5 border-b border-border-subtle mb-1">
                      <p className="font-semibold text-text-primary truncate">
                        {currentUser.name || 'Пользователь'}
                      </p>
                      <p className="font-mono text-[10px] text-text-muted truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsApiKeyModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 transition-colors font-mono text-[11px]"
                    >
                      <KeyRound className="w-3.5 h-3.5 stroke-[1.5] text-accent-amber" />
                      <span>Google API Key</span>
                      <span className={`ml-auto text-[9px] uppercase px-1 py-0.5 rounded-[2px] border ${
                        hasApiKey 
                          ? 'border-status-success/30 text-status-success' 
                          : 'border-accent-amber/30 text-accent-amber'
                      }`}>
                        {hasApiKey ? 'Готов' : 'Не задан'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 transition-colors font-mono text-[11px]"
                    >
                      <Settings2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>Параметры модели</span>
                    </button>

                    <div className="my-1 border-t border-border-subtle" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logoutUser();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-status-danger hover:bg-status-danger/10 transition-colors font-mono text-[11px]"
                    >
                      <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>Выйти из аккаунта</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true, 'login')}
                  className="px-2.5 py-1 rounded-[4px] text-xs font-display tracking-wider uppercase text-text-secondary hover:text-text-primary hover:bg-border-subtle/40 transition-colors"
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true, 'register')}
                  className="px-2.5 py-1 rounded-[4px] text-xs font-display font-semibold tracking-wider uppercase bg-accent-amber hover:bg-accent-amber-hover active:translate-y-[1px] text-slot shadow-tactile-dark transition-all"
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
