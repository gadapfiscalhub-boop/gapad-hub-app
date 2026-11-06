'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  HardHat,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/selecionar-obra');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Preencha seu e-mail e senha de acesso.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithCredentials(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'Falha ao autenticar no servidor. Verifique suas credenciais.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner / Status PWA */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono uppercase tracking-wider text-[11px] text-slate-300">
            GADAP Field • Online
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px]">ERP Conectado</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10 mb-4">
            <HardHat className="w-9 h-9 text-slate-950 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            GADAP <span className="text-amber-400">Field</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Acesso exclusivo para Mestre de Obras e Engenharia de Campo
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs sm:text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
              >
                E-mail do Responsável
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mestre@gadap.com.br"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
              >
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Informação do Tenant */}
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center gap-3">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-tight">
                Identificação do Tenant (Empresa) é vinculada automaticamente na validação do token JWT.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-sm tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Validando Credenciais...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Entrar no Canteiro</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md mx-auto text-center pt-4">
        <p className="text-[11px] text-slate-500">
          GADAP Enterprise Suite • PWA Headless v1.0 • Modo Canteiro
        </p>
      </div>
    </div>
  );
}

