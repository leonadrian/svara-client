import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../utils';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleSvaraToast = (e: any) => {
      const { message, type } = e.detail || {};
      if (!message) return;

      const newToast: ToastMessage = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type: type || 'success'
      };

      setToasts(prev => [...prev, newToast]);

      // Remove after 3.5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3500);
    };

    window.addEventListener('svara-toast', handleSvaraToast);
    return () => {
      window.removeEventListener('svara-toast', handleSvaraToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl bg-white animate-fade-in-up duration-300 ${
            toast.type === 'success'
              ? 'border-emerald-100 text-emerald-900 bg-emerald-50/95'
              : toast.type === 'error'
              ? 'border-red-100 text-red-900 bg-red-50/95'
              : 'border-blue-100 text-blue-900 bg-blue-50/95'
          }`}
          id={`toast-${toast.id}`}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs font-bold leading-relaxed pr-2 text-left">
            {toast.message}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
