'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import {
  HardHat,
  ClipboardList,
  Clock,
  PackagePlus,
  ArrowRightLeft,
  LogOut,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { activeProject, activeProjectId } = useProject();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!activeProjectId) {
        router.replace('/selecionar-obra');
      }
    }
  }, [authLoading, isAuthenticated, activeProjectId, router]);

  if (authLoading || !activeProject) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <HardHat className="w-8 h-8 text-amber-500 animate-bounce mx-auto mb-2" />
          <p className="text-sm text-slate-400">Carregando canteiro de obras...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Apontamento de Ponto',
      desc: 'Registro diário de presença da equipe de campo',
      icon: Clock,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Hoje',
    },
    {
      title: 'Requisição de Materiais',
      desc: 'Solicitar insumos e ferramentas ao almoxarifado',
      icon: PackagePlus,
      color: 'from-amber-500 to-amber-600',
      badge: 'Almoxarifado',
    },
    {
      title: 'Diário de Obras (RDO)',
      desc: 'Clima, ocorrências e efetivo do dia no canteiro',
      icon: ClipboardList,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Obrigatório',
    },
    {
      title: 'Consulta Orçamentária',
      desc: 'Verificar centros de custo e saldo de insumos',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-600',
      badge: 'ERP Sync',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white">
                  GADAP Field
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  CANTEIRO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {user?.name || user?.email} • {user?.tenant_name || 'GADAP'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/selecionar-obra')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Trocar Obra</span>
            </button>
            <button
              onClick={logout}
              title="Sair"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto px-4 py-6 sm:px-6 flex-1 space-y-6">
        {/* Banner Obra Ativa */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Obra Ativa
                </span>
                {activeProject.code && (
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {activeProject.code}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeProject.name}
              </h2>
              {activeProject.address && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {activeProject.address}
                    {activeProject.city ? ` • ${activeProject.city}` : ''}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/selecionar-obra')}
              className="shrink-0 p-2 text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
            >
              Alterar
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Injetando no cabeçalho:</span>
            <code className="text-amber-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              X-Project-ID: {activeProject.id}
            </code>
          </div>
        </div>

        {/* Grade de Módulos Operacionais */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Módulos de Canteiro
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {quickActions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-slate-950 font-bold shadow-md`}
                    >
                      <Icon className="w-5 h-5 text-slate-950" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-3xl mx-auto px-4 py-4 text-center text-[11px] text-slate-500 border-t border-slate-900">
        GADAP Field PWA • Conectado à API Central Headless
      </footer>
    </div>
  );
}
