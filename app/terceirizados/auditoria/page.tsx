'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { apiClient } from '@/lib/apiClient';
import { SubcontractorExtraCharge } from '@/types';
import { PhotoThumbnailViewer } from '@/components/PhotoThumbnailViewer';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  RefreshCw,
  FileCheck2,
  DollarSign,
  Building,
  UserCheck
} from 'lucide-react';

export default function AuditoriaTerceirizadosPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { activeProject, activeProjectId, isAuthenticated, isLoading: authLoading } = useApp();

  const [charges, setCharges] = useState<SubcontractorExtraCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'disputed'>('all');
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<string>('all');

  // Proteção: Apenas Desktop (>= 1024px)
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.replace('/login');
      else if (!activeProjectId) router.replace('/selecionar-obra');
      else if (!isDesktop) router.replace('/');
    }
  }, [authLoading, isAuthenticated, activeProjectId, isDesktop, router]);

  const fetchCharges = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    setError('');

    try {
      let data: SubcontractorExtraCharge[] = [];
      try {
        data = await apiClient<SubcontractorExtraCharge[]>(`/projects/${activeProjectId}/subcontractor-extras`);
      } catch (e) {
        // Mock de auditoria detalhada com histórico completo
        data = [
          {
            id: 'ext-001',
            subcontractor_name: 'Alexandre Eletricista & Cia',
            trade: 'Instalações Elétricas',
            amount: 1000.0,
            reason: '10 caixinhas 4x2 adicionais no drywall da sala e passagem de conduíte corrugado',
            evidence_description: 'Rasgos executados conforme alteração do projeto luminotécnico',
            evidence_photos: [
              'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80',
            ],
            status: 'pending',
            created_at: '2026-11-07T08:30:00Z',
            location: 'Apartamento 82 - Sala de Estar',
            unit_price: 100.0,
            quantity: 10,
            unit: 'pontos',
          },
          {
            id: 'ext-002',
            subcontractor_name: 'Alexandre Eletricista & Cia',
            trade: 'Instalações Elétricas',
            amount: 450.0,
            reason: 'Instalação de circuito independente para ar-condicionado 24.000 BTUs',
            evidence_photos: [
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            ],
            status: 'approved',
            created_at: '2026-10-29T14:15:00Z',
            location: 'Suíte Master',
            audited_by: 'Eng. Carlos Mendonça',
            audited_at: '2026-10-30T09:00:00Z',
          },
          {
            id: 'ext-003',
            subcontractor_name: 'Alexandre Eletricista & Cia',
            trade: 'Instalações Elétricas',
            amount: 320.0,
            reason: 'Troca de fiação danificada por umidade externa',
            evidence_photos: [],
            status: 'disputed',
            dispute_reason: 'Dano ocasionado por falha de isolamento da própria equipe do empreiteiro.',
            created_at: '2026-10-15T11:00:00Z',
            location: 'Área Técnica',
            audited_by: 'Mestre Gilberto',
            audited_at: '2026-10-16T16:20:00Z',
          },
          {
            id: 'ext-004',
            subcontractor_name: 'Gesso & Molduras São Paulo',
            trade: 'Forro e Drywall',
            amount: 850.0,
            reason: 'Rebaixamento de teto no hall de entrada com cortineiro iluminado',
            evidence_photos: [
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
            ],
            status: 'approved',
            created_at: '2026-11-02T16:40:00Z',
            location: 'Hall de Entrada',
            audited_by: 'Eng. Carlos Mendonça',
            audited_at: '2026-11-03T10:00:00Z',
          },
        ];
      }

      setCharges(data);
    } catch (err: any) {
      setError(err?.message || 'Falha ao buscar auditoria de serviços extras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProjectId && isDesktop) {
      fetchCharges();
    }
  }, [activeProjectId, isDesktop]);

  // Lista única de empreiteiros para filtro rápido
  const subcontractors = useMemo(() => {
    const set = new Set<string>();
    charges.forEach((c) => set.add(c.subcontractor_name));
    return Array.from(set);
  }, [charges]);

  // Filtragem combinada
  const filteredCharges = useMemo(() => {
    return charges.filter((c) => {
      const matchSearch =
        c.subcontractor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchSub = selectedSubcontractor === 'all' || c.subcontractor_name === selectedSubcontractor;

      return matchSearch && matchStatus && matchSub;
    });
  }, [charges, searchTerm, statusFilter, selectedSubcontractor]);

  // Métricas financeiras de auditoria
  const metrics = useMemo(() => {
    const totalExtraClaimed = charges.reduce((acc, c) => acc + c.amount, 0);
    const totalApproved = charges.filter((c) => c.status === 'approved').reduce((acc, c) => acc + c.amount, 0);
    const totalPending = charges.filter((c) => c.status === 'pending').reduce((acc, c) => acc + c.amount, 0);
    const totalDisputed = charges.filter((c) => c.status === 'disputed').reduce((acc, c) => acc + c.amount, 0);

    return { totalExtraClaimed, totalApproved, totalPending, totalDisputed };
  }, [charges]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (!isDesktop || !activeProject) return null;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#19273c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Controle de Custos & Contratos
            </span>
            <span className="text-xs font-mono text-slate-500">• {activeProject.name}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            Dossiê de Auditoria: Serviços Extras de Terceirizados
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Histórico completo de cobranças extras por empreiteiro, justificativas técnicas e evidências fotográficas.
          </p>
        </div>

        <button
          onClick={fetchCharges}
          disabled={loading}
          className="h-10 px-3.5 rounded-xl bg-[#0d1522] border border-[#19273c] hover:border-slate-600 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Atualizar Dossiê</span>
        </button>
      </div>

      {/* Cards de Métricas da Auditoria */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#0d1522] border border-[#19273c] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total de Extras Pleiteados
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {formatCurrency(metrics.totalExtraClaimed)}
          </span>
          <span className="text-[10px] text-slate-500">{charges.length} apontamento(s) registrado(s)</span>
        </div>

        <div className="bg-[#0d1522] border border-amber-500/30 p-4 rounded-2xl bg-gradient-to-br from-[#0d1522] to-amber-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
            Pendentes de Auditoria
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            {formatCurrency(metrics.totalPending)}
          </span>
          <span className="text-[10px] text-amber-300/80">Requer deliberação no campo</span>
        </div>

        <div className="bg-[#0d1522] border border-[#19273c] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
            Aprovados para Pagamento
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {formatCurrency(metrics.totalApproved)}
          </span>
          <span className="text-[10px] text-slate-500">Integrados à medição mensal</span>
        </div>

        <div className="bg-[#0d1522] border border-[#19273c] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
            Contestados (Glosados)
          </span>
          <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">
            {formatCurrency(metrics.totalDisputed)}
          </span>
          <span className="text-[10px] text-slate-500">Economia protegida</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#0d1522] border border-[#19273c] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por empreiteiro, descrição do serviço ou ambiente..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#060b13] border border-[#19273c] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Filtro por Empreiteiro */}
          <select
            value={selectedSubcontractor}
            onChange={(e) => setSelectedSubcontractor(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#060b13] border border-[#19273c] text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Empreiteiros</option>
            {subcontractors.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Filtro por Status */}
          <div className="flex items-center gap-1 bg-[#060b13] p-1 rounded-xl border border-[#19273c]">
            {(['all', 'pending', 'approved', 'disputed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all'
                  ? 'Todos'
                  : st === 'pending'
                  ? 'Pendentes'
                  : st === 'approved'
                  ? 'Aprovados'
                  : 'Contestados'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Auditoria Detalhada */}
      <div className="bg-[#0d1522] border border-[#19273c] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#060b13] border-b border-[#19273c] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-4">Empreiteiro / Disciplina</th>
                <th className="py-3.5 px-4">Descrição do Extra</th>
                <th className="py-3.5 px-4">Local</th>
                <th className="py-3.5 px-4 text-right">Valor Pleiteado</th>
                <th className="py-3.5 px-4 text-center">Evidências</th>
                <th className="py-3.5 px-4 text-center">Status Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#19273c]/70 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    Carregando dossiê de terceirizados...
                  </td>
                </tr>
              ) : filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    Nenhum serviço extra encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredCharges.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#111c2e] transition-colors">
                      {/* Data */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>

                      {/* Empreiteiro */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <strong className="text-white block font-bold">{item.subcontractor_name}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">{item.trade}</span>
                      </td>

                      {/* Descrição do Motivo */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-200 line-clamp-2 leading-relaxed" title={item.reason}>
                          {item.reason}
                        </p>
                        {item.dispute_reason && (
                          <p className="text-[10px] text-rose-300 font-medium mt-1 bg-rose-950/40 p-1 rounded border border-rose-900/50">
                            <strong>Motivo Glosa:</strong> {item.dispute_reason}
                          </p>
                        )}
                      </td>

                      {/* Localidade */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        {item.location || 'Geral'}
                      </td>

                      {/* Valor */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                        <span className="text-emerald-400">{formatCurrency(item.amount)}</span>
                      </td>

                      {/* Miniaturas de Evidência Fotográfica */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex justify-center">
                          <PhotoThumbnailViewer
                            photos={item.evidence_photos}
                            title={`Evidência: ${item.subcontractor_name}`}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Aprovado
                          </span>
                        )}
                        {item.status === 'disputed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            Contestado
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

