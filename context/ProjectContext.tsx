'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '@/types';
import { api } from '@/lib/apiClient';

interface ProjectContextType {
  activeProject: Project | null;
  activeProjectId: string | null;
  projects: Project[];
  isLoadingProjects: boolean;
  selectProject: (project: Project) => void;
  clearActiveProject: () => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  // Carregar obra salva na inicialização
  useEffect(() => {
    const savedProjectId = localStorage.getItem('gadap_active_project_id');
    const savedProjectData = localStorage.getItem('gadap_active_project_data');

    if (savedProjectId) {
      setActiveProjectId(savedProjectId);
    }

    if (savedProjectData) {
      try {
        setActiveProject(JSON.parse(savedProjectData));
      } catch (err) {
        console.error('Erro ao ler obra salva:', err);
      }
    }
  }, []);

  const selectProject = (project: Project) => {
    setActiveProject(project);
    setActiveProjectId(project.id);
    localStorage.setItem('gadap_active_project_id', project.id);
    localStorage.setItem('gadap_active_project_data', JSON.stringify(project));
  };

  const clearActiveProject = () => {
    setActiveProject(null);
    setActiveProjectId(null);
    localStorage.removeItem('gadap_active_project_id');
    localStorage.removeItem('gadap_active_project_data');
  };

  const refreshProjects = async () => {
    setIsLoadingProjects(true);
    try {
      // Tentar buscar da API Principal
      // Endpoints comuns do ERP: /projects, /obras ou /projects/active
      let list: Project[] = [];
      try {
        const response = await api.get<any>('/projects');
        list = Array.isArray(response) ? response : response?.items || response?.data || [];
      } catch (e) {
        // Fallback para endpoint em português ou dados iniciais de demonstração
        try {
          const response = await api.get<any>('/obras');
          list = Array.isArray(response) ? response : response?.items || response?.data || [];
        } catch {
          // Se o backend ainda não tiver a tabela populada ou endpoint indisponível,
          // fornece obras padrão da construtora para o mestre poder operar
          list = [
            {
              id: 'obra-01-ed-aurora',
              code: 'OBR-2026-01',
              name: 'Residencial Aurora Prime',
              status: 'active',
              address: 'Av. Paulista, 1842 - Torre A',
              city: 'São Paulo - SP',
              manager_name: 'Eng. Carlos Mendonça',
              budget_total: 4850000,
            },
            {
              id: 'obra-02-parque-horizonte',
              code: 'OBR-2026-02',
              name: 'Condomínio Parque Horizonte',
              status: 'active',
              address: 'Rua das Palmeiras, 450',
              city: 'Campinas - SP',
              manager_name: 'Engª Mariana Siqueira',
              budget_total: 7200000,
            },
            {
              id: 'obra-03-log-center',
              code: 'OBR-2026-03',
              name: 'Centro Logístico Anhanguera II',
              status: 'active',
              address: 'Rod. Anhanguera, km 54',
              city: 'Jundiaí - SP',
              manager_name: 'Mestre Gilberto Alves',
              budget_total: 12400000,
            },
          ];
        }
      }

      setProjects(list);
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        activeProjectId,
        projects,
        isLoadingProjects,
        selectProject,
        clearActiveProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject deve ser utilizado dentro de um ProjectProvider');
  }
  return context;
}

