'use client';

import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, RefreshCw, Paperclip, Download, Edit3, Copy, Check } from 'lucide-react';

interface TaskDetailModalProps {
  task: any | null;
  onClose: () => void;
  onRetry?: (taskId: string) => void;
  onEdit?: (task: any) => void;
}

export default function TaskDetailModal({ task, onClose, onRetry, onEdit }: TaskDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!task) return null;

  const parsedResult = () => {
    if (!task.result) return null;
    try {
      return JSON.parse(task.result);
    } catch (e) {
      return task.result;
    }
  };

  const copyPayload = () => {
    if (task.result) {
      navigator.clipboard.writeText(
        typeof task.result === 'string' ? task.result : JSON.stringify(parsedResult(), null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow w-full max-w-2xl rounded-3xl border border-white/15 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fadeInScale">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10">
                UUID: {task.id.slice(0, 8)}...
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {task.type}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">{task.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs sm:text-sm">
          
          {/* Status & Badges Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-xs text-slate-400 font-mono font-semibold">Status:</span>
            {task.status === 'COMPLETED' && (
              <span className="status-pill-completed inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
              </span>
            )}
            {task.status === 'PROCESSING' && (
              <span className="status-pill-processing inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> Processing
              </span>
            )}
            {task.status === 'PENDING' && (
              <span className="status-pill-pending inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold">
                <Clock className="w-4 h-4 text-amber-400" /> Pending
              </span>
            )}
            {task.status === 'FAILED' && (
              <span className="status-pill-failed inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Execution Failed
              </span>
            )}

            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

            <span className="text-xs text-slate-400 font-mono font-semibold">Priority:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 border border-white/10 font-mono text-xs font-bold text-slate-200">
              {task.priority}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Task Description
              </h4>
              <p className="text-slate-300 bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 font-sans leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Attachment File Box */}
          {task.fileUrl && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Attached Artifact File
              </h4>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-blue-500/20">
                <div className="flex items-center gap-3 font-mono text-xs text-blue-300 truncate">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{task.fileName || 'Attachment'}</p>
                    {task.fileSize && (
                      <p className="text-[10px] text-slate-400">
                        {(task.fileSize / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={`${API_URL}${task.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          )}

          {/* Execution Output JSON Console */}
          {task.result && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Execution Output Payload
                </h4>
                <button
                  onClick={copyPayload}
                  className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <div className="terminal-container p-4 rounded-2xl border border-emerald-500/30 overflow-x-auto text-emerald-300 text-xs">
                <pre className="whitespace-pre-wrap font-mono">
                  {JSON.stringify(parsedResult(), null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Failure Error Log Console */}
          {task.errorMessage && (
            <div>
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Exception Trace Log
              </h4>
              <div className="terminal-container p-4 rounded-2xl border border-rose-500/30 text-rose-300 font-mono text-xs overflow-x-auto">
                <pre className="whitespace-pre-wrap">{task.errorMessage}</pre>
              </div>
            </div>
          )}

          {/* Execution Metadata Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-500 block text-[10px]">Created At</span>
              <span className="text-slate-200 font-semibold">{new Date(task.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-500 block text-[10px]">Scheduled Execution</span>
              <span className="text-slate-200 font-semibold">
                {task.scheduledAt ? new Date(task.scheduledAt).toLocaleTimeString() : 'Immediate'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-500 block text-[10px]">Retry Counter</span>
              <span className="text-slate-200 font-semibold">{task.retryCount} / {task.maxRetries}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-500 block text-[10px]">Owner ID</span>
              <span className="text-slate-200 font-semibold truncate block">{task.userId.slice(0, 8)}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-white/10">
          {onEdit && task.status !== 'PROCESSING' && (
            <button
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs border border-blue-500/30 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Specs
            </button>
          )}

          {task.status === 'FAILED' && onRetry && (
            <button
              onClick={() => {
                onRetry(task.id);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-enqueue Task
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
