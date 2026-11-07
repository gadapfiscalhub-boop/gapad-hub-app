'use client';

import React, { useEffect, useRef } from 'react';
import { ProjectTask } from '@/types';

interface GanttChartProps {
  tasks: ProjectTask[];
  onProgressChange: (task: ProjectTask, newProgress: number) => void;
  viewMode?: 'Day' | 'Week' | 'Month';
}

export function GanttChart({
  tasks,
  onProgressChange,
  viewMode = 'Month',
}: GanttChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const ganttInstance = useRef<any>(null);

  useEffect(() => {
    if (!svgRef.current || tasks.length === 0) return;

    // Carregamento dinâmico do frappe-gantt apenas no client-side
    let isMounted = true;

    import('frappe-gantt').then((module) => {
      if (!isMounted || !svgRef.current) return;
      const Gantt = module.default;

      // Formatar tarefas no formato exigido pela lib
      const formattedTasks = tasks.map((t) => ({
        id: t.id,
        name: t.name,
        start: t.start,
        end: t.end,
        progress: t.progress,
        dependencies: t.dependencies || '',
        custom_class: t.custom_class || '',
      }));

      try {
        ganttInstance.current = new Gantt(svgRef.current, formattedTasks, {
          header_height: 50,
          column_width: 38,
          step: 24,
          view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
          bar_height: 28,
          bar_corner_radius: 6,
          arrow_curve: 5,
          padding: 18,
          view_mode: viewMode,
          date_format: 'YYYY-MM-DD',
          language: 'ptBr',
          on_progress_change: (task: any, progress: number) => {
            const originalTask = tasks.find((t) => t.id === task.id);
            if (originalTask) {
              onProgressChange(originalTask, progress);
            }
          },
          on_click: (task: any) => {
            const originalTask = tasks.find((t) => t.id === task.id);
            if (originalTask) {
              onProgressChange(originalTask, originalTask.progress);
            }
          },
        });
      } catch (err) {
        console.error('Erro ao instanciar Frappe Gantt:', err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [tasks, viewMode]);

  return (
    <div className="w-full overflow-x-auto bg-[#060b13] border border-[#19273c] rounded-2xl p-4 shadow-xl">
      <div className="min-w-[760px]">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}

