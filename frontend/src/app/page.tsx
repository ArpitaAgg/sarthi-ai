'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { RootState } from '../store';
import { initializeAuth } from '../store/authSlice';
import Navbar from '../components/Navbar';

// Dynamic Imports & Lazy Loading for heavy dashboard widgets
const DashboardStats = dynamic(() => import('../components/DashboardStats'), {
  loading: () => (
    <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
      <div className="h-6 w-48 bg-white/10 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

const TaskTable = dynamic(() => import('../components/TaskTable'), {
  loading: () => (
    <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
      <div className="h-10 bg-white/5 rounded-xl" />
      <div className="h-64 bg-white/5 rounded-2xl" />
    </div>
  ),
  ssr: false,
});

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Loading state during SSR hydration pass
  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg" role="status" aria-label="Loading platform">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Saarthi TaskEngine...</p>
        </div>
      </div>
    );
  }

  // Render main dashboard with dynamic lazy-loaded components
  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8" role="main">
        {/* Real-time Dashboard Telemetry */}
        <DashboardStats />

        {/* Task Management System */}
        <TaskTable />
      </main>
    </div>
  );
}
