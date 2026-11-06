'use client';

import { useState, useCallback } from 'react';

export interface GeoLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: null,
    loading: false,
  });

  const getCurrentPosition = useCallback((): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        const errorMsg = 'Geolocalização não é suportada por este dispositivo/navegador.';
        setLocation((prev) => ({ ...prev, error: errorMsg, loading: false }));
        reject(new Error(errorMsg));
        return;
      }

      setLocation((prev) => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const pos = { latitude, longitude, accuracy };
          setLocation({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp,
            error: null,
            loading: false,
          });
          resolve(pos);
        },
        (error) => {
          let errorMsg = 'Falha ao obter coordenadas GPS.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Permissão de localização negada pelo usuário no aparelho.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Sinal GPS indisponível no momento no canteiro.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Tempo esgotado ao buscar sinal GPS do dispositivo.';
              break;
          }
          setLocation((prev) => ({ ...prev, error: errorMsg, loading: false }));
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    ...location,
    getCurrentPosition,
  };
}

