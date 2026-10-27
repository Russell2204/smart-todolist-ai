'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { X, KeyRound, Eye, EyeOff, ExternalLink, Loader2, Cpu } from 'lucide-react';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

export function ApiKeyModal() {
  const {
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    currentUser,
    settings,
    saveUserApiKey,
  } = useTaskStore();

  const [keyInput, setKeyInput] = useState('');
  const [model, setModel] = useState(currentUser?.geminiModel || settings.model || 'gemini-2.5-flash');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isApiKeyModalOpen) {
      setKeyInput(currentUser?.apiKey || settings.apiKey || '');
      setModel(currentUser?.geminiModel || settings.model || 'gemini-2.5-flash');
    }
  }, [isApiKeyModalOpen, currentUser, settings]);

  if (!isApiKeyModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    if (settings.soundEnabled) playMechanicalClick(280, 0.02);
    triggerHaptic(12);

    setIsSaving(true);
    await saveUserApiKey(keyInput.trim(), model);
    setIsSaving(false);
  };

  const handleClose = () => {
    if (settings.soundEnabled) playMechanicalClick(180, 0.015);
    setIsApiKeyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-surface rounded-t-[12px] sm:rounded-[8px] border border-border-subtle shadow-plate max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-subtle bg-surface select-none flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-accent-amber shadow-glow-amber" />
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base tracking-wider uppercase text-text-primary">
                КОНФИГУРАЦИЯ GOOGLE GEMINI KEY
              </h2>
              <p className="font-mono text-[10px] text-text-muted mt-0.5">
                Персональная квота для AI-сортировки и декомпозиции
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto">
          
          {/* Informational telemetry note */}
          <div className="p-3 rounded-[4px] bg-slot border border-border-subtle text-text-secondary leading-relaxed font-sans text-xs">
            Требуется личный ключ Google Gemini. Запросы отправляются напрямую в рамках вашей персональной квоты. Ключ хранится в зашифрованном виде.
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
              <label className="text-text-muted uppercase flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-accent-amber stroke-[1.5]" />
                API КЛЮЧ *
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-accent-amber hover:underline flex items-center gap-1 uppercase"
              >
                <span>Получить в AI Studio</span>
                <ExternalLink className="w-3 h-3 stroke-[1.5]" />
              </a>
            </div>

            <div className="relative flex items-center bg-slot border border-border-subtle focus-within:border-accent-amber rounded-[4px] px-3 py-2">
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base sm:text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-text-muted hover:text-text-primary ml-2 p-1"
                aria-label="Показать/скрыть ключ"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5 stroke-[1.5]" /> : <Eye className="w-3.5 h-3.5 stroke-[1.5]" />}
              </button>
            </div>
          </div>

          {/* Model Selection Segmented Controls */}
          <div>
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1">
              РАБОЧАЯ МОДЕЛЬ
            </label>
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-[4px] bg-slot border border-border-subtle font-mono text-[11px]">
              <button
                type="button"
                onClick={() => {
                  if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                  setModel('gemini-2.5-flash');
                }}
                className={`py-1.5 rounded-[2px] transition-all font-semibold ${
                  model === 'gemini-2.5-flash'
                    ? 'bg-border-subtle text-text-primary shadow-plate border border-border-focus'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                2.5 FLASH (РЕК.)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (settings.soundEnabled) playMechanicalClick(200, 0.015);
                  setModel('gemini-2.0-flash');
                }}
                className={`py-1.5 rounded-[2px] transition-all font-semibold ${
                  model === 'gemini-2.0-flash'
                    ? 'bg-border-subtle text-text-primary shadow-plate border border-border-focus'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                2.0 FLASH
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || !keyInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[4px] font-display font-semibold text-xs tracking-wider uppercase bg-accent-amber hover:bg-accent-amber-hover text-slot shadow-tactile-dark active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ПРОВЕРКА И ПРИВЯЗКА...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 stroke-[2]" />
                  <span>СОХРАНИТЬ И АКТИВИРОВАТЬ</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
