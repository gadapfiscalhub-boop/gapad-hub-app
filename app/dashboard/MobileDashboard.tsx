'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SubcontractorExtraCharge } from '@/types';
import { ExtraChargeAlertCard } from '@/components/ExtraChargeAlertCard';
import {
  HardHat,
  ClipboardList,
  Clock,
  PackagePlus,
  Truck,
  ArrowRightLeft,
  LogOut,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

export default function MobileDashboardPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { user, activeProject, activeProjectId, isAuthenticated, isLoading: authLoading, signOut } = useApp();

  // Estado do Alerta Urgente de Serviço Extra de Campo
  const [extraAlert, setExtraAlert] = useState<SubcontractorExtraCharge | null>({
    id: 'ext-001',
    subcontractor_name: 'Alexandre',
    trade: 'Instalações Elétricas',
    amount: 1000.0,
    reason: '10 caixinhas',
    evidence_photos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    ],
    status: 'pending',
    created_at: new Date().toISOString(),
  });

  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!activeProjectId) {
        router.replace('/selecionar-obra');
      } else if (isDesktop) {
        router.replace('/cronograma');
      }
    }
  }, [authLoading, isAuthenticated, activeProjectId, isDesktop, router]);

  const handleActionComplete = (chargeId: string, newStatus: 'approved' | 'disputed') => {
    setExtraAlert(null);
    setAlertFeedback(
      newStatus === 'approved'
        ? '✅ Cobrança de Alexandre (R$ 1.000,00) aprovada com sucesso!'
        : '🛑 Cobrança de Alexandre contestada. O setor financeiro foi notificado.'
    );
    setTimeout(() => setAlertFeedback(null), 5000);
  };

  if (authLoading || !activeProject) {
    return (
      <div className="min-h-screen bg-[#060b13] flex items-center justify-center text-slate-400 text-xs">
        <HardHat className="w-8 h-8 text-emerald-400 animate-bounce mx-auto mb-2" />
        <p>Acessando canteiro de obras...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Recebimento de Carga',
      desc: 'Conferência de itens e fotos do canhoto',
      icon: Truck,
      href: '/logistica/pendentes',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Almoxarifado',
    },
    {
      title: 'Apontamento de Ponto',
      desc: 'Registro diário da equipe via GPS',
      icon: Clock,
      href: '/ponto',
      color: 'from-blue-500 to-indigo-600',
      badge: 'GPS Ativo',
    },
    {
      title: 'Diário de Obras (RDO)',
      desc: 'Clima, efetivo e fotos com a câmera',
      icon: ClipboardList,
      href: '/diario',
      color: 'from-teal-500 to-emerald-600',
      badge: 'Obrigatório',
    },
    {
      title: 'Orçamento Rápido',
      desc: 'Cálculo de custo e markup no canteiro',
      icon: TrendingUp,
      href: '/orcamentos/novo',
      color: 'from-amber-500 to-amber-600',
      badge: 'Markup %',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Top Header Mobile */}
      <header className="sticky top-0 z-20 bg-[#060b13]/95 backdrop-blur-md border-b border-[#19273c] px-4 py-3 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white">GADAP Field</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase">
                  CANTEIRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {user?.name || user?.email} • {activeProject.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.push('/selecionar-obra')}
              className="p-1.5 rounded-lg text-xs font-semibold bg-[#0d1522] hover:bg-slate-800 text-slate-300 border border-[#19273c]"
              title="Trocar Obra"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              onClick={signOut}
              title="Sair"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Mobile */}
      <main className="max-w-md w-full mx-auto px-4 py-5 flex-1 space-y-4">
        {/* Feedback de Deliberação */}
        {alertFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{alertFeedback}</span>
          </div>
        )}

        {/* 1. REQUISITO OBRIGATÓRIO: CARD DE NOTIFICAÇÃO URGENTE DE SERVIÇO EXTRA */}
        {extraAlert && activeProjectId && (
          <ExtraChargeAlertCard
            charge={extraAlert}
            projectId={activeProjectId}
            onActionComplete={handleActionComplete}
          />
        )}

        {/* Banner Obra Ativa */}
        <div className="bg-[#0d1522] border border-[#19273c] rounded-2xl p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Obra Ativa
              </span>
              <h2 className="text-base font-bold text-white leading-tight">
                {activeProject.name}
              </h2>
              {activeProject.address && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{activeProject.address}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/selecionar-obra')}
              className="text-xs text-emerald-400 hover:underline font-semibold shrink-0"
            >
              Trocar
            </button>
          </div>
        </div>

        {/* Módulos Operacionais Rápidos */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1 block">
            Ações Rápidas de Campo
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => router.push(item.href)}
                  className="bg-[#0d1522] hover:bg-[#111c2e] border border-[#19273c] hover:border-emerald-500/40 rounded-2xl p-3.5 transition-all cursor-pointer shadow-md active:scale-95 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-slate-950 font-bold shadow-md`}
                    >
                      <Icon className="w-5 h-5 text-slate-950" />
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-slate-400 bg-[#060b13] px-1.5 py-0.5 rounded border border-[#19273c]">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
