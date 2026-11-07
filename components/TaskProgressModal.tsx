'use client';

import React, { useState } from 'react';
import { ProjectTask } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/apiClient';
import {
  FileText,
  Camera,
  UploadCloud,
  CheckCircle2,
  X,
  Loader2,
  TrendingUp,
  Trash2,
  Calendar
} from 'lucide-react';

interface TaskProgressModalProps {
  task: ProjectTask;
  newProgress: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (taskId: string, updatedProgress: number) => void;
}

export function TaskProgressModal({
  task,
  newProgress,
  isOpen,
  onClose,
  onSuccess,
}: TaskProgressModalProps) {
  const { activeProjectId, user } = useApp();
  const [reportText, setReportText] = useState('');
  const [photo, setPhoto] = useState<{ file: File; preview: string; base64?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto({ file, preview, base64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reportText.trim()) {
      setError('Por favor, informe a justificativa ou diário do avanço físico.');
      return;
    }

    setLoading(true);

    const payload = {
      task_id: task.id,
      task_name: task.name,
      project_id: activeProjectId,
      reported_progress: newProgress,
      report_text: reportText.trim(),
      reported_by: user?.name || user?.email || 'Engenheiro de Obra',
      photo_base64: photo?.base64,
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Atualiza progresso da tarefa no ERP
      try {
        await apiClient(`/projects/${activeProjectId}/tasks/${task.id}/progress`, {
          method: 'PATCH',
          data: { progress: newProgress },
        });
      } catch (err) {
        console.warn('Endpoint de tarefas em mock/offline');
      }

      // 2. Registra o Diário de Obra vinculado na tabela field_reports
      try {
        await apiClient(`/projects/${activeProjectId}/field-reports`, {
          method: 'POST',
          data: payload,
        });
      } catch (err) {
        console.warn('Endpoint field-reports em mock/offline');
      }

      onSuccess(task.id, newProgress);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao sincronizar diário com o ERP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0d1522] border border-[#19273c] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[#19273c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Registrar Diário de Obra</h3>
              <p className="text-[11px] text-slate-400">Atualização de avanço físico de cronograma</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#19273c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informações da Tarefa e Novo Progresso */}
        <div className="p-3 bg-[#060b13] border border-[#19273c] rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">TAREFA #{task.id}</span>
            <strong className="text-white text-sm">{task.name}</strong>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Novo Avanço</span>
            <span className="text-sm font-black text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {newProgress}%
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveReport} className="space-y-4">
          {/* Relatório Técnico */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Diário da Tarefa (Evidência do Avanço)
            </label>
            <textarea
              rows={3}
              required
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Descreva o que foi executado para atingir este percentual (ex: Concretagem das sapatas S1 a S8 finalizada hoje com 14m³ de concreto 30MPa)..."
              className="w-full p-3 rounded-xl bg-[#060b13] border border-[#19273c] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Anexo Fotográfico da Frente de Serviço */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Evidência Fotográfica do Avanço
            </label>

            {photo ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/50 bg-[#060b13]">
                <img src={photo.preview} alt="Avanço da Tarefa" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white"
                  title="Remover foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full aspect-video rounded-xl border border-dashed border-[#19273c] hover:border-emerald-500/50 bg-[#060b13] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-slate-400 hover:text-emerald-400">
                <UploadCloud className="w-6 h-6 stroke-[1.8]" />
                <span className="text-xs font-semibold">Anexar ou Arraste a Foto da Tarefa</span>
                <span className="text-[10px] text-slate-500">Salva na tabela field_reports vinculada à tarefa</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </label>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#19273c]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-[#060b13] hover:bg-[#111c2e] text-slate-300 text-xs font-bold border border-[#19273c] transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Gravando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Gravar Diário & Avanço</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

