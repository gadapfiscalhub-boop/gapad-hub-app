'use client';

import React from 'react';
import Link from 'next/link';
import { useProject } from '@/context/ProjectContext';
import { Package, PlusCircle, ArrowLeft } from 'lucide-react';

export default function MateriaisPage() {
  const { activeProject } = useProject();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 max-w-xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="p-1.5 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Requisição de Materiais
          </h1>
          <p className="text-xs text-slate-400">{activeProject?.name || 'Canteiro'}</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Solicitações de Insumos</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Faça pedidos rápidos de cimento, aço, blocos e EPIs diretamente para o almoxarifado central.
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 mx-auto">
          <PlusCircle className="w-4 h-4" />
          Nova Requisição de Insumos
        </button>
      </div>
    </div>
  );
}

