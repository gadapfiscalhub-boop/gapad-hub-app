'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { useRouter } from 'next/navigation';
import { Project } from '@/types';
import {
  HardHat,
  Building,
  MapPin,
  ChevronRight,
  LogOut,
  RefreshCw,
  Search,
  Building2,
  Clock,
  Briefcase
} from 'lucide-react';

export default function SelecionarObraPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { projects, isLoadingProjects, selectProject, refreshProjects } = useProject();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated) {
      refreshProjects();
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSelectObra = (project: Project) => {
    setSelectedId(project.id);
    selectProject(project);

    // Feedback visual imediato antes da navegação para o dashboard
    setTimeout(() => {
      router.push('/');
    }, 200);
  };

  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.code?.toLowerCase().includes(term) ||
      p.city?.toLowerCase().includes(term) ||
      p.address?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar / Perfil e Empresa */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <HardHat className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                {user?.name || user?.email || 'Mestre de Obras'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                <Building2 className="w-3 h-3" />
                <span>{user?.tenant_name || 'GADAP Construtora'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sair do Aplicativo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desconectar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto px-4 py-6 sm:px-6 flex-1">
        {/* Title & Instructions */}
        <div className="mb-6">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-2">
            Contexto Ativo Obrigatório
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Selecione a Obra de Trabalho
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Todas as ordens de material, diários de obra e apontamentos de ponto serão vinculados à obra selecionada.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>
          <button
            onClick={() => refreshProjects()}
            disabled={isLoadingProjects}
            title="Atualizar lista de obras"
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-amber-400 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingProjects ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Listagem de Obras */}
        <div className="space-y-3">
          {isLoadingProjects && projects.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-7 h-7 mx-auto animate-spin text-amber-500 mb-3" />
              <p className="text-sm font-medium">Buscando obras ativas no ERP...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-10 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
              <Building className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-300 font-semibold">Nenhuma obra encontrada</p>
              <p className="text-xs text-slate-500 mt-1">
                Verifique o termo pesquisado ou solicite ao administrador a liberação do seu acesso.
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isSelected = selectedId === project.id;
              return (
                <div
                  key={project.id}
                  onClick={() => handleSelectObra(project)}
                  className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-amber-500/40 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800/80 group-hover:bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        <Building className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                            {project.name}
                          </h2>
                          {project.code && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                              {project.code}
                            </span>
                          )}
                        </div>

                        {project.address && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">
                              {project.address}
                              {project.city ? ` • ${project.city}` : ''}
                            </span>
                          </div>
                        )}

                        {project.manager_name && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Briefcase className="w-3 h-3" />
                            <span>Resp: {project.manager_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center self-center shrink-0 pl-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-amber-500 group-hover:text-slate-950'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Barra de Status no rodapé do Card */}
                  <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Em Execução
                    </span>
                    <span className="text-amber-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
                      Entrar no Canteiro &rarr;
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-2xl mx-auto px-4 py-4 text-center text-[11px] text-slate-500 border-t border-slate-900">
        Ambiente Seguro • Cabeçalho <code className="text-slate-400 font-mono">X-Project-ID</code> será injetado em todas as chamadas.
      </footer>
    </div>
  );
}

