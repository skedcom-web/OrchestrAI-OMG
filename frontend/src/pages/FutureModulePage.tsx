import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FUTURE_MODULES } from '../config/navigation';

/**
 * Phase 8G — Future module architecture preparation.
 *
 * Routes, navigation entries and RBAC keys exist now so later phases can land
 * without re-architecting navigation. No functional implementation is intended
 * at this stage.
 */
export const FutureModulePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const module = FUTURE_MODULES.find(m => m.path === location.pathname);

  if (!module) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-[var(--text-muted)]">This module is not in the roadmap registry.</p>
      </div>
    );
  }

  const others = FUTURE_MODULES.filter(m => m.path !== module.path);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <section
        className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] p-8 sm:p-10"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
        <div
          className="absolute -right-20 -bottom-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'var(--grad-brand)', opacity: 0.1, filter: 'blur(60px)' }}
          aria-hidden
        />

        <div className="relative max-w-2xl flex flex-col gap-4">
          <span
            data-noglass
            className="inline-flex items-center gap-2 w-fit px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.12em] bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]"
          >
            Architected in Phase 8 · Delivered in {module.phase}
          </span>

          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden>
              {module.icon}
            </span>
            <h1 className="text-[1.85rem] font-extrabold text-[var(--text-primary)] leading-tight">
              {module.label}
            </h1>
          </div>

          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            {module.description}
          </p>

          <p className="text-[12.5px] text-[var(--text-muted)] leading-relaxed">
            The navigation slot, route and role-based access key for this module are already
            registered in the governance architecture. When {module.phase} lands, the capability
            appears here without any change to how OMG is navigated or authorised.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Planned Capabilities</h2>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1">
            Scope committed for {module.phase}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {module.capabilities.map((capability, i) => (
            <div
              key={capability}
              data-noglass
              className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3"
            >
              <span
                className="tnum shrink-0 w-6 h-6 grid place-items-center rounded-lg text-[11px] font-extrabold bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-primary)]"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="text-[12.5px] font-medium text-[var(--text-secondary)] leading-relaxed">
                {capability}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Governance Roadmap</h2>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1">
            The rest of the enterprise governance build.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {others.map(other => (
            <button
              key={other.path}
              onClick={() => navigate(other.path)}
              className="text-left rounded-xl border border-[var(--border-subtle)] px-3.5 py-3 hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] font-bold text-[var(--text-primary)]">
                  {other.icon} {other.label}
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {other.phase}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                {other.description}
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="self-start px-4 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          style={{ background: 'var(--grad-brand)' }}
        >
          Return to Command Center
        </button>
      </section>
    </div>
  );
};
