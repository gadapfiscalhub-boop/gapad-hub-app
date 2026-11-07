'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { apiClient } from '@/lib/apiClient';
import { ProjectTask } from '@/types';
import { GanttChart } from '@/components/GanttChart';
import { TaskProgressModal } from '@/components/TaskProgressModal';
import { ChangeOrderModal } from '@/components/ChangeOrderModal';
import {
  CalendarDays,
  PlusCircle,
  RefreshCw,
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  HardHat,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CronogramaGanttPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { activeProject, activeProjectId, isAuthenticated, isLoading: authLoading } = useApp();

  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Month');

  // Estados dos Modais
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState<{
    task: ProjectTask;
    newProgress: number;
  } | null>(null);

  const [isChangeOrderOpen, setIsChangeOrderOpen] = useState(false);

  // Proteção: Se mobile, esconde a tela e redireciona para a home mobile
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.replace('/login');
      else if (!activeProjectId) router.replace('/selecionar-obra');
      else if (!isDesktop) router.replace('/');
    }
  }, [authLoading, isAuthenticated, activeProjectId, isDesktop, router]);

  const fetchTasks = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    setError('');

    try {
      let data: ProjectTask[] = [];
      try {
        data = await apiClient<ProjectTask[]>(`/projects/${activeProjectId}/tasks`);
      } catch (e) {
        // Fallback de cronograma de obra operacional
        data = [
          {
            id: 'task-1',
            name: '1. Limpeza e Mobilização de Canteiro',
            start: '2026-10-01',
            end: '2026-10-20',
            progress: 100,
            status: 'completed',
            responsible: 'Equipe Terraplenagem',
          },
          {
            id: 'task-2',
            name: '2. Fundação Profunda e Sapatas',
            start: '2026-10-21',
            end: '2026-11-25',
            progress: 65,
            dependencies: 'task-1',
            status: 'in_progress',
            responsible: 'Mestre Carlos',
          },
          {
            id: 'task-3',
            name: '3. Estrutura de Concreto Armado (Pilares & Laje)',
            start: '2026-11-26',
            end: '2027-02-15',
            progress: 20,
            dependencies: 'task-2',
            status: 'in_progress',
            responsible: 'Eng. Estrutural',
          },
          {
            id: 'task-4',
            name: '4. Alvenaria de Vedação e Divisórias',
            start: '2027-02-16',
            end: '2027-04-10',
            progress: 0,
            dependencies: 'task-3',
            status: 'planned',
            responsible: 'Equipe Alvenaria',
          },
          {
            id: 'task-5',
            name: '5. Instalações Hidráulicas e Elétricas',
            start: '2027-03-01',
            end: '2027-05-20',
            progress: 0,
            dependencies: 'task-4',
            status: 'planned',
            responsible: 'Instaladora Paulista',
          },
          {
            id: 'task-6',
            name: '6. Acabamento, Pintura e Entrega das Chaves',
            start: '2027-05-21',
            end: '2027-07-30',
            progress: 0,
            dependencies: 'task-5',
            status: 'planned',
            responsible: 'Equipe Acabamento',
          },
        ];
      }

      setTasks(data);
    } catch (err: any) {
      setError(err?.message || 'Falha ao buscar tarefas do cronograma.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProjectId && isDesktop) {
      fetchTasks();
    }
  }, [activeProjectId, isDesktop]);

  // Médias de Avanço Físico (Sem dados financeiros)
  const averageProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const total = tasks.reduce((acc, t) => acc + (t.progress || 0), 0);
    return Math.round(total / tasks.length);
  }, [tasks]);

  const handleProgressTrigger = (task: ProjectTask, newProgress: number) => {
    setSelectedTaskForProgress({
      task,
      newProgress,
    });
  };

  const handleProgressSuccess = (taskId: string, updatedProgress: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, progress: updatedProgress } : t))
    );
  };

  if (!isDesktop || !activeProject) return null;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar com Ação Principal de Solicitação Extra */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#19273c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-800/60">
              Visão de Engenharia
            </span>
            <span className="text-xs font-mono text-slate-500">• Sem dados financeiros</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Cronograma Físico da Obra (Gantt)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento de prazos planejados, avanço real e vinculação automática com o Diário de Obras.
          </p>
        </div>

        {/* Botão em Destaque Obrigatório: Solicitação Extra do Cliente */}
        <button
          type="button"
          onClick={() => setIsChangeOrderOpen(true)}
          className="h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Solicitação Extra do Cliente</span>
        </button>
      </div>

      {/* Cards de Métricas Físicas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#0d1522] border border-[#19273c] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Avanço Físico Global
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {averageProgress}%
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="w-full bg-[#060b13] h-1.5 rounded-full mt-2 overflow-hidden border border-[#19273c]">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0d1522] border border-[#19273c] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Frentes em Execução
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {tasks.filter((t) => t.progress > 0 && t.progress < 100).length}
          </span>
          <span className="text-[10px] text-slate-500">Etapas com atividade hoje</span>
        </div>

        <div className="bg-[#0d1522] border border-[#19273c] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Etapas Concluídas
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {tasks.filter((t) => t.progress === 100).length} / {tasks.length}
          </span>
          <span className="text-[10px] text-slate-500">Total acumulado</span>
        </div>

        <div className="bg-[#0d1522] border border-[#19273c] p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Escala Visual do Gantt
          </span>
          <div className="flex items-center gap-1 mt-2">
            {(['Day', 'Week', 'Month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-[#060b13] text-slate-400 hover:text-white border border-[#19273c]'
                }`}
              >
                {mode === 'Day' ? 'Dia' : mode === 'Week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Área do Gráfico Gantt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <strong className="text-white">Linha do Tempo de Execução</strong> (Arraste a barra verde para atualizar o avanço)
          </span>

          <button
            onClick={fetchTasks}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Cronograma</span>
          </button>
        </div>

        {loading ? (
          <div className="h-72 bg-[#0d1522] border border-[#19273c] rounded-2xl flex items-center justify-center text-slate-400 text-xs animate-pulse">
            Carregando estrutura analítica do projeto (EAP)...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-2xl">
            {error}
          </div>
        ) : (
          <GanttChart
            tasks={tasks}
            viewMode={viewMode}
            onProgressChange={handleProgressTrigger}
          />
        )}
      </div>

      {/* Modal 1: Atualização de Avanço & Diário Obrigatório */}
      {selectedTaskForProgress && (
        <TaskProgressModal
          isOpen={true}
          task={selectedTaskForProgress.task}
          newProgress={selectedTaskForProgress.newProgress}
          onClose={() => setSelectedTaskForProgress(null)}
          onSuccess={handleProgressSuccess}
        />
      )}

      {/* Modal 2: Solicitação Extra do Cliente (Change Order) */}
      <ChangeOrderModal
        isOpen={isChangeOrderOpen}
        onClose={() => setIsChangeOrderOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}

