import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ExperienceMode } from '../config/navigation';

/**
 * Phase 8D — Persona-Based Experience.
 *
 * Executive Mode  → CIO / CRO / CTO / Board. Narrow, decision-oriented surface.
 * Governance Mode → Governance, Risk, Compliance, Reviewers, Admins. Full depth.
 *
 * The mode is a *presentation* concern layered on top of RBAC: it never grants
 * access, it only narrows what an authorised user is shown.
 */

const STORAGE_KEY = 'omg_experience_mode';

interface ExperienceContextType {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  toggleMode: () => void;
  isExecutive: boolean;
  /** Sidebar group open/closed state, persisted per domain. */
  collapsedDomains: string[];
  toggleDomain: (domainId: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ExperienceMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'executive' || saved === 'governance' ? saved : 'governance';
  });

  const [collapsedDomains, setCollapsedDomains] = useState<string[]>(() =>
    readStored<string[]>('omg_collapsed_domains', [])
  );

  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() =>
    readStored<boolean>('omg_sidebar_collapsed', false)
  );

  const setMode = useCallback((next: ExperienceMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'executive' ? 'governance' : 'executive');
  }, [mode, setMode]);

  const toggleDomain = useCallback((domainId: string) => {
    setCollapsedDomains(prev => {
      const next = prev.includes(domainId)
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId];
      localStorage.setItem('omg_collapsed_domains', JSON.stringify(next));
      return next;
    });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem('omg_sidebar_collapsed', JSON.stringify(collapsed));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-experience', mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isExecutive: mode === 'executive',
      collapsedDomains,
      toggleDomain,
      sidebarCollapsed,
      setSidebarCollapsed,
    }),
    [mode, setMode, toggleMode, collapsedDomains, toggleDomain, sidebarCollapsed, setSidebarCollapsed]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
};

export const useExperience = (): ExperienceContextType => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};
