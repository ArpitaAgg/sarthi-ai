'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Link from 'next/link';
import { Cpu, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { name, email, password });
      dispatch(logout());
      router.push(`/login?registered=true&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulseGlow" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulseGlow" />

      <div className="glass-panel-glow w-full max-w-md p-8 sm:p-10 rounded-3xl border border-white/15 shadow-2xl relative z-10 animate-fadeInScale">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative group inline-block mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulseGlow" />
            <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center shadow-2xl mx-auto">
              <Cpu className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Create <span className="gradient-text-brand">Account</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-sans">
            Join the Saarthi TaskEngine automation platform
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
              />
            </div>
          </div>

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
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
                Creating Account...
              </>
            ) : (
              <>
                Register Now <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
