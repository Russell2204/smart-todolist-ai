'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Trash2,
  Cpu 
} from 'lucide-react';

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
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    valid?: boolean;
    message?: string;
  }>({ tested: false });
  const [serverStatus, setServerStatus] = useState<{
    hasServerKey: boolean;
  }>({ hasServerKey: false });

  // Fetch server status on mount
  useEffect(() => {
    if (isSettingsOpen) {
      setApiKey(settings.apiKey || '');
      setModel(settings.model || 'gemini-2.5-flash');
      setTestStatus({ tested: false });

      fetch('/api/ai/status')
        .then((res) => res.json())
        .then((data) => {
          setServerStatus({ hasServerKey: !!data.hasServerKey });
        })
        .catch(() => {});
    }
  }, [isSettingsOpen, settings.apiKey, settings.model]);

  if (!isSettingsOpen) return null;

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestStatus({ tested: false });

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
        addToast('Подключение к Gemini API успешно проверено!', 'success');
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
    updateSettings({
      apiKey: apiKey.trim(),
      model,
    });
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Настройки AI и Gemini
              </h2>
              <p className="text-[11px] text-zinc-500">
                Конфигурация ключа Google Gen AI API
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs sm:text-sm">
          {/* Server Key Badge */}
          {serverStatus.hasServerKey && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold">Серверный ключ обнаружен (.env):</span>{' '}
                Приложение может использовать системный ключ, либо вы можете переопределить его своим собственным ниже (BYOK).
              </div>
            </div>
          )}

          {/* BYOK API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                Google Gemini API Key (BYOK)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline"
              >
                Получить ключ в Google AI Studio ↗
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus({ tested: false });
                }}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-20 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  title={showKey ? 'Скрыть ключ' : 'Показать ключ'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Ключ безопасно хранится в вашем браузере (localStorage) и не передается третьим лицам.
            </p>
          </div>

          {/* Model Selector */}
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              Модель Gemini
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="gemini-2.5-flash">
                gemini-2.5-flash (Рекомендуется по спецификации)
              </option>
              <option value="gemini-2.0-flash">
                gemini-2.0-flash (Быстрая и стабильная)
              </option>
              <option value="gemini-1.5-flash">
                gemini-1.5-flash (Базовая)
              </option>
            </select>
          </div>

          {/* Test Connection Button & Status */}
          <div>
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium text-xs transition-colors"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span>Проверка подключения к API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span>Проверить подключение к Gemini</span>
                </>
              )}
            </button>

            {testStatus.tested && (
              <div
                className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  testStatus.valid
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                }`}
              >
                {testStatus.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>

          {/* Data Reset Section */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Демо-данные
              </div>
              <div className="text-[11px] text-zinc-500">
                Сбросить задачи к исходным примерам
              </div>
            </div>
            <button
              type="button"
              onClick={resetToSampleData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Восстановить
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-colors"
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
}
