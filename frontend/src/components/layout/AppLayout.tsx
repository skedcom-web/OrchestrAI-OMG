import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { findModule } from '../../config/navigation';
import { useExperience } from '../../contexts/ExperienceContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isExecutive } = useExperience();
  const located = findModule(location.pathname);

  return (
    <div className="min-h-screen flex bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        {/* Module context band — tenant, domain purpose and module intent */}
        <div className="px-6 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)]/40 flex items-center gap-3 flex-wrap">
          <span
            data-noglass
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-secondary)]"
          >
            <span className="status-pulse" style={{ color: 'var(--status-success)' }} />
            Enterprise Banking Tenant
          </span>

          {located?.domain && (
            <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {located.domain.icon} {located.domain.question}
            </span>
          )}

          {located?.module?.description && (
            <span className="text-[11px] text-[var(--text-muted)] truncate min-w-0 flex-1">
              {located.module.description}
            </span>
          )}

          <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] shrink-0">
            {isExecutive ? 'Executive Experience' : 'Governance Experience'}
          </span>
        </div>

        <main
          key={location.pathname}
          className="flex-1 px-6 py-7 w-full mx-auto animate-rise-in"
          style={{ maxWidth: 'var(--content-max)' }}
        >
          {children}
        </main>

        <footer className="px-6 py-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[var(--text-muted)]">
          <span>
            OrchestrAI <strong className="text-[var(--text-secondary)]">OMG</strong> — Enterprise AI
            Governance Operating System
          </span>
          <span className="flex items-center gap-4">
            <span>Govern Every AI</span>
            <span aria-hidden>·</span>
            <span>Control Every Decision</span>
            <span aria-hidden>·</span>
            <span>Prove Every Outcome</span>
          </span>
        </footer>
      </div>
    </div>
  );
};
