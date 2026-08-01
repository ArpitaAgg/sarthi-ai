'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    socket.on('task:created', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Task Created', `"${data?.title || 'New task'}" was enqueued for execution`, 'info');
    });

    socket.on('task:updated', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      if (data?.status === 'PROCESSING') {
        addToast('Task Processing', `"${data?.title || 'Task'}" is now running in background...`, 'info');
      } else if (data?.status === 'COMPLETED') {
        addToast('Task Completed', `"${data?.title || 'Task'}" completed successfully`, 'success');
      } else if (data?.status === 'FAILED') {
        addToast('Task Failed', `"${data?.title || 'Task'}" execution failed`, 'error');
      }
    });

    socket.on('task:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('dashboard:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('dashboard:updated');
    };
  }, [isAuthenticated, queryClient]);

  return (
    <>
      {children}

      {/* Floating Real-Time Socket Toast Notifications Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl glass-panel border shadow-2xl flex items-start justify-between gap-3 animate-fadeIn transition-all duration-300 ${
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
                : toast.type === 'error'
                ? 'border-rose-500/30 bg-rose-950/40 text-rose-200'
                : toast.type === 'warning'
                ? 'border-amber-500/30 bg-amber-950/40 text-amber-200'
                : 'border-brand-500/30 bg-brand-950/40 text-brand-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-xl bg-white/10 shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {toast.type === 'info' && <Sparkles className="w-4 h-4 text-brand-400" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {toast.title}
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
                </h4>
                <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-2">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
