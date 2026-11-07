'use client';

import React, { useState } from 'react';
import { Eye, X, ZoomIn } from 'lucide-react';

interface PhotoThumbnailViewerProps {
  photos: string[];
  title?: string;
}

export function PhotoThumbnailViewer({ photos, title }: PhotoThumbnailViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!photos || photos.length === 0) {
    return <span className="text-slate-600 text-xs italic">Sem fotos</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        {photos.map((src, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(src)}
            className="group relative w-10 h-10 rounded-lg overflow-hidden border border-[#19273c] bg-[#060b13] hover:border-emerald-500 cursor-pointer transition-all shadow-sm shrink-0"
            title="Clique para ampliar evidência"
          >
            <img
              src={src}
              alt={title || `Evidência ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <ZoomIn className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lightbox de Ampliação */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#0d1522] border border-[#19273c] rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-[#19273c]">
              <span className="text-xs font-bold text-slate-200">
                {title || 'Evidência Fotográfica do Empreiteiro'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#19273c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[75vh] flex items-center justify-center bg-[#060b13] rounded-xl overflow-hidden">
              <img
                src={selectedImage}
                alt="Evidência Ampliada"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

