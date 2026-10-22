'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { X, Key, Eye, EyeOff, Sparkles, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';

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

    setIsSaving(true);
    await saveUserApiKey(keyInput.trim(), model);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent relative">
          <button
            onClick={() => setIsApiKeyModalOpen(false)}
            className="absolute top-5 right-5 p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Привязка Google API Key
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Персональный ключ для AI-функций
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            Каждый пользователь использует свой собственный бесплатный ключ <strong>Google Gemini API</strong>. Ключ привязывается к вашему аккаунту и безопасно сохраняется в базе данных Neon.
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                <span>Получить ключ бесплатно</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Google AI Studio предоставляет бесплатный тариф без привязки банковской карты.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Модель Gemini
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="gemini-2.5-flash">
                gemini-2.5-flash (Рекомендуемая по спецификации)
              </option>
              <option value="gemini-2.0-flash">
                gemini-2.0-flash (Быстрая и стабильная)
              </option>
              <option value="gemini-1.5-flash">
                gemini-1.5-flash (Базовая)
              </option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
            >
              Позже
            </button>
            <button
              type="submit"
              disabled={isSaving || !keyInput.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/25 disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Проверка ключа...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Сохранить в аккаунт</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
