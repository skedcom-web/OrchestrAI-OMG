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
  /** Accordion: at most one workspace open at a time, persisted across sessions. Null = none open. */
  openDomainId: string | null;
  setOpenDomainId: (domainId: string | null) => void;
  toggleDomain: (domainId: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Mobile off-canvas navigation drawer — ephemeral, not persisted. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
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

  const [openDomainId, setOpenDomainIdState] = useState<string | null>(() =>
    readStored<string | null>('omg_open_domain', null)
  );

  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() =>
    readStored<boolean>('omg_sidebar_collapsed', false)
  );

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const setMode = useCallback((next: ExperienceMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'executive' ? 'governance' : 'executive');
  }, [mode, setMode]);

  const setOpenDomainId = useCallback((domainId: string | null) => {
    setOpenDomainIdState(domainId);
    localStorage.setItem('omg_open_domain', JSON.stringify(domainId));
  }, []);

  const toggleDomain = useCallback((domainId: string) => {
    setOpenDomainIdState(prev => {
      const next = prev === domainId ? null : domainId;
      localStorage.setItem('omg_open_domain', JSON.stringify(next));
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
      openDomainId,
      setOpenDomainId,
      toggleDomain,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
    }),
    [
      mode,
      setMode,
      toggleMode,
      openDomainId,
      setOpenDomainId,
      toggleDomain,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileNavOpen,
    ]
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
