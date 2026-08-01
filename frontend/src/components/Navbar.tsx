'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useRouter } from 'next/navigation';
import { Cpu, LogOut, ShieldCheck, Zap, Radio } from 'lucide-react';
import { api } from '../lib/api';

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (e) {
      // Ignore error during logout
    } finally {
      dispatch(logout());
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300 animate-pulseGlow" />
            <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/15 flex items-center justify-center shadow-2xl">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2 text-white font-heading">
              Saarthi <span className="gradient-text-brand">TaskEngine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium">
                v1.0 Pro
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans">
              <span>Asynchronous BullMQ & Redis Engine</span>
            </p>
          </div>
        </div>

        {/* Right Section: Socket Status & User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Socket Telemetry Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 shadow-inner">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-emerald-300 flex items-center gap-1.5">
              Live Engine <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </span>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    {user.name}
                    {user.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <ShieldCheck className="w-3 h-3 text-amber-400" /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        <Zap className="w-3 h-3 text-blue-400" /> USER
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px] font-mono">{user.email}</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 transition-all duration-200 shadow-sm"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
