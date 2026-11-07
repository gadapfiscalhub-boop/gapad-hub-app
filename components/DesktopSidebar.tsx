'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Truck,
  Camera,
  Clock,
  HardHat,
  ArrowRightLeft,
  LogOut,
  ShieldAlert,
  Calculator
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { activeProject, signOut, user } = useApp();

  if (pathname === '/login' || pathname === '/selecionar-obra') {
    return null;
  }

  const navLinks = [
    {
      label: 'Cronograma Gantt',
      href: '/cronograma',
      icon: CalendarDays,
      badge: 'Físico',
    },
    {
      label: 'Auditoria de Extras',
      href: '/terceirizados/auditoria',
      icon: ShieldAlert,
      badge: 'Controle',
    },
    {
      label: 'Recebimento de Carga',
      href: '/logistica/pendentes',
      icon: Truck,
      badge: 'Almoxarifado',
    },
    {
      label: 'Orçamentos Rápidos',
      href: '/orcamentos/novo',
      icon: Calculator,
      badge: 'Markup',
    },
    {
      label: 'Diário & Fotos',
      href: '/diario',
      icon: Camera,
      badge: 'RDO',
    },
    {
      label: 'Ponto Eletrônico',
      href: '/ponto',
      icon: Clock,
      badge: 'GPS',
    },
  ];

  return (
    <aside className="w-64 bg-[#0d1522] border-r border-[#19273c] flex flex-col justify-between shrink-0 h-screen sticky top-0 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header do Container/Escritório */}
      <div className="p-5 border-b border-[#19273c]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <HardHat className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-wide">GADAP Field</span>
              <span className="text-[9px] font-mono font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                ESCRITÓRIO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Container de Engenharia</p>
          </div>
        </div>

        {/* Obra Ativa no Escritório */}
        {activeProject && (
          <div className="mt-4 p-3 rounded-xl bg-[#060b13] border border-[#19273c]">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold mb-1">
              <span>Obra em Gestão</span>
              <Link
                href="/selecionar-obra"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold normal-case"
              >
                <ArrowRightLeft className="w-3 h-3" />
                Trocar
              </Link>
            </div>
            <p className="text-xs font-bold text-white truncate" title={activeProject.name}>
              {activeProject.name}
            </p>
            {activeProject.code && (
              <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                {activeProject.code}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navegação Vertical Desktop */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1.5 block">
          Módulos de Gestão Técnica
        </span>

        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2e] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isActive
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                    : 'bg-[#060b13] text-slate-500 border-[#19273c]'
                }`}
              >
                {item.badge}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé com Operador e Logout */}
      <div className="p-4 border-t border-[#19273c] bg-[#060b13]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Engenheiro Responsável'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={signOut}
            title="Sair do Sistema"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
