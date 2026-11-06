'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calculator,
  Camera,
  Clock,
  HardHat
} from 'lucide-react';
import { useProject } from '@/context/ProjectContext';

const NAV_ITEMS = [
  {
    label: 'Início',
    href: '/',
    icon: Home,
  },
  {
    label: 'Diário & Fotos',
    href: '/diario',
    activePattern: /^\/diario/,
    icon: Camera,
  },
  {
    label: 'Orçamentos',
    href: '/orcamentos/novo',
    activePattern: /^\/orcamentos/,
    icon: Calculator,
  },
  {
    label: 'Ponto GPS',
    href: '/ponto',
    activePattern: /^\/ponto/,
    icon: Clock,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { activeProject } = useProject();

  // Não exibir barra de navegação nas telas de login e seleção de obra
  if (pathname === '/login' || pathname === '/selecionar-obra') {
    return null;
  }

  return (
    <>
      {/* Mini indicador da obra ativa no rodapé logo acima da barra */}
      {activeProject && (
        <div className="fixed bottom-16 inset-x-0 z-30 pointer-events-none flex justify-center pb-1">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-[11px] text-amber-300 font-semibold px-3 py-1 rounded-full shadow-lg shadow-black/40 flex items-center gap-1.5 max-w-[90%] truncate">
            <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Obra: {activeProject.name}</span>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Navegação Principal do Canteiro"
        className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.activePattern
              ? item.activePattern.test(pathname)
              : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`relative flex flex-col items-center justify-center h-full select-none transition-all duration-150 active:scale-95 touch-manipulation ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-amber-500 rounded-b-full shadow-sm shadow-amber-500/50" />
                )}

                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-amber-500/15' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>

                <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
