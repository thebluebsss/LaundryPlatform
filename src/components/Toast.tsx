import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container relative to screen */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgClass = 'bg-white text-slate-800 border-slate-100 shadow-xl';
            let icon = <Info className="w-5 h-5 text-blue-500" />;

            if (toast.type === 'success') {
              bgClass = 'bg-emerald-50 border-emerald-150 text-emerald-950 shadow-emerald-50/50';
              icon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
            } else if (toast.type === 'warning') {
              bgClass = 'bg-amber-50 border-amber-200 text-amber-950 shadow-amber-50/50';
              icon = <AlertCircle className="w-5 h-5 text-amber-600 font-bold" />;
            } else if (toast.type === 'error') {
              bgClass = 'bg-rose-50 border-rose-200 text-rose-950 shadow-rose-50/50';
              icon = <AlertCircle className="w-5 h-5 text-rose-600" />;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.93, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, scale: 0.93, filter: 'blur(4px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`p-4 rounded-2xl flex items-start gap-3 pointer-events-auto shadow-2xl border ${bgClass}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 text-xs md:text-sm font-semibold pr-2 leading-relaxed">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
