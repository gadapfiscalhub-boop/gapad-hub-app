'use client';

import React from 'react';
import Link from 'next/link';
import { useProject } from '@/context/ProjectContext';
import { Clock, CheckCircle2, ArrowLeft, Users } from 'lucide-react';

export default function PontoPage() {
  const { activeProject } = useProject();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 max-w-xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="p-1.5 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Apontamento de Ponto
          </h1>
          <p className="text-xs text-slate-400">{activeProject?.name || 'Canteiro'}</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Presença da Equipe de Campo</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Registre a entrada, intervalos e horas extras dos colaboradores e terceirizados no canteiro.
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 mx-auto">
          <CheckCircle2 className="w-4 h-4" />
          Registrar Entrada da Equipe
        </button>
      </div>
    </div>
  );
}

