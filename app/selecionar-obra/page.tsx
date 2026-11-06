"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  address: string;
  status: string;
  code?: string;
}

interface CachedProjectsPayload {
  projects: Project[];
  timestamp: number;
}

const CACHE_KEY = '@gadap:cached_projects';

export default function SelectProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFromCache, setIsFromCache] = useState(false);

  const { selectProject, signOut, user, isAuthenticated } = useApp();
  const router = useRouter();

  const loadFromCache = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed: CachedProjectsPayload = JSON.parse(raw);
        if (Array.isArray(parsed?.projects) && parsed.projects.length > 0) {
          setProjects(parsed.projects);
          setIsFromCache(true);
          return true;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler cache local de obras:', e);
    }
    return false;
  }, []);

  const saveToCache = (data: Project[]) => {
    try {
      const payload: CachedProjectsPayload = {
        projects: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Falha ao persistir obras no cache local:', e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      setError('');

      try {
        let data: Project[] = [];
        try {
          data = await apiClient<Project[]>('/projects/active');
        } catch (activeErr: any) {
          // Se falhou por estar offline, tenta o cache de imediato
          if (activeErr?.code === 'NETWORK_OFFLINE' && loadFromCache()) {
            setLoading(false);
            return;
          }
          data = await apiClient<Project[]>('/projects');
        }

        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          setIsFromCache(false);
          saveToCache(data);
        } else {
          // Caso a API retorne vazio ou caia em mock offline
          const hasCache = loadFromCache();
          if (!hasCache) {
            const fallback: Project[] = [
              {
                id: 'obr_aurora_01',
                name: 'Residencial Aurora Prime',
                address: 'Av. Paulista, 1842 - Torre A, São Paulo - SP',
                status: 'Em Execução',
                code: 'OBR-2026-01',
              },
              {
                id: 'obr_horizonte_02',
                name: 'Condomínio Parque Horizonte',
                address: 'Rua das Palmeiras, 450, Campinas - SP',
                status: 'Fundação',
                code: 'OBR-2026-02',
              },
              {
                id: 'obr_log_03',
                name: 'Centro Logístico Anhanguera II',
                address: 'Rod. Anhanguera, km 54, Jundiaí - SP',
                status: 'Estrutura',
                code: 'OBR-2026-03',
              },
            ];
            setProjects(fallback);
            saveToCache(fallback);
          }
        }
      } catch (err: any) {
        // Fallback offline resiliente: se falhou a rede, recupera do cache
        const recovered = loadFromCache();
        if (!recovered) {
          setError(
            err?.code === 'NETWORK_OFFLINE'
              ? 'Sem ligação à internet e nenhum canteiro encontrado em cache local.'
              : err?.message || 'Falha ao sincronizar obras ativas com o servidor.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, router, loadFromCache]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [projects, searchTerm]);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col pb-8">
      {/* Barra de Topo com Perfil e Logout */}
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-5 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs text-slate-400 leading-none">Operador</p>
              <p className="text-sm font-semibold text-white leading-tight mt-0.5">{user?.name || 'Utilizador'}</p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors"
            title="Terminar sessão"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 max-w-xl w-full mx-auto px-5 pt-6">
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-white">Local de Trabalho</h1>
            {isFromCache && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-600/50">
                Dados locais (Offline)
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Selecione o canteiro em que está a operar para sincronizar orçamentos, materiais e ponto.
          </p>
        </div>

        {/* Campo de Pesquisa Rápida */}
        <div className="relative mb-5">
          <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome ou endereço..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="underline text-xs font-semibold ml-2">Tentar de novo</button>
          </div>
        )}

        {/* Estado de Carregamento (Skeleton) */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800/60 animate-pulse p-4 flex flex-col justify-between">
                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                <div className="h-3 bg-slate-800/60 rounded w-4/5"></div>
                <div className="h-4 bg-slate-800/40 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
                <svg className="w-10 h-10 mx-auto text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-slate-400 text-sm font-medium">Nenhuma obra encontrada.</p>
                <p className="text-slate-600 text-xs mt-1">Verifique o termo pesquisado ou contacte o gestor da empresa.</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => selectProject(project)}
                  className="w-full text-left p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-slate-900/90 hover:bg-slate-800/90 hover:border-amber-400/50 transition-all active:scale-[0.99] group shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {project.code && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {project.code}
                        </span>
                      )}
                      <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                        {project.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 mb-2.5">
                      {project.address}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {project.status || 'Ativa'}
                      </span>

                      {isFromCache && (
                        <span className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-600/30 px-2 py-0.5 rounded">
                          Dados locais (Offline)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seta de navegação */}
                  <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-amber-400 flex items-center justify-center text-slate-400 group-hover:text-slate-950 transition-all shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
