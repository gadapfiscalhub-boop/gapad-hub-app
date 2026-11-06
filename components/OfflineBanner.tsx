'use client';

import React from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-50 bg-amber-950/95 border-b border-amber-500/50 text-amber-200 text-xs font-semibold py-2 px-4 shadow-lg backdrop-blur-md flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-200"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <span className="tracking-wide">
        Modo Offline: Operando com dados em cache
      </span>
    </div>
  );
}

