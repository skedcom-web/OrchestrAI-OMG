import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { findModule } from '../../config/navigation';
import { GOVERNANCE_PRINCIPLE_STATEMENT } from '../../config/landingContent';
import { useExperience } from '../../contexts/ExperienceContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isExecutive } = useExperience();
  const located = findModule(location.pathname);
  const [insightOpen, setInsightOpen] = useState(false);

  // Collapse the panel whenever the route changes, so it never persists onto an unrelated module.
  useEffect(() => { setInsightOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        {/* Module context band — tenant, domain purpose and module intent */}
        <div className="px-3 sm:px-6 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)]/40 flex items-center gap-3 flex-wrap">
          <span
            data-noglass
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-secondary)]"
          >
            <span className="status-pulse" style={{ color: 'var(--status-success)' }} />
            <span className="hidden sm:inline">Enterprise Banking Tenant</span>
            <span className="sm:hidden">Enterprise Tenant</span>
          </span>

          {located?.domain && (
            <span className="hidden sm:inline text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {located.domain.icon} {located.domain.label}
            </span>
          )}

          {located?.module?.description && (
            <span className="hidden md:inline text-[11px] text-[var(--text-muted)] truncate min-w-0 flex-1">
              {located.module.description}
            </span>
          )}

          {located?.module?.insight && (
            <button
              type="button"
              onClick={() => setInsightOpen(v => !v)}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary)] hover:underline shrink-0"
              aria-expanded={insightOpen}
            >
              ⓘ About this module
            </button>
          )}

          <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] shrink-0">
            {isExecutive ? 'Executive' : 'Governance'}
            <span className="hidden sm:inline"> Experience</span>
          </span>
        </div>

        {insightOpen && located?.module?.insight && (
          <div className="px-3 sm:px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)]/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">What It Does</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{located.module.insight.whatItDoes}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">Why It Matters</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{located.module.insight.whyItMatters}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">Governance Outcome</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{located.module.insight.governanceOutcome}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">Key Artifacts</p>
                <div className="flex flex-wrap gap-1.5">
                  {located.module.insight.keyArtifacts.map(a => (
                    <span key={a} className="text-[10.5px] px-2 py-0.5 rounded-full bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <main
          key={location.pathname}
          className="flex-1 px-4 sm:px-6 py-5 sm:py-7 w-full mx-auto animate-rise-in"
          style={{ maxWidth: 'var(--content-max)' }}
        >
          {children}
        </main>

        <footer className="px-4 sm:px-6 py-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[var(--text-muted)] text-center sm:text-left">
          <span>
            OrchestrAI <strong className="text-[var(--text-secondary)]">OMG</strong> — Enterprise AI
            Governance Operating System
          </span>
          <span>{GOVERNANCE_PRINCIPLE_STATEMENT}</span>
        </footer>
      </div>
    </div>
  );
};
