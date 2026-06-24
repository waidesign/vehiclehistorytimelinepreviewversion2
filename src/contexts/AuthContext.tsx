import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'firstName' | 'lastName'>>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'vht_users';
const SESSION_KEY = 'vht_session';

function getStoredUsers(): Record<string, { user: User; passwordHash: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const sessionRaw = localStorage.getItem(SESSION_KEY);
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session?.user) setUser(session.user);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = getStoredUsers();
    const key = email.toLowerCase().trim();
    const record = users[key];
    if (!record) throw new Error('No account found with this email.');
    if (record.passwordHash !== simpleHash(password)) throw new Error('Incorrect password.');
    setUser(record.user);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: record.user }));
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    const users = getStoredUsers();
    const key = email.toLowerCase().trim();
    if (users[key]) throw new Error('An account with this email already exists.');
    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      createdAt: new Date().toISOString(),
    };
    users[key] = { user: newUser, passwordHash: simpleHash(password) };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: newUser }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (updates: Partial<Pick<User, 'firstName' | 'lastName'>>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: updated }));
    const users = getStoredUsers();
    const key = user.email;
    if (users[key]) {
      users[key].user = updated;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
