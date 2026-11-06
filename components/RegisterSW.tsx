'use client';

import { useEffect } from 'react';

export function RegisterSW() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registado com sucesso:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Falha ao registar Service Worker:', error);
        });
    }
  }, []);

  return null;
}

