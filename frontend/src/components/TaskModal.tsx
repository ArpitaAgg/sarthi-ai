'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { X, Upload, Calendar, AlertCircle, FileText, Paperclip, Edit3, Flame, Zap, CheckCircle2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskToEdit?: any | null;
}

export default function TaskModal({ isOpen, onClose, onSuccess, taskToEdit }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [type, setType] = useState('GENERAL');
  const [scheduledAt, setScheduledAt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dateInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'MEDIUM');
      setType(taskToEdit.type || 'GENERAL');
      if (taskToEdit.scheduledAt) {
        try {
          const d = new Date(taskToEdit.scheduledAt);
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          setScheduledAt(localISOTime);
        } catch {
          setScheduledAt('');
        }
      } else {
        setScheduledAt('');
      }
      setFile(null);
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setType('GENERAL');
      setScheduledAt('');
      setFile(null);
    }
  }, [taskToEdit, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearDate = () => {
    setScheduledAt('');
    if (dateInputRef.current) {
      dateInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      formData.append('type', type);
      if (scheduledAt) {
        formData.append('scheduledAt', new Date(scheduledAt).toISOString());
      } else {
        formData.append('scheduledAt', '');
      }
      if (file) formData.append('file', file);

      if (taskToEdit) {
        await api.put(`/tasks/${taskToEdit.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await api.post('/tasks', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || (taskToEdit ? 'Failed to update task' : 'Failed to create task'));
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { label: 'LOW', value: 'LOW', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    { label: 'MEDIUM', value: 'MEDIUM', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { label: 'HIGH', value: 'HIGH', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { label: 'URGENT', value: 'URGENT', color: 'bg-rose-500/25 text-rose-300 border-rose-500/40' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="glass-panel-glow w-full max-w-lg rounded-3xl border border-white/15 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fadeInScale">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              {taskToEdit ? (
                <Edit3 className="w-5 h-5 text-white" />
              ) : (
                <FileText className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 id="task-modal-title" className="text-lg font-bold text-white font-heading">
                {taskToEdit ? 'Edit Task Specifications' : 'Enqueue New Background Task'}
              </h3>
              <p className="text-xs text-slate-400">Configure parameters for BullMQ asynchronous queue worker</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Generate Monthly Financial Audit PDF"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Task Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed instructions or parameters for worker execution..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
            />
          </div>

          {/* Priority Pill Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono">
              Queue Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => {
                const selected = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-all duration-200 flex items-center justify-center gap-1 ${
                      selected
                        ? `${opt.color} shadow-lg ring-2 ring-blue-500/50 scale-[1.02]`
                        : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {opt.value === 'URGENT' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                    {opt.value === 'HIGH' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Type Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Job Category / Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm bg-slate-950"
            >
              <option value="GENERAL">GENERAL — Standard Background Job</option>
              <option value="FILE_PROCESSING">FILE_PROCESSING — PDF Parsing & OCR</option>
              <option value="REPORT_GENERATION">REPORT_GENERATION — Analytics PDF/CSV</option>
              <option value="DATA_EXPORT">DATA_EXPORT — Database Export Dump</option>
            </select>
          </div>

          {/* Schedule Execution */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                <Calendar className="w-4 h-4 text-blue-400" />
                Delayed Execution Time (Optional)
              </label>
              {scheduledAt && (
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Clear Schedule"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                ref={dateInputRef}
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-xs pr-10 [color-scheme:dark] cursor-pointer font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank for immediate processing, or select future time for delayed worker execution.
            </p>
          </div>

          {/* File Attachment Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5 font-mono">
              <Upload className="w-4 h-4 text-blue-400" />
              File Attachment (PDF / Image)
            </label>

            <input
              ref={fileInputRef}
              id="task-modal-file-input"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : taskToEdit?.fileName ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-blue-300 truncate">
                  <Paperclip className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">{taskToEdit.fileName}</span>
                </div>
                <label
                  htmlFor="task-modal-file-input"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  Replace File
                </label>
              </div>
            ) : (
              <label
                htmlFor="task-modal-file-input"
                className="flex flex-col items-center justify-center p-4 rounded-xl glass-input border border-dashed border-white/20 hover:border-blue-500/60 hover:bg-blue-500/5 cursor-pointer transition-all text-center group"
              >
                <div className="p-2.5 rounded-2xl bg-slate-900 group-hover:bg-blue-500/20 text-slate-400 group-hover:text-blue-300 mb-1.5 transition-colors border border-white/10">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-200 font-semibold">Click to upload PDF or image</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Max size: 10MB</p>
              </label>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : taskToEdit ? (
                'Save Task Changes'
              ) : (
                'Submit & Enqueue Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
