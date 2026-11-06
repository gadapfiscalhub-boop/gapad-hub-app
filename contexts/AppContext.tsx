'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Project } from '@/types';
import { supabase } from '@/lib/supabase';

interface AppContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string, user: any) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('gadap_token');
    const savedUser = localStorage.getItem('gadap_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('gadap_token');
        localStorage.removeItem('gadap_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (newToken: string, newUser: any) => {
    const formattedUser: User = {
      id: newUser?.id || 'usr_default',
      email: newUser?.email || '',
      name: newUser?.name || newUser?.email?.split('@')[0] || 'Operador de Campo',
      tenant_id: newUser?.tenant_id || newUser?.company_id || 'default-tenant',
      tenant_name: newUser?.tenant_name || newUser?.company_name || 'GADAP Construtora',
      role: newUser?.role || 'mestre_obras',
    };

    localStorage.setItem('gadap_token', newToken);
    localStorage.setItem('gadap_user', JSON.stringify(formattedUser));
    setToken(newToken);
    setUser(formattedUser);

    // Redirecionamento obrigatório para seleção de obra
    router.push('/selecionar-obra');
  };

  const loginWithCredentials = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!supaError && supaData?.session) {
        signIn(supaData.session.access_token, supaData.user);
      } else {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || 'https://gapad-hub.vercel.app/api/v1';

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Credenciais inválidas. Verifique os dados introduzidos.');
        }

        const resData = await response.json();
        signIn(resData.access_token || resData.token, resData.user || { email });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gadap_token');
    localStorage.removeItem('gadap_user');
    localStorage.removeItem('gadap_active_project_id');
    localStorage.removeItem('gadap_active_project_data');
    setToken(null);
    setUser(null);
    supabase.auth.signOut().catch(() => {});
    router.push('/login');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        signIn,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
}

// Aliases para retrocompatibilidade
export const AuthProvider = AppProvider;
export const useAuth = useApp;

