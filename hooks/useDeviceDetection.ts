'use client';

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  supportsCameraCapture: boolean;
  supportsDragAndDrop: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceType: 'mobile',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: true,
    supportsCameraCapture: true,
    supportsDragAndDrop: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const isMobileUA = /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTabletUA = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(userAgent);

      // Verificação por ponteiro e toques nativos
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const width = window.innerWidth;

      let detectedType: DeviceType = 'desktop';

      if (isMobileUA || (hasTouch && width < 768)) {
        detectedType = 'mobile';
      } else if (isTabletUA || (hasTouch && width >= 768 && width <= 1024)) {
        detectedType = 'tablet';
      } else {
        detectedType = 'desktop';
      }

      const isMobile = detectedType === 'mobile';
      const isTablet = detectedType === 'tablet';
      const isDesktop = detectedType === 'desktop';

      setDeviceInfo({
        deviceType: detectedType,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice: hasTouch,
        // No celular: Câmera traseira nativa obrigatória
        supportsCameraCapture: isMobile || (isTablet && hasTouch),
        // No Desktop / Notebook: Habilita zona Drag-and-Drop
        supportsDragAndDrop: isDesktop || (!hasTouch && width > 1024),
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceInfo;
}

