import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Car, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
  const { user, isLoading: authLoading, signup } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-xs font-medium text-gray-400 animate-pulse">Loading…</div>
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
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-900 text-sm tracking-tight leading-none">
              Vehicle History Timeline
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5">Cinematic Map-Driven Automotive Journeys</p>
          </div>
        </Link>
        <Link
          to="/login"
          className="text-xs bg-white border border-gray-200 px-3.5 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            {/* Title */}
            <div className="mb-6">
              <span className="inline-block text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-100 mb-4">
                Free Account
              </span>
              <h2 className="font-display font-bold text-2xl text-gray-900 leading-tight">
                Create your account
              </h2>
              <p className="text-sm text-gray-400 mt-1.5 font-medium">
                Build and manage unlimited vehicle history timelines.
              </p>
            </div>

            {/* Perks */}
            <div className="mb-6 grid grid-cols-2 gap-2">
              {['Unlimited vehicle timelines', 'Map-driven visualization', 'PDF report parsing', 'Live NHTSA VIN decoding'].map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600">{perk}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
                  <input
                    type="text" required value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
                  <input
                    type="text" required value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input
                  type="email" required autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-10 placeholder:text-gray-400"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {['weak', 'fair', 'strong'].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          level === 'weak' ? (passwordStrength ? 'bg-red-400' : 'bg-gray-200') :
                          level === 'fair' ? (passwordStrength === 'fair' || passwordStrength === 'strong' ? 'bg-yellow-400' : 'bg-gray-200') :
                          (passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-gray-200')
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-medium text-gray-400 w-10 capitalize">{passwordStrength}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                <input
                  type="password" required autoComplete="new-password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
                    confirm && confirm !== password
                      ? 'border-red-400 focus:ring-red-100 focus:border-red-400'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold text-sm px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {isLoading ? 'Creating account…' : (
                  <>Create Free Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          <p className="text-center text-[11px] text-gray-400 font-medium mt-4">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}
