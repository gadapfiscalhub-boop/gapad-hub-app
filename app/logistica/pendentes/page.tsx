"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/apiClient';
import { MaterialOrder } from '@/types';
import {
  Truck,
  Package,
  Calendar,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Search,
  CheckCircle2,
  HardHat,
  ArrowLeft,
  Clock
} from 'lucide-react';

export default function EntregasPendentesPage() {
  const router = useRouter();
  const { activeProject, activeProjectId, isAuthenticated, isLoading: authLoading } = useApp();

  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!activeProjectId) {
        router.replace('/selecionar-obra');
      }
    }
  }, [authLoading, isAuthenticated, activeProjectId, router]);

  const fetchOrders = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    setError('');

    try {
      let data: MaterialOrder[] = [];
      try {
        data = await apiClient<MaterialOrder[]>(`/projects/${activeProjectId}/logistics/pending-orders`);
      } catch (e: any) {
        // Fallback para rotas alternativas do ERP ou Mock de canteiro
        try {
          data = await apiClient<MaterialOrder[]>(`/projects/${activeProjectId}/deliveries`);
        } catch {
          data = [
            {
              id: 'ord-042',
              order_number: '#042',
              supplier: 'Leroy Merlin',
              invoice_number: 'NF-e 883.921',
              delivery_forecast: 'Previsto para Hoje',
              driver_name: 'Marcos Vinícius',
              vehicle_plate: 'ABC-4E29',
              items_count: 3,
              status: 'in_transit',
              items: [
                { id: 'item-1', name: 'Cimento CP II - 50kg', unit: 'sacos', expected_qty: 50, category: 'Estrutura' },
                { id: 'item-2', name: 'Areia Média Lavada', unit: 'm³', expected_qty: 12, category: 'Agregados' },
                { id: 'item-3', name: 'Brita 1 Granulada', unit: 'm³', expected_qty: 8, category: 'Agregados' },
              ],
            },
            {
              id: 'ord-043',
              order_number: '#043',
              supplier: 'Gerdau Aço & Armações',
              invoice_number: 'NF-e 119.452',
              delivery_forecast: 'Previsto para Hoje (Tarde)',
              driver_name: 'Roberto Silveira',
              vehicle_plate: 'KZX-9921',
              items_count: 2,
              status: 'in_transit',
              items: [
                { id: 'item-4', name: 'Vergalhão CA-50 10mm (3/8)', unit: 'barras', expected_qty: 120, category: 'Aço' },
                { id: 'item-5', name: 'Arame Recozido 18 BWG', unit: 'kg', expected_qty: 35, category: 'Fixação' },
              ],
            },
            {
              id: 'ord-045',
              order_number: '#045',
              supplier: 'Cerâmica São José',
              invoice_number: 'NF-e 554.019',
              delivery_forecast: 'Amanhã 08:00',
              driver_name: 'Carlos Antunes',
              vehicle_plate: 'DFF-1033',
              items_count: 1,
              status: 'pending',
              items: [
                { id: 'item-6', name: 'Bloco Cerâmico 14x19x29', unit: 'milheiro', expected_qty: 6, category: 'Alvenaria' },
              ],
            },
          ];
        }
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Falha ao buscar pedidos em trânsito.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      fetchOrders();
    }
  }, [activeProjectId]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(term) ||
        o.supplier.toLowerCase().includes(term) ||
        o.invoice_number?.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  if (!activeProject) return null;

  return (
    <main className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col pb-24 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Técnico */}
      <header className="sticky top-0 z-20 bg-[#060b13]/95 backdrop-blur-md border-b border-[#19273c] px-4 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/')}
              className="p-1.5 -ml-1 text-slate-400 hover:text-white transition-colors"
              title="Voltar ao Início"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                <h1 className="text-sm sm:text-base font-extrabold text-white">
                  Recebimento de Materiais
                </h1>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium truncate max-w-[220px]">
                {activeProject.name}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 uppercase">
            Canteiro
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto px-4 pt-5 flex-1 space-y-4">
        {/* Banner Informativo */}
        <div className="bg-[#0d1522] border border-[#19273c] rounded-2xl p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded">
                A Caminho do Canteiro
              </span>
              <h2 className="text-base font-bold text-white mt-1.5">
                Entregas & Pedidos Agendados
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Confira a carga antes de descarregar e assinar o canhoto fiscal.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Busca e Atualização */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por fornecedor, pedido ou NF..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0d1522] border border-[#19273c] text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="h-11 px-3 rounded-xl bg-[#0d1522] border border-[#19273c] hover:border-slate-600 text-slate-300 flex items-center justify-center transition-all disabled:opacity-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchOrders} className="underline text-xs font-semibold ml-2">Tentar novamente</button>
          </div>
        )}

        {/* Lista de Pedidos em Trânsito */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-[#0d1522]/80 border border-[#19273c] animate-pulse p-4"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-[#19273c] bg-[#0d1522]/50 space-y-2">
            <Truck className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-slate-300 text-sm font-semibold">Nenhuma entrega pendente para hoje</p>
            <p className="text-slate-500 text-xs">
              Quando o almoxarifado ou suprimentos despachar materiais, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isToday = order.delivery_forecast.toLowerCase().includes('hoje');
              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/logistica/conferir/${order.id}`)}
                  className="group p-4 sm:p-5 rounded-2xl border border-[#19273c] bg-[#0d1522] hover:bg-[#111c2e] hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg active:scale-[0.99] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                          {order.order_number}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isToday
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-amber-400" />
                          {order.delivery_forecast}
                        </span>
                      </div>

                      {/* Fornecedor */}
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors pt-1">
                        {order.supplier}
                      </h3>

                      {/* Dados da NF e Motorista */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        {order.invoice_number && (
                          <span className="font-mono text-slate-300">{order.invoice_number}</span>
                        )}
                        {order.driver_name && (
                          <span className="text-slate-400">• Mot: {order.driver_name}</span>
                        )}
                        {order.vehicle_plate && (
                          <span className="font-mono text-slate-500">[{order.vehicle_plate}]</span>
                        )}
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#060b13] group-hover:bg-emerald-500 flex items-center justify-center text-slate-400 group-hover:text-slate-950 transition-all shrink-0 self-center">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Rodapé do Card */}
                  <div className="mt-3.5 pt-3 border-t border-[#19273c]/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Total: <strong className="text-slate-200">{order.items_count} tipos de item</strong>
                    </span>

                    <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Iniciar Conferência &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

