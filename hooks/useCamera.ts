'use client';

import { useState, useCallback, useRef } from 'react';

export interface PhotoCapture {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  timestamp: string;
}

export function useCamera() {
  const [photos, setPhotos] = useState<PhotoCapture[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openCamera = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  }, []);

  const handleCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsProcessing(true);
      const newPhotos: PhotoCapture[] = [];

      Array.from(files).forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        newPhotos.push({
          file,
          previewUrl,
          name: file.name,
          size: file.size,
          timestamp: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      });

      setPhotos((prev) => [...prev, ...newPhotos]);
      setIsProcessing(false);
    },
    []
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clearPhotos = useCallback(() => {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
  }, [photos]);

  return {
    photos,
    isProcessing,
    inputRef,
    openCamera,
    handleCapture,
    removePhoto,
    clearPhotos,
  };
}

