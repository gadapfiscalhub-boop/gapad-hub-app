'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
        })
        .catch((err) => {
          console.error('[PWA] Falha ao registrar Service Worker:', err);
        });
    }
  }, []);

  return null;
}

