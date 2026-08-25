import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { DEMO_PERSONAS } from '../services/mockData';
import { NAV_DOMAINS, COMMAND_CENTER, EXECUTIVE_DASHBOARD } from '../config/navigation';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

/**
 * Phase 8A — Administration domain.
 * The authorisation matrix that answers "who can do what?" across the six
 * governance domains. Derived from the navigation architecture, so it can
 * never drift from what the sidebar actually exposes.
 */
export const RbacAdministrationPage: React.FC = () => {
  // Q1 Stabilization — Phase 2: a prior audit flagged that the (nominally read-only)
  // Auditor persona has nav access to this page. switchPersona() has no dedicated
  // ActionKey in roleActionMatrix.ts, so — per the instruction to treat any
  // permission-changing control here as Super Admin/Governance Admin only — it falls
  // back to the safe !isReadOnly minimum: a read-only role must not be able to act on
  // this matrix, even to reassign its own preview persona.
  const { currentUser, switchPersona, isReadOnly } = useAuth();
  const [domainFilter, setDomainFilter] = useState<string>('all');

  const domains = useMemo(
    () => (domainFilter === 'all' ? NAV_DOMAINS : NAV_DOMAINS.filter(d => d.id === domainFilter)),
    [domainFilter]
  );

  const grants = (role: UserRole, path: string) => {
    const persona = DEMO_PERSONAS.find(p => p.role === role);
    if (!persona) return false;
    if (persona.role === 'SUPER_ADMIN') return true;
    return persona.allowedNav.includes(path);
  };

  const totalModules =
    NAV_DOMAINS.reduce((n, d) => n + d.modules.length, 0) + 2; // + command centre surfaces

  const coverage = DEMO_PERSONAS.map(persona => {
    const granted =
      persona.role === 'SUPER_ADMIN'
        ? totalModules
        : [COMMAND_CENTER.path, EXECUTIVE_DASHBOARD.path, ...NAV_DOMAINS.flatMap(d => d.modules.map(m => m.path))]
            .filter(path => persona.allowedNav.includes(path)).length;
    return { persona, granted, share: Math.round((granted / totalModules) * 100) };
  });

  const leastPrivileged = [...coverage].sort((a, b) => a.granted - b.granted)[0];

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">RBAC Administration</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Role-to-module authorisation across all six governance domains. Derived directly from the
          navigation architecture — the matrix and the product can never disagree.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard label="Governance Personas" value={DEMO_PERSONAS.length} caption="Distinct governance roles" icon="👤" tone="accent" />
        <KpiCard label="Governed Modules" value={totalModules} caption="Permission-controlled surfaces" icon="🧩" tone="info" />
        <KpiCard label="Governance Domains" value={NAV_DOMAINS.length} caption="Domain-based architecture" icon="🗺️" tone="success" />
        <KpiCard
          label="Least Privileged Role"
          value={leastPrivileged ? `${leastPrivileged.share}%` : '—'}
          caption={leastPrivileged ? leastPrivileged.persona.title : 'No personas defined'}
          icon="🔐"
          tone="warning"
        />
      </div>

      {/* Persona coverage */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Persona Authorisation Coverage"
          subtitle="Proportion of the governance surface each role is authorised to reach."
          icon="📶"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {coverage.map(({ persona, granted, share }) => {
            const isCurrent = currentUser?.role === persona.role;
            return (
              <button
                key={persona.role}
                onClick={() => switchPersona(persona.role)}
                disabled={isReadOnly}
                data-noglass
                title={isReadOnly ? 'Your governance role does not permit changing role assignments.' : `Switch to ${persona.title}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-light)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--accent-border)]'
                } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-base shrink-0" aria-hidden>
                  {persona.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[12.5px] font-bold text-[var(--text-primary)] truncate">
                      {persona.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--accent-primary)] text-white">
                        Active
                      </span>
                    )}
                  </span>
                  <span
                    className="mt-1.5 block h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-sunken)' }}
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${share}%`, background: 'var(--grad-brand)' }}
                    />
                  </span>
                </span>
                <span className="tnum text-[12px] font-extrabold text-[var(--text-primary)] shrink-0 w-16 text-right">
                  {granted}/{totalModules}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Authorisation matrix */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Authorisation Matrix"
          subtitle="Green indicates the persona may open that module. Super Admin holds full authority by design."
          icon="🧬"
          action={
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All governance domains</option>
              {NAV_DOMAINS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[54rem] text-left">
            <thead className="sticky top-0">
              <tr className="border-b border-[var(--border-color)]">
                <th className="pb-2 pr-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  Module
                </th>
                {DEMO_PERSONAS.map(persona => (
                  <th key={persona.role} className="pb-2 px-1.5 text-center">
                    <span className="flex flex-col items-center gap-0.5">
                      <span className="text-[13px]" aria-hidden>
                        {persona.icon}
                      </span>
                      <span className="text-[9px] font-bold text-[var(--text-muted)] leading-tight max-w-[4.5rem]">
                        {persona.title}
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {domains.map(domain => (
                <React.Fragment key={domain.id}>
                  <tr>
                    <td colSpan={DEMO_PERSONAS.length + 1} className="pt-4 pb-1.5">
                      <span className="flex items-center gap-2">
                        <span aria-hidden>{domain.icon}</span>
                        <span
                          className="text-[10px] font-extrabold uppercase tracking-[0.12em]"
                          style={{ color: domain.accent }}
                        >
                          {domain.label}
                        </span>
                        <span className="text-[10px] italic text-[var(--text-muted)]">
                          {domain.question}
                        </span>
                      </span>
                    </td>
                  </tr>

                  {domain.modules.map(module => (
                    <tr
                      key={module.path}
                      className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <td className="py-2 pr-3">
                        <span className="flex items-center gap-2">
                          <span className="text-[12px] w-4 text-center" aria-hidden>
                            {module.icon}
                          </span>
                          <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                            {module.label}
                          </span>
                        </span>
                      </td>

                      {DEMO_PERSONAS.map(persona => {
                        const allowed = grants(persona.role, module.path);
                        return (
                          <td key={persona.role} className="px-1.5 text-center">
                            <span
                              title={`${persona.title} · ${module.label}: ${allowed ? 'authorised' : 'restricted'}`}
                              className="inline-grid place-items-center w-6 h-6 rounded-md text-[11px] font-bold"
                              style={{
                                background: allowed
                                  ? 'var(--status-success-bg)'
                                  : 'var(--status-neutral-bg)',
                                color: allowed
                                  ? 'var(--status-success)'
                                  : 'var(--text-muted)',
                                border: `1px solid ${allowed ? 'var(--status-success-border)' : 'var(--border-subtle)'}`,
                              }}
                            >
                              {allowed ? '✓' : '—'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          Authorisation is enforced at the route boundary. A persona that is not authorised for a
          module cannot reach it by URL — the route renders an RBAC restriction notice and the
          attempt is subject to the same audit trail as any other governance action.
        </p>
      </section>
    </div>
  );
};
