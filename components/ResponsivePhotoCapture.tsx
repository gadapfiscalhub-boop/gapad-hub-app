'use client';

import React, { useRef, useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Camera, UploadCloud, Trash2, CheckCircle2 } from 'lucide-react';

interface ResponsivePhotoCaptureProps {
  label: string;
  sublabel?: string;
  photo: { file: File; preview: string } | null;
  onPhotoSelected: (file: File) => void;
  onPhotoRemoved: () => void;
  cameraCaptureType?: 'environment' | 'user';
}

export function ResponsivePhotoCapture({
  label,
  sublabel,
  photo,
  onPhotoSelected,
  onPhotoRemoved,
  cameraCaptureType = 'environment',
}: ResponsivePhotoCaptureProps) {
  const { isMobile, isDesktop, supportsDragAndDrop, supportsCameraCapture } = useDeviceDetection();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!supportsDragAndDrop) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (supportsDragAndDrop) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 block">
          {label}
        </label>
        <span className="text-[10px] font-mono text-slate-500">
          {isMobile ? 'Modo Campo: Câmera Ativa' : 'Modo Desktop: Drag & Drop'}
        </span>
      </div>

      {sublabel && <p className="text-[11px] text-slate-500">{sublabel}</p>}

      {/* Input de arquivo condicional */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={supportsCameraCapture ? cameraCaptureType : undefined}
        className="hidden"
        onChange={handleFileChange}
      />

      {photo ? (
        /* Preview da Foto */
        <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/50 bg-[#060b13] shadow-md">
          <img
            src={photo.preview}
            alt={label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-2 flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Anexado
            </span>
            <button
              type="button"
              onClick={onPhotoRemoved}
              className="p-1 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white transition-colors"
              title="Remover foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : isMobile ? (
        /* Layout Mobile: Botão de Câmera Direta */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video rounded-xl border border-dashed border-[#19273c] hover:border-emerald-500/50 bg-[#060b13] flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-400 active:scale-[0.98] transition-all touch-manipulation"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Camera className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tirar Foto no Canteiro
          </span>
          <span className="text-[10px] text-slate-500">
            Dispara automaticamente a lente traseira
          </span>
        </button>
      ) : (
        /* Layout Desktop / Notebook: Área de Arrastar com Mouse (Drag-and-Drop) */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 p-4 text-center ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 scale-[1.01]'
              : 'border-[#19273c] hover:border-emerald-500/40 bg-[#060b13] text-slate-400'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0d1522] border border-[#19273c] flex items-center justify-center text-emerald-400 shadow-inner">
            <UploadCloud className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">
              Arraste e solte a imagem aqui
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ou clique para selecionar um arquivo do computador (PNG, JPG, HEIC)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

