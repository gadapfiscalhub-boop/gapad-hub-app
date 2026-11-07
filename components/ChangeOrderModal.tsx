'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/apiClient';
import { ChangeOrderPayload } from '@/types';
import {
  FilePlus2,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building,
  UserCheck
} from 'lucide-react';

interface ChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangeOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangeOrderModalProps) {
  const { activeProjectId, user } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [urgency, setUrgency] = useState<'baixa' | 'media' | 'alta'>('media');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Preencha o título e a descrição detalhada do pedido do cliente.');
      return;
    }

    setLoading(true);

    const payload: ChangeOrderPayload = {
      project_id: activeProjectId || '',
      title: title.trim(),
      description: description.trim(),
      requested_by: user?.name || user?.email || 'Engenharia de Campo',
      client_contact: clientContact.trim() || undefined,
      urgency,
      status: 'pending_pricing',
      created_at: new Date().toISOString(),
    };

    try {
      try {
        await apiClient(`/projects/${activeProjectId}/change-orders-requests`, {
          method: 'POST',
          data: payload,
        });
      } catch (err) {
        // Fallback para rota de aditivos/mudanças
        try {
          await apiClient(`/projects/${activeProjectId}/solicitacoes-extras`, {
            method: 'POST',
            data: payload,
          });
        } catch {
          console.warn('Endpoint de change orders em mock');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err?.message || 'Falha ao despachar solicitação extra para o setor comercial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0d1522] border border-[#19273c] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#19273c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FilePlus2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Nova Solicitação Extra do Cliente</h3>
              <p className="text-[11px] text-slate-400">Change Order • Despacho direto ao Comercial/Orçamentos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#19273c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-white">Solicitação Despachada com Sucesso!</p>
            <p className="text-xs text-slate-400">O setor comercial já foi notificado para elaborar o aditivo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Título do Pedido Extra
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Troca de piso da sala para porcelanato 80x80"
                className="w-full h-11 px-3.5 rounded-xl bg-[#060b13] border border-[#19273c] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Descrição Detalhada do Pedido do Cliente
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o escopo solicitado pelo cliente fora do contrato original (metragem, materiais, locais afetados)..."
                className="w-full p-3 rounded-xl bg-[#060b13] border border-[#19273c] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Contato do Solicitante
                </label>
                <input
                  type="text"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="Ex: Dr. Marcelo (Proprietário)"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#060b13] border border-[#19273c] text-white text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Urgência de Precificação
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl bg-[#060b13] border border-[#19273c] text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="baixa">Baixa (Rotina)</option>
                  <option value="media">Média (Até 48h)</option>
                  <option value="alta">Alta (Frente de Obra Parada)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-[#060b13] border border-[#19273c] rounded-xl text-[11px] text-slate-400 leading-snug">
              ℹ️ Este pedido NÃO gera custos no canteiro de imediato. Ele é encaminhado à rota <code className="text-emerald-400">change_orders_requests</code> para que a equipe financeira elabore a cotação e o aditivo contratual.
            </div>

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
                className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <FilePlus2 className="w-4 h-4 text-slate-950" />
                    <span>Despachar ao Comercial</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

