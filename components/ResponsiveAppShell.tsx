'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { BottomNav } from '@/components/BottomNav';
import { DesktopSidebar } from '@/components/DesktopSidebar';

interface ResponsiveAppShellProps {
  children: React.ReactNode;
}

export function ResponsiveAppShell({ children }: ResponsiveAppShellProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const pathname = usePathname();
  const router = useRouter();

  // Em telas Desktop (>= 1024px): Se acessar a raiz ou rotas exclusivas mobile,
  // encaminha de forma inteligente para a Visão de Cronograma de Obra (Gantt)
  useEffect(() => {
    if (isDesktop && pathname === '/') {
      router.replace('/cronograma');
    }
  }, [isDesktop, pathname, router]);

  // Telas de autenticação limpas sem barras laterais ou inferiores
  const isAuthPage = pathname === '/login' || pathname === '/selecionar-obra';

  if (isAuthPage) {
    return <main className="flex-1 w-full flex flex-col">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#060b13]">
      {/* 1. VISÃO DESKTOP (>= 1024px): Sidebar Compacta de Gestão */}
      {isDesktop && <DesktopSidebar />}

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full flex flex-col overflow-x-hidden min-h-screen">
        {children}
      </main>

      {/* 3. VISÃO MOBILE (< 1024px): Bottom Navigation Bar Focada no Polegar */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}

