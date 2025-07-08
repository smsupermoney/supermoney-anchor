
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole } from '@/types';

const USER_DATA: Record<UserRole, Omit<User, 'role'>> = {
  manager: {
    name: "Sunita Sharma",
    email: "sunita.sharma@example.com",
  },
  cfo: {
    name: "Prakash Rao",
    email: "prakash.rao@example.com",
  },
  supply_chain_head: {
    name: "Ankit Desai",
    email: "ankit.desai@example.com",
  },
};

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = (role: UserRole) => {
    const newUser: User = { ...USER_DATA[role], role };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
