'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from '../../store/authSlice';
import { RootState } from '../../store';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Link from 'next/link';
import { Cpu, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        dispatch(logout());
        const registeredEmail = params.get('email');
        if (registeredEmail) {
          setEmail(registeredEmail);
        }
        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, tokens } = res.data.data;
      dispatch(setCredentials({ user, tokens }));
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
      {/* Background Glowing Flare Circles */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulseGlow" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulseGlow" />

      <div className="glass-panel-glow w-full max-w-md p-8 sm:p-10 rounded-3xl border border-white/15 shadow-2xl relative z-10 animate-fadeInScale">
        
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="relative group inline-block mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulseGlow" />
            <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center shadow-2xl mx-auto">
              <Cpu className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Welcome to <span className="gradient-text-brand">Saarthi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-sans">
            Sign in to access your Task Automation & Queue Platform
          </p>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Feature Badges Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 flex-wrap mb-4 text-[10px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10">Redis Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10">BullMQ Workers</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10">Socket.io Telemetry</span>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
              Create account now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
