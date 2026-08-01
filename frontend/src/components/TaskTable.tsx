'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Paperclip,
  Edit3,
  FileText,
  Database,
  Briefcase,
  Flame,
  Zap,
} from 'lucide-react';
import TaskModal from './TaskModal';
import TaskDetailModal from './TaskDetailModal';

export default function TaskTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 8;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);

  // Fetch tasks query
  const { data: taskData, isLoading, refetch } = useQuery({
    queryKey: ['tasks', page, search, status, priority, sortBy, sortOrder],
    queryFn: async () => {
      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const res = await api.get('/tasks', { params });
      return res.data;
    },
  });

  const tasks = taskData?.data || [];
  const meta = taskData?.meta || { total: 0, totalPages: 1, page: 1 };
  const activeSelectedTask = tasks.find((t: any) => t.id === selectedTask?.id) || selectedTask;

  // Retry mutation
  const retryMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.post(`/tasks/${taskId}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleRetry = (taskId: string) => {
    retryMutation.mutate(taskId);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(taskId);
    }
  };

  const statusTabs = [
    { label: 'All Tasks', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Failed', value: 'FAILED' },
  ];

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold shadow-sm shadow-rose-500/20">
            <Flame className="w-3 h-3 text-rose-400 animate-pulse" /> URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
            <Zap className="w-3 h-3 text-amber-400" /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-medium">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-medium">
            LOW
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FILE_PROCESSING':
        return <Paperclip className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case 'REPORT_GENERATION':
        return <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'DATA_EXPORT':
        return <Database className="w-3.5 h-3.5 text-teal-400 shrink-0" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Search, Status Tabs & Action Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Status Tab Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
            {statusTabs.map((tab) => {
              const active = status === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Create Task Button */}
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Enqueue New Task
          </button>
        </div>

        {/* Search Input, Priority & Sort Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5 border-t border-white/10">
          
          {/* Search Field */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search tasks by title, output..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Priority Select Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-950"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-950"
            >
              <option value="createdAt-desc">Newest Enqueued</option>
              <option value="createdAt-asc">Oldest Enqueued</option>
              <option value="priority-desc">Highest Priority</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="status-asc">Job Status</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Task Data Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono font-semibold">
              <tr>
                <th className="py-4 px-4 sm:px-5">Task Summary</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Priority</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Timeline</th>
                <th className="py-4 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    <p className="font-mono text-xs">Querying task records...</p>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                      <Filter className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold text-white font-heading">No tasks found</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust search query or enqueue a new job</p>
                  </td>
                </tr>
              ) : (
                tasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-white/[0.03] transition-colors duration-150 group">
                    
                    {/* Task Title & File Badge */}
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="font-semibold text-white text-sm flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                        {task.title}
                        {task.fileUrl && (
                          <span className="p-1 rounded bg-blue-500/10 border border-blue-500/20" title="Has Attachment">
                            <Paperclip className="w-3 h-3 text-blue-400" />
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-slate-400 text-xs truncate max-w-xs mt-0.5 font-sans">
                          {task.description}
                        </p>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4">
                      {task.status === 'COMPLETED' && (
                        <span className="status-pill-completed inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
                        </span>
                      )}
                      {task.status === 'PROCESSING' && (
                        <span className="status-pill-processing inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" /> Processing
                        </span>
                      )}
                      {task.status === 'PENDING' && (
                        <span className="status-pill-pending inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending
                        </span>
                      )}
                      {task.status === 'FAILED' && (
                        <span className="status-pill-failed inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Failed
                        </span>
                      )}
                    </td>

                    {/* Priority Pill */}
                    <td className="py-3.5 px-4">
                      {getPriorityBadge(task.priority)}
                    </td>

                    {/* Job Type Tag */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-mono text-[11px]">
                        {getTypeIcon(task.type)}
                        <span>{task.type}</span>
                      </div>
                    </td>

                    {/* Timeline Column */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                      {task.scheduledAt && new Date(task.scheduledAt) > new Date() ? (
                        <div className="text-amber-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Sched: {new Date(task.scheduledAt).toLocaleDateString()} {new Date(task.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ) : (
                        <div>{new Date(task.createdAt).toLocaleDateString()}</div>
                      )}
                      <div className="text-[10px] text-slate-500">
                        {task.completedAt 
                          ? `Done: ${new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                          : `Created: ${new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 sm:px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Task Details */}
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors shadow-sm"
                          title="View Execution Output"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Task */}
                        {task.status !== 'PROCESSING' && (
                          <button
                            onClick={() => {
                              setTaskToEdit(task);
                              setIsCreateModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 hover:text-blue-200 border border-white/10 transition-colors shadow-sm"
                            title="Edit Task Specs"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Retry Execution */}
                        {(task.status === 'FAILED' || task.status === 'COMPLETED') && (
                          <button
                            onClick={() => handleRetry(task.id)}
                            disabled={retryMutation.isPending}
                            className="p-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-colors shadow-sm"
                            title="Re-enqueue Task to BullMQ"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Task */}
                        <button
                          onClick={() => handleDelete(task.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors shadow-sm"
                          title="Purge Task Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-t border-white/10 text-xs text-slate-400 font-mono">
          <div>
            Page <span className="text-white font-bold">{meta.page}</span> of{' '}
            <span className="text-white font-bold">{meta.totalPages || 1}</span> ({meta.total} tasks total)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Specification & Details Modals */}
      <TaskModal
        isOpen={isCreateModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />

      <TaskDetailModal
        task={activeSelectedTask}
        onClose={() => setSelectedTask(null)}
        onRetry={handleRetry}
        onEdit={(task) => {
          setTaskToEdit(task);
          setIsCreateModalOpen(true);
        }}
      />
    </div>
  );
}
