
"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/types';
import { getSession } from '@/lib/session-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
        const session = await getSession();
        setUser(session);
        setLoading(false);

        // If there's no session and the user is not on the login page or consent page, redirect them.
        const isPublicPage = pathname === '/' || 
                           pathname === '/consent' || 
                           pathname.startsWith('/privacy-policy') || 
                           pathname.startsWith('/terms-and-conditions') || 
                           pathname.startsWith('/disclaimer');
        
        if (!session && !isPublicPage) {
          router.push('/');
        }
    };
    checkSession();
  }, [pathname, router]);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
