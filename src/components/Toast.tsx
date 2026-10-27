'use client';

import React from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useTaskStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-status-info shrink-0 stroke-[1.5]" />;
        let borderColor = 'border-status-info/40';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 stroke-[1.5]" />;
          borderColor = 'border-status-success/40';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0 stroke-[1.5]" />;
          borderColor = 'border-accent-amber/40';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-status-danger shrink-0 stroke-[1.5]" />;
          borderColor = 'border-status-danger/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-[6px] border ${borderColor} bg-slot/95 text-text-primary shadow-plate backdrop-blur-md transition-all duration-150 animate-in fade-in slide-in-from-bottom-2 text-xs font-mono`}
          >
            {icon}
            <div className="flex-1 text-[11px] font-sans font-medium text-text-primary leading-tight">
              {toast.message}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary p-0.5 rounded-[2px]"
              aria-label="Закрыть"
            >
              <X className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
