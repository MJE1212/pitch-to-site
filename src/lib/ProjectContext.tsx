'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebsiteProject, STEPS } from './types';

interface ProjectContextType {
  project: WebsiteProject;
  updateProject: (updates: Partial<WebsiteProject>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetProject: () => void;
}

const defaultProject: WebsiteProject = {
  currentStep: 1,
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<WebsiteProject>(defaultProject);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('websiteProject');
    if (saved) {
      try {
        setProject(JSON.parse(saved));
      } catch {
        setProject(defaultProject);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to sessionStorage on change
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem('websiteProject', JSON.stringify(project));
    }
  }, [project, isLoaded]);

  const updateProject = (updates: Partial<WebsiteProject>) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setProject(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, STEPS.length),
    }));
  };

  const prevStep = () => {
    setProject(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setProject(prev => ({ ...prev, currentStep: step }));
    }
  };

  const resetProject = () => {
    setProject(defaultProject);
    sessionStorage.removeItem('websiteProject');
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ProjectContext.Provider value={{ project, updateProject, nextStep, prevStep, goToStep, resetProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
