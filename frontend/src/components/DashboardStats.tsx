'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Activity,
  Server,
  RefreshCw,
  TrendingUp,
  Cpu,
} from 'lucide-react';

export default function DashboardStats() {
  const { data: statsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
    refetchInterval: 5000,
  });

  const taskStats = statsData?.taskStats || {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    pendingTasks: 0,
    processingTasks: 0,
  };

  const queueMetrics = statsData?.queueMetrics || {
    active: 0,
    waiting: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  };

  const completionRate = taskStats.totalTasks > 0 
    ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100) 
    : 0;

  const cards = [
    {
      title: 'Total Tasks',
      value: taskStats.totalTasks,
      icon: Layers,
      accent: 'border-t-blue-500 bg-gradient-to-br from-blue-500/10 via-slate-900/60 to-slate-900/90 text-blue-400',
      badge: 'All Requests',
    },
    {
      title: 'Completed',
      value: taskStats.completedTasks,
      icon: CheckCircle2,
      accent: 'border-t-emerald-500 bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-slate-900/90 text-emerald-400',
      badge: `${completionRate}% Rate`,
    },
    {
      title: 'Processing',
      value: taskStats.processingTasks,
      icon: Activity,
      accent: 'border-t-purple-500 bg-gradient-to-br from-purple-500/10 via-slate-900/60 to-slate-900/90 text-purple-400',
      pulse: taskStats.processingTasks > 0,
      badge: 'In Flight',
    },
    {
      title: 'Pending Queue',
      value: taskStats.pendingTasks,
      icon: Clock,
      accent: 'border-t-amber-500 bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/90 text-amber-400',
      badge: 'Awaiting',
    },
    {
      title: 'Failed',
      value: taskStats.failedTasks,
      icon: AlertTriangle,
      accent: 'border-t-rose-500 bg-gradient-to-br from-rose-500/10 via-slate-900/60 to-slate-900/90 text-rose-400',
      badge: 'Issues',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5 font-heading">
            Platform Telemetry
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono font-medium">
              Live Feed
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time worker metrics, queue throughput, and task execution telemetry
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-white/10 hover:border-blue-500/40 transition-all duration-200 shadow-md group disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-500 ${isFetching ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          {isFetching ? 'Syncing...' : 'Sync Telemetry'}
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass-panel p-4 rounded-2xl border-t-2 ${card.accent} shadow-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl relative overflow-hidden group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                  <Icon className={`w-4 h-4 ${card.pulse ? 'animate-pulse text-purple-400' : ''}`} />
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-white/10 animate-pulse rounded-lg" />
                  ) : (
                    card.value
                  )}
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redis Engine & Worker Cluster Telemetry Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                BullMQ & Redis Queue Cluster
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Engine Healthy
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time asynchronous task dispatching, concurrency control, and job status tracking
              </p>
            </div>
          </div>

          {/* Progress Bar Component */}
          <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 min-w-[240px]">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Success Rate</span>
                <span className="font-bold text-emerald-400">{completionRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Metric Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 text-center">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="text-[11px] font-mono text-slate-400 mb-1">Active Workers</div>
            <div className="text-xl sm:text-2xl font-extrabold text-purple-400 font-heading">{queueMetrics.active}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="text-[11px] font-mono text-slate-400 mb-1">Pending Jobs</div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-heading">{queueMetrics.waiting}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <div className="text-[11px] font-mono text-slate-400 mb-1">Delayed / Scheduled</div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-400 font-heading">{queueMetrics.delayed}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
            <div className="text-[11px] font-mono text-slate-400 mb-1">Processed Jobs</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-heading">{queueMetrics.completed}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
