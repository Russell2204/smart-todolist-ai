'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { 
  X, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Cpu, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Zap, 
  ZapOff 
} from 'lucide-react';
import { playMechanicalClick, triggerHaptic } from '@/lib/audio';

export function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    resetToSampleData,
    addToast,
  } = useTaskStore();

  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || 'gemini-2.5-flash');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [reducedMotion, setReducedMotion] = useState(settings.reducedMotion);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    valid?: boolean;
    message?: string;
  }>({ tested: false });

  useEffect(() => {
    if (isSettingsOpen) {
      setApiKey(settings.apiKey || '');
      setModel(settings.model || 'gemini-2.5-flash');
      setSoundEnabled(settings.soundEnabled);
      setReducedMotion(settings.reducedMotion);
      setTestStatus({ tested: false });
    }
  }, [isSettingsOpen, settings]);

  if (!isSettingsOpen) return null;

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestStatus({ tested: false });

    if (settings.soundEnabled) playMechanicalClick(240, 0.02);

    try {
      const res = await fetch('/api/ai/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          model,
        }),
      });

      const data = await res.json();
      setTestStatus({
        tested: true,
        valid: data.valid,
        message: data.message,
      });

      if (data.valid) {
        addToast('Связь с Gemini API установлена успешно', 'success');
      } else {
        addToast(data.message || 'Ошибка проверки API-ключа', 'error');
      }
    } catch (e: any) {
      setTestStatus({
        tested: true,
        valid: false,
        message: e?.message || 'Сетевая ошибка при проверке ключа',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (soundEnabled) playMechanicalClick(300, 0.025);
    triggerHaptic(12);

    updateSettings({
      apiKey: apiKey.trim(),
      model,
      soundEnabled,
      reducedMotion,
    });
    setIsSettingsOpen(false);
  };

  const handleClose = () => {
    if (settings.soundEnabled) playMechanicalClick(180, 0.015);
    setIsSettingsOpen(false);
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
                СИСТЕМНАЯ КОНСОЛЬ // ПАРАМЕТРЫ
              </h2>
              <p className="font-mono text-[10px] text-text-muted mt-0.5">
                Конфигурация модели, звука и аппаратного режима
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

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          
          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
              <label className="text-text-muted uppercase flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-accent-amber stroke-[1.5]" />
                GOOGLE GEMINI API KEY
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-accent-amber hover:underline text-[10px] uppercase"
              >
                AI STUDIO ↗
              </a>
            </div>

            <div className="relative flex items-center bg-slot border border-border-subtle focus-within:border-accent-amber rounded-[4px] px-3 py-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus({ tested: false });
                }}
                placeholder="AIzaSy..."
                className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base sm:text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-text-muted hover:text-text-primary ml-2 p-1"
                aria-label="Показать/скрыть"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5 stroke-[1.5]" /> : <Eye className="w-3.5 h-3.5 stroke-[1.5]" />}
              </button>
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block font-mono text-[11px] text-text-muted uppercase mb-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-text-muted stroke-[1.5]" />
              РАБОЧАЯ МОДЕЛЬ GEMINI
            </label>
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-[4px] bg-slot border border-border-subtle font-mono text-[11px]">
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playMechanicalClick(200, 0.015);
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
                  if (soundEnabled) playMechanicalClick(200, 0.015);
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

          {/* Tactile Sound & Motion Controls */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (!soundEnabled) playMechanicalClick(300, 0.02);
                setSoundEnabled(!soundEnabled);
              }}
              className={`flex items-center justify-between p-2.5 rounded-[4px] border font-mono text-[11px] transition-all ${
                soundEnabled 
                  ? 'bg-slot border-border-focus text-text-primary' 
                  : 'bg-slot border-border-subtle text-text-muted'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-accent-amber stroke-[1.5]" /> : <VolumeX className="w-3.5 h-3.5 stroke-[1.5]" />}
                ЗВУК
              </span>
              <span className="font-bold uppercase text-[10px]">
                {soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (soundEnabled) playMechanicalClick(200, 0.02);
                setReducedMotion(!reducedMotion);
              }}
              className={`flex items-center justify-between p-2.5 rounded-[4px] border font-mono text-[11px] transition-all ${
                reducedMotion 
                  ? 'bg-slot border-accent-amber/50 text-accent-amber shadow-glow-amber' 
                  : 'bg-slot border-border-subtle text-text-muted'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {reducedMotion ? <ZapOff className="w-3.5 h-3.5 stroke-[1.5]" /> : <Zap className="w-3.5 h-3.5 stroke-[1.5]" />}
                ZERO-FPS
              </span>
              <span className="font-bold uppercase text-[10px]">
                {reducedMotion ? 'АКТИВЕН' : 'ВЫКЛ'}
              </span>
            </button>
          </div>

          {/* Test Connection Button */}
          <div>
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-[4px] border border-border-subtle bg-slot hover:bg-border-subtle/40 text-text-primary font-display font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-amber" />
                  <span>ДИАГНОСТИКА СВЯЗИ...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 stroke-[1.5] text-accent-amber" />
                  <span>ТЕСТ СВЯЗИ С GEMINI API</span>
                </>
              )}
            </button>

            {testStatus.tested && (
              <div
                className={`mt-2 p-2 rounded-[4px] text-[11px] font-mono flex items-center gap-2 ${
                  testStatus.valid
                    ? 'bg-status-success/10 text-status-success border border-status-success/30'
                    : 'bg-status-danger/10 text-status-danger border border-status-danger/30'
                }`}
              >
                {testStatus.valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] text-text-primary uppercase font-bold">ТЕСТОВЫЙ НАБОР</p>
              <p className="text-[10px] text-text-muted font-sans">Восстановить примеры задач</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (soundEnabled) playMechanicalClick(240, 0.02);
                triggerHaptic(10);
                resetToSampleData();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-slot hover:bg-border-subtle text-text-secondary hover:text-text-primary font-display text-[11px] uppercase tracking-wider border border-border-subtle transition-colors"
            >
              <RefreshCw className="w-3 h-3 stroke-[1.5]" />
              СБРОСИТЬ
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-surface border-t border-border-subtle flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-1.5 rounded-[4px] font-display text-xs tracking-wider uppercase text-text-muted hover:text-text-primary hover:bg-slot transition-colors"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-[4px] font-display font-semibold text-xs tracking-wider uppercase bg-accent-amber hover:bg-accent-amber-hover text-slot shadow-tactile-dark active:translate-y-[1px] active:shadow-none transition-all"
          >
            Сохранить параметры
          </button>
        </div>

      </div>
    </div>
  );
}
