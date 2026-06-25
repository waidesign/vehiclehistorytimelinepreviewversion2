import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Car, User, LogOut, Save, Trash2, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AccountPage() {
  const { user, isLoading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [saveMsg, setSaveMsg] = useState('');
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'data'>('profile');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ firstName, lastName });
    setSaveMsg('Profile updated successfully.');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    const usersRaw = localStorage.getItem('vht_users');
    if (usersRaw && user) {
      const users = JSON.parse(usersRaw);
      delete users[user.email];
      localStorage.setItem('vht_users', JSON.stringify(users));
    }
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'data', label: 'Data & Privacy', icon: Trash2 },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-black px-6 py-3.5 flex items-center justify-between">
        <Link to="/journey-map" className="flex items-center gap-2.5">
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
        <div className="flex items-center gap-2">
          <Link
            to="/journey-map"
            className="text-[10px] bg-white border-2 border-black px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all"
          >
            ← Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="text-[10px] bg-white border-2 border-black px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 bg-black text-white flex items-center justify-center font-display font-extrabold text-xl border-2 border-black shadow-brutal-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-[#0E1726]">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Member since {joinDate}</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar nav */}
          <aside className="w-44 flex-shrink-0">
            <nav className="flex flex-col border-2 border-black bg-white shadow-brutal-sm overflow-hidden">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center justify-between gap-2 px-3.5 py-3 text-xs font-black uppercase tracking-wider border-b-2 border-black last:border-b-0 transition-all ${
                    activeSection === id
                      ? 'bg-black text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2"><Icon className="w-3.5 h-3.5" />{label}</span>
                  {activeSection !== id && <ChevronRight className="w-3 h-3 opacity-40" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content panel */}
          <div className="flex-1 bg-white border-2 border-black shadow-brutal p-6">

            {/* Profile section */}
            {activeSection === 'profile' && (
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#0E1726] mb-0.5">Profile Information</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Update your personal details.</p>
                </div>

                {saveMsg && (
                  <div className="bg-emerald-50 border-2 border-emerald-500 px-3.5 py-2.5 text-xs font-bold text-emerald-700">
                    {saveMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#FAF9F6] border-2 border-black px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-100 border-2 border-black/30 px-3 py-2.5 text-xs font-mono text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Email cannot be changed in the prototype.</p>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="bg-black text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 border-2 border-black hover:bg-white hover:text-black transition-all shadow-brutal-sm hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Security section */}
            {activeSection === 'security' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#0E1726] mb-0.5">Security</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Manage your account security settings.</p>
                </div>

                <div className="border-2 border-black p-4 bg-slate-50">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Password</p>
                  <p className="text-xs text-slate-700 font-medium mb-3">Password changes are not available in the prototype build. In production, a secure reset flow would be available here.</p>
                  <button
                    disabled
                    className="text-[10px] bg-white border-2 border-black/30 px-3 py-1.5 font-bold uppercase tracking-wider text-slate-400 cursor-not-allowed"
                  >
                    Change Password (Coming Soon)
                  </button>
                </div>

                <div className="border-2 border-black p-4 bg-slate-50">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">Active Sessions</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Current Browser Session</p>
                      <p className="text-[10px] text-slate-500 font-medium">Logged in via localStorage — this device only</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="self-start flex items-center gap-2 text-[10px] bg-white border-2 border-black px-3.5 py-2.5 font-black uppercase tracking-wider hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out of All Sessions
                </button>
              </div>
            )}

            {/* Data & Privacy section */}
            {activeSection === 'data' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#0E1726] mb-0.5">Data & Privacy</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Your data is stored locally in your browser. Nothing is sent to external servers.</p>
                </div>

                <div className="border-2 border-black p-4 bg-blue-50/30">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-blue-800 mb-1">Data Storage</p>
                  <p className="text-xs text-slate-700 font-medium">All account data, vehicle timelines, and session information are stored exclusively in your browser's localStorage. No personal data leaves your device.</p>
                </div>

                <div className="border-2 border-red-500 p-4 bg-red-50">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-red-600 mb-1">Danger Zone</p>
                  <p className="text-xs text-slate-700 font-medium mb-3">Permanently delete your account and all associated vehicle data. This cannot be undone.</p>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 text-[10px] bg-red-600 text-white border-2 border-red-600 px-3.5 py-2.5 font-black uppercase tracking-wider hover:bg-white hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
