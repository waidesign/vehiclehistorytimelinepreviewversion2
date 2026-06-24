import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Car, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
  const { user, isLoading: authLoading, signup } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) return <Navigate to="/journey-map" replace />;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = password.length === 0 ? null : password.length < 6 ? 'weak' : password.length < 10 ? 'fair' : 'strong';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await signup(firstName, lastName, email, password);
      navigate('/journey-map', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
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
          to="/login"
          className="text-[10px] bg-white border-2 border-black px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all"
        >
          Sign In
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
                Free Account
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#0E1726] leading-tight">
                Create your account
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Build and manage unlimited vehicle history timelines.
              </p>
            </div>

            {/* Perks */}
            <div className="mb-6 flex flex-col gap-1.5">
              {['Unlimited vehicle timelines', 'Map-driven journey visualization', 'PDF report parsing', 'Live NHTSA VIN decoding'].map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{perk}</span>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 bg-red-50 border-2 border-red-500 px-3.5 py-2.5 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

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
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
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
                {passwordStrength && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {['weak', 'fair', 'strong'].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 border border-black transition-all ${
                          level === 'weak' ? (passwordStrength ? 'bg-red-500' : 'bg-slate-100') :
                          level === 'fair' ? (passwordStrength === 'fair' || passwordStrength === 'strong' ? 'bg-yellow-400' : 'bg-slate-100') :
                          (passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-slate-100')
                        }`}
                      />
                    ))}
                    <span className="text-[9px] font-black uppercase text-slate-500 w-8">{passwordStrength}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[#FAF9F6] border-2 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none transition-all placeholder:font-sans placeholder:text-slate-400 ${
                    confirm && confirm !== password ? 'border-red-500' : 'border-black focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-black text-xs uppercase tracking-wider px-4 py-3 border-2 border-black hover:bg-white hover:text-black transition-all shadow-brutal-sm hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {isLoading ? 'Creating account...' : (
                  <>Create Free Account <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </form>

            <p className="text-center text-[10px] text-slate-500 font-medium mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-[10px] text-slate-400 font-medium mt-4">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}
