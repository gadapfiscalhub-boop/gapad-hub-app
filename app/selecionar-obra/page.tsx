"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import {
  HardHat,
  Building2,
  MapPin,
  ChevronRight,
  LogOut,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  DollarSign
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  address: string;
  status: string;
  code?: string;
  client?: string;
  contract_value?: string;
  cronograma?: string;
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

  const fetchProjects = async () => {
    setLoading(true);
    setError('');

    try {
      let data: Project[] = [];
      try {
        data = await apiClient<Project[]>('/projects/active');
      } catch (activeErr: any) {
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
        const hasCache = loadFromCache();
        if (!hasCache) {
          // Obras de modelo idênticas ao print do ERP Principal
          const fallback: Project[] = [
            {
              id: 'obr_lorena_01',
              name: 'Orçamento Simplificado - Manutenção Piscina e Muro Lorena',
              address: 'São Paulo/SP',
              status: 'Planejamento',
              code: 'OBR-ORC-SIMP-1.5-192617',
              client: 'Condomínio Edifício Lorena',
              contract_value: 'R$ 14.950,00',
              cronograma: '25/10/2026 - 25/10/2027',
            },
            {
              id: 'obr_aurora_02',
              name: 'Residencial Aurora Prime - Torre A & B',
              address: 'Av. Paulista, 1842 - Bela Vista, São Paulo/SP',
              status: 'Em Execução',
              code: 'OBR-2026-02',
              client: 'Incoporadora Prime S.A.',
              contract_value: 'R$ 530.000,00',
              cronograma: '01/02/2026 - 30/11/2027',
            },
            {
              id: 'obr_anhanguera_03',
              name: 'Centro Logístico Anhanguera II',
              address: 'Rod. Anhanguera, km 54, Jundiaí/SP',
              status: 'Em Execução',
              code: 'OBR-2026-03',
              client: 'GLP Logística',
              contract_value: 'R$ 1.250.000,00',
              cronograma: '15/01/2026 - 15/08/2027',
            },
          ];
          setProjects(fallback);
          saveToCache(fallback);
        }
      }
    } catch (err: any) {
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProjects();
  }, [isAuthenticated, router]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [projects, searchTerm]);

  return (
    <main className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col pb-12 selection:bg-emerald-500 selection:text-slate-950">
      {/* Barra de Topo Técnica no estilo exato do GADAP Hub */}
      <header className="sticky top-0 z-20 bg-[#060b13]/95 backdrop-blur-md border-b border-[#19273c] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0d1522] border border-[#19273c] flex items-center justify-center text-emerald-400 font-bold">
              <HardHat className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">GADAP Hub</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                  Campo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {user?.name || user?.email || 'Mestre de Campo'} • Empresa Teste
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-[#0d1522] border border-transparent hover:border-rose-900/40 transition-colors"
            title="Terminar sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal com Cartões Técnicos */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 pt-5 space-y-4">
        {/* Cabeçalho da Seção com Ícone Técnico */}
        <div className="bg-[#0d1522] border border-[#19273c] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <HardHat className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white">
                  Gestão de Obras & Empreendimentos
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Selecione o canteiro ativo para sincronizar orçamentos, materiais e ponto.
                </p>
              </div>
            </div>

            {isFromCache && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-600/50">
                Cache Offline
              </span>
            )}
          </div>

          {/* Cards de Métricas Resumidas idênticos ao GADAP Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-[#19273c]/80">
            <div className="bg-[#060b13] p-2.5 rounded-xl border border-[#19273c]">
              <span className="text-[10px] text-slate-400 block">Obras em Andamento</span>
              <span className="text-sm sm:text-base font-black text-white">2</span>
              <span className="text-[9px] text-emerald-400 block mt-0.5">Canteiros ativos</span>
            </div>

            <div className="bg-[#060b13] p-2.5 rounded-xl border border-[#19273c]">
              <span className="text-[10px] text-slate-400 block">Contratos Sob Gestão</span>
              <span className="text-sm sm:text-base font-black text-white font-mono">R$ 544.950</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">3 contrato(s)</span>
            </div>

            <div className="bg-[#060b13] p-2.5 rounded-xl border border-[#19273c] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block">Retenção Técnica Média</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">5.0%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Garantia contratual</span>
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa Técnica com Ícone */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome da obra, código, CNO ou cliente..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0d1522] border border-[#19273c] text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            onClick={fetchProjects}
            className="h-11 px-3 rounded-xl bg-[#0d1522] border border-[#19273c] hover:border-slate-600 text-slate-300 flex items-center justify-center transition-all"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchProjects} className="underline text-xs font-semibold ml-2">Tentar de novo</button>
          </div>
        )}

        {/* Listagem de Obras / Tabela de Canteiro Estilo GADAP Hub */}
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-[#0d1522]/80 border border-[#19273c] animate-pulse p-4"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-[#19273c] bg-[#0d1522]/50">
                <Building2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-300 text-xs font-semibold">Nenhuma obra localizada</p>
                <p className="text-slate-500 text-[11px] mt-1">Verifique o termo pesquisado.</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => selectProject(project.id)}
                  className="group p-4 rounded-xl border border-[#19273c] bg-[#0d1522] hover:bg-[#111c2e] hover:border-emerald-500/50 transition-all cursor-pointer shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Código da Obra e Status Pill */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {project.code && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#060b13] text-slate-300 border border-[#19273c]">
                            {project.code}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {project.status || 'Em Execução'}
                        </span>
                      </div>

                      {/* Nome da Obra */}
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                        {project.name}
                      </h3>

                      {/* Cliente e Localidade */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        {project.client && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-300 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{project.client}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{project.address}</span>
                        </div>
                      </div>

                      {/* Metadados Contratuais */}
                      {project.contract_value && (
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                          <span>Valor: <strong className="text-emerald-400">{project.contract_value}</strong></span>
                          {project.cronograma && (
                            <span className="hidden sm:inline text-slate-500">• Cronograma: {project.cronograma}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botão de Entrada */}
                    <div className="w-8 h-8 rounded-lg bg-[#060b13] group-hover:bg-emerald-500 flex items-center justify-center text-slate-400 group-hover:text-slate-950 transition-all shrink-0 self-center">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
