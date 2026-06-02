import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toasts({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const isError = toast.type === 'error';

  return (
    <div className={`pointer-events-auto min-w-[300px] glass-panel p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-right duration-300 border-l-4 ${isError ? 'border-l-rose-500' : 'border-l-emerald-500'}`}>
      <div className="flex items-center gap-3">
        {isError ? (
          <XCircle className="w-5 h-5 text-rose-400" />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        )}
        <div>
          <p className="text-sm font-bold text-white leading-tight">
            {isError ? 'Action Failed' : 'Success'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>
        </div>
      </div>
      <button onClick={onRemove} className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
