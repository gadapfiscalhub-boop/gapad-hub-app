"use client";

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/apiClient';
import { HardHat, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient<{ token: string; user: any; access_token?: string }>('/auth/login', {
        method: 'POST',
        data: { email, password },
      });

      const token = response.token || response.access_token || '';
      signIn(token, response.user || { email });
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Verifique os dados introduzidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#060b13] flex flex-col justify-between px-4 py-8 sm:items-center sm:justify-center selection:bg-emerald-500 selection:text-slate-950">
      {/* Indicador superior de status do sistema técnico */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-between text-xs text-slate-400 pb-4 sm:hidden">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0d1522] border border-[#19273c] text-[11px] font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Terminal de Canteiro
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>GADAP Hub v2.4</span>
        </div>
      </div>

      {/* Cartão de Login no design técnico exato do ERP */}
      <div className="w-full max-w-sm mx-auto bg-[#0d1522] rounded-2xl p-6 sm:p-8 border border-[#19273c] shadow-2xl shadow-black/80">
        <div className="text-left mb-6">
          {/* Logo Técnico com HardHat em tom Emerald/Teal */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-xl mb-4 shadow-lg shadow-emerald-500/20">
            <HardHat className="w-7 h-7 text-slate-950 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">GADAP Field</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase">
              Canteiro
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controle de avanço, orçamentos rápidos e ponto do canteiro.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-xs font-medium flex items-center gap-2.5">
            <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-0.5">
              E-mail do Responsável
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#060b13] border border-[#19273c] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              placeholder="mestre@gadap.com.br"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-0.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 pr-11 rounded-xl bg-[#060b13] border border-[#19273c] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                aria-label="Alternar visibilidade da senha"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Botão de Ação no padrão Verde Esmeralda/Teal (#10b981) do ERP Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Acessar Canteiro</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Rodapé informativo estilo ERP */}
      <footer className="text-center text-xs text-slate-500 pb-2">
        GADAP Hub • Enterprise v2.4 • Módulo de Campo
      </footer>
    </main>
  );
}
