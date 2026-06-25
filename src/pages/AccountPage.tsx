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

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleDeleteAccount = () => {
    if (!confirm('Delete your account? This cannot be undone.')) return;
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-xs font-medium text-gray-400 animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navItems = [
    { id: 'profile',  label: 'Profile',       icon: User },
    { id: 'security', label: 'Security',       icon: ShieldCheck },
    { id: 'data',     label: 'Data & Privacy', icon: Trash2 },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link to="/journey-map" className="flex items-center gap-2.5">
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
        <div className="flex items-center gap-2">
          <Link
            to="/journey-map"
            className="text-xs bg-white border border-gray-200 px-3.5 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            ← Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs bg-white border border-gray-200 px-3.5 py-2 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-display font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{user.email}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Member since {joinDate}</p>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Sidebar */}
          <aside className="w-44 flex-shrink-0">
            <nav className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center justify-between gap-2 px-4 py-3 text-xs font-semibold border-b border-gray-100 last:border-b-0 transition-colors ${
                    activeSection === id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-2"><Icon className="w-3.5 h-3.5" />{label}</span>
                  {activeSection !== id && <ChevronRight className="w-3 h-3 opacity-30" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

            {activeSection === 'profile' && (
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 mb-0.5">Profile Information</h3>
                  <p className="text-xs text-gray-400">Update your personal details.</p>
                </div>

                {saveMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-medium text-emerald-700">
                    {saveMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
                    <input
                      type="text" required value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
                    <input
                      type="text" required value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input
                    type="email" disabled value={user.email}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed in the prototype.</p>
                </div>

                <div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeSection === 'security' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 mb-0.5">Security</h3>
                  <p className="text-xs text-gray-400">Manage your account security settings.</p>
                </div>

                <div className="border border-gray-200 p-4 rounded-xl bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Password</p>
                  <p className="text-xs text-gray-500 mb-3">Password changes are not available in the prototype build.</p>
                  <button disabled className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-medium text-gray-300 cursor-not-allowed">
                    Change Password (Coming Soon)
                  </button>
                </div>

                <div className="border border-gray-200 p-4 rounded-xl bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Active Sessions</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-800">Current Browser Session</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Logged in via localStorage — this device only</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="self-start flex items-center gap-2 text-xs bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out of All Sessions
                </button>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 mb-0.5">Data & Privacy</h3>
                  <p className="text-xs text-gray-400">Your data is stored locally in your browser. Nothing is sent to external servers.</p>
                </div>

                <div className="border border-blue-100 p-4 rounded-xl bg-blue-50/40">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Data Storage</p>
                  <p className="text-xs text-gray-600 leading-relaxed">All account data, vehicle timelines, and session information are stored exclusively in your browser's localStorage. No personal data leaves your device.</p>
                </div>

                <div className="border border-red-200 p-4 rounded-xl bg-red-50/50">
                  <p className="text-xs font-semibold text-red-600 mb-1">Danger Zone</p>
                  <p className="text-xs text-gray-600 mb-3">Permanently delete your account and all associated vehicle data. This cannot be undone.</p>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 text-xs bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer"
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
