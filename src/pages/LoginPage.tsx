import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Car, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { user, isLoading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/journey-map';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) return <Navigate to="/journey-map" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-black px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-2 bg-black text-white border-2 border-black shadow-brutal-sm">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-[#0E1726] text-sm tracking-tight leading-none">
              Vehicle History Timeline
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Cinematic Map-Driven Automotive Journeys</p>
          </div>
        </Link>
        <Link
          to="/signup"
          className="text-[10px] bg-white border-2 border-black px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all"
        >
          Create Account
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white border-2 border-black shadow-brutal p-8">
            {/* Title */}
            <div className="mb-8">
              <span className="inline-block text-[10px] bg-black text-white font-extrabold px-2 py-0.5 uppercase tracking-wider mb-3">
                Members Area
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#0E1726] leading-tight">
                Welcome back
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Sign in to access your garage and vehicle timelines.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 bg-red-50 border-2 border-red-500 px-3.5 py-2.5 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#FAF9F6] border-2 border-black px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:font-sans placeholder:text-slate-400"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF9F6] border-2 border-black px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-all pr-10 placeholder:font-sans placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-black text-xs uppercase tracking-wider px-4 py-3 border-2 border-black hover:bg-white hover:text-black transition-all shadow-brutal-sm hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : (
                  <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-black/10" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">or</span>
              <div className="flex-1 h-px bg-black/10" />
            </div>

            <p className="text-center text-[10px] text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-black hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          <p className="text-center text-[10px] text-slate-400 font-medium mt-4">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}
