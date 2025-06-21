// Placeholder for shadcn/ui Toaster and useToast hook
// `npx shadcn-ui@latest add toast`
// This is a very simplified version. The actual component is much more feature-rich.

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'; // Icons

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  description: string;
  duration?: number;
}

interface ToastContextType {
  toast: (toast: Omit<ToastMessage, 'id' | 'type'> & { type?: ToastType }) => void;
  // Specific toast functions for convenience
  success: (description: string, title?: string, duration?: number) => void;
  error: (description: string, title?: string, duration?: number) => void;
  warning: (description: string, title?: string, duration?: number) => void;
  info: (description: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

let toastCount = 0;

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((newToast: Omit<ToastMessage, 'id' | 'type'> & { type?: ToastType }) => {
    const id = `toast-${toastCount++}`;
    setToasts(prevToasts => [...prevToasts, { ...newToast, id, type: newToast.type || 'default' }]);

    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
    }, newToast.duration || 5000);
  }, []);

  const success = useCallback((description: string, title?: string, duration?: number) => {
    toast({ title: title || 'Success!', description, type: 'success', duration });
  }, [toast]);

  const error = useCallback((description: string, title?: string, duration?: number) => {
    toast({ title: title || 'Error!', description, type: 'error', duration });
  }, [toast]);

  const warning = useCallback((description: string, title?: string, duration?: number) => {
    toast({ title: title || 'Warning!', description, type: 'warning', duration });
  }, [toast]);

  const info = useCallback((description: string, title?: string, duration?: number) => {
    toast({ title: title || 'Info', description, type: 'info', duration });
  }, [toast]);


  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  );
};


interface ToasterProps {
  toasts: ToastMessage[];
}

const Toaster: React.FC<ToasterProps> = ({ toasts }) => {
  if (!toasts.length) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error': return <XCircle className="w-6 h-6 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'info': return <Info className="w-6 h-6 text-blue-400" />;
      default: return <Info className="w-6 h-6 text-gray-400" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-green-500/80';
      case 'error': return 'border-red-500/80';
      case 'warning': return 'border-yellow-500/80';
      case 'info': return 'border-blue-500/80';
      default: return 'border-gray-500/80';
    }
  };


  return (
    <div className="fixed bottom-4 right-4 z-[150] w-full max-w-sm space-y-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            "p-4 rounded-xl shadow-2xl flex items-start space-x-3 animate-toast-in",
            "bg-gradient-to-br from-slate-800 via-slate-900 to-purple-950/70 border backdrop-blur-md",
            getBorderColor(toast.type),
            "shadow-purple-500/20 hover:shadow-cyan-500/30 transition-shadow"
          )}
        >
          <div className="flex-shrink-0 pt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-grow">
            {toast.title && <h5 className="font-semibold text-gray-100">{toast.title}</h5>}
            <p className={cn("text-sm", toast.title ? "text-gray-300" : "text-gray-200")}>{toast.description}</p>
          </div>
           <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} // Simplified removal
            className="ml-auto -mr-1 -mt-1 p-1 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export { Toaster }; // Export Toaster directly for App.tsx, provider wraps content there.
