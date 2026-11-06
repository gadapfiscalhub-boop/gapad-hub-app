'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Project } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Carregar sessão salva no localStorage
    const savedToken = localStorage.getItem('gadap_token');
    const savedUser = localStorage.getItem('gadap_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Falha ao restaurar sessão:', err);
        localStorage.removeItem('gadap_token');
        localStorage.removeItem('gadap_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // 1. Tentar autenticação via Supabase Auth (onde estão as credenciais dos usuários)
      let accessToken: string | null = null;
      let userData: User | null = null;

      const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!supaError && supaData?.session) {
        accessToken = supaData.session.access_token;
        const supaUser = supaData.user;
        const metadata = supaUser.user_metadata || {};

        userData = {
          id: supaUser.id,
          email: supaUser.email || email,
          name: metadata.name || metadata.full_name || email.split('@')[0],
          tenant_id: metadata.tenant_id || metadata.company_id || 'default-tenant',
          tenant_name: metadata.tenant_name || metadata.company_name || 'GADAP Construtora',
          role: metadata.role || 'mestre_obras',
        };
      } else {
        // 2. Fallback: tentar endpoint REST do FastAPI se configurado (/auth/login ou /token)
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || 'https://gapad-hub.vercel.app/api/v1';

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error(supaError?.message || 'Falha ao autenticar. Verifique email e senha.');
        }

        const resData = await response.json();
        accessToken = resData.access_token || resData.token;
        userData = {
          id: resData.user?.id || 'usr_default',
          email: resData.user?.email || email,
          name: resData.user?.name || email.split('@')[0],
          tenant_id: resData.tenant_id || resData.user?.tenant_id || 'default-tenant',
          tenant_name: resData.tenant_name || resData.user?.tenant_name || 'GADAP Construtora',
          role: resData.user?.role || 'mestre_obras',
        };
      }

      if (!accessToken || !userData) {
        throw new Error('Não foi possível obter o token de autenticação.');
      }

      // Persistir sessão
      localStorage.setItem('gadap_token', accessToken);
      localStorage.setItem('gadap_user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);

      // Redirecionamento obrigatório para seleção de obra
      router.push('/selecionar-obra');
    } catch (error: any) {
      console.error('Erro de login:', error);
      throw error;
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
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}

